using System.Text;
using DotNetEnv;
using Librestack.Database;
using Librestack.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;


Env.Load();

var builder = WebApplication.CreateBuilder(args);

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
        ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
        ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY") ?? throw new InvalidOperationException("JWT_KEY is not configured")))
    };
});

builder.Services.AddScoped<InterfaceLibraryService, LibraryService>();
builder.Services.AddScoped<InterfaceLibraryTagService, LibraryTagService>();
builder.Services.AddScoped<IEpubParseService, EpubParserService>();
builder.Services.AddScoped<IReadingProgressService, ReadingProgressService>();
builder.Services.AddScoped<IBookmarkService, BookmarkService>();

builder.Services.AddDbContext<LibrestackDbContext>(options =>
        options.UseNpgsql(Environment.GetEnvironmentVariable("DEFAULT_CONNECTION"))
        .UseSnakeCaseNamingConvention()
        );

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

var app = builder.Build();

// --- START OF CRITICAL CHANGE ---
// Swagger must be used before authentication middleware
app.UseSwagger();
app.UseSwaggerUI();
// --- END OF CRITICAL CHANGE ---

app.UseHttpsRedirection();

app.UseAuthentication();
// Seed roles and users
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<LibrestackDbContext>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    // Seed Admin Role
    if (!await roleManager.RoleExistsAsync("Admin"))
    {
        await roleManager.CreateAsync(new IdentityRole("Admin"));
    }
}

app.UseAuthorization();

app.MapControllers();

app.Run();