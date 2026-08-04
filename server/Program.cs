using System.Text;
using Librestack.Database;
using Librestack.Services;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.SetMinimumLevel(LogLevel.Critical);

builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<LibrestackDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        RefreshBeforeValidation = true,
        ValidIssuer = builder.Configuration.GetValue<string>("JWT_ISSUER") ?? string.Empty,
        ValidAudience = builder.Configuration.GetValue<string>("JWT_AUDIENCE") ?? string.Empty,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration.GetValue<string>("JWT_KEY") ?? throw new InvalidOperationException("JWT_KEY is not configured")))
    };
})
.AddCookie("AdminCookie", options =>
{
    options.LoginPath = "/Login";
    options.AccessDeniedPath = "/Login";
    options.ExpireTimeSpan = TimeSpan.FromHours(8);
});

builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IBookTagService, BookTagService>();
builder.Services.AddScoped<IEpubParseService, EpubParserService>();
builder.Services.AddScoped<IReadingProgressService, ReadingProgressService>();
builder.Services.AddScoped<IBookmarkService, BookmarkService>();
builder.Services.AddScoped<ILibraryService, LibraryService>();
builder.Services.AddScoped<ILibreStackConfigService, LibreStackConfigService>();
builder.Services.AddScoped<IlibraryScanService, LibraryScanService>();
builder.Services.AddScoped<IOpenLibraryService, OpenLibraryService>();
builder.Services.AddScoped<IWikidataService, WikidataService>();
builder.Services.AddScoped<IBookParsingService, BookParsingService>();
builder.Services.AddScoped<IUserSettingsService, UserSettingsService>();
builder.Services.AddScoped<ISeriesService, SeriesService>();
builder.Services.AddScoped<IServerStatsService, ServerStatsService>();

builder.Services.AddHostedService<LibraryMonitorService>();

builder.Services.AddDbContext<LibrestackDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
           .UseSnakeCaseNamingConvention()
);

builder.Services.AddHttpClient();

builder.Services.AddControllers();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        Description = "Enter your JWT token"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", document),
            new List<string>()
        }
    });
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
    {
        policy.AddAuthenticationSchemes("AdminCookie");
        policy.RequireRole("Admin");
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<LibrestackDbContext>();
    db.Database.Migrate();
}

// 1. Seed data (runs once at startup, before pipeline is live)
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    if (!await roleManager.RoleExistsAsync("Admin"))
    {
        await roleManager.CreateAsync(new IdentityRole("Admin"));
    }
}

// 2. Developer/diagnostic middleware
app.UseSwagger();
app.UseSwaggerUI();

// 3. Core pipeline middleware
// app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// 4. Endpoint mappings
app.MapControllers();
app.UseStaticFiles();
app.MapFallbackToFile("index.html");



app.Run();