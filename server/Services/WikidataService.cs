using Librestack.Models;
using Librestack.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Text.Json;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Components.Endpoints;

namespace Librestack.Services;

// * Search URl - https://www.wikidata.org/w/api.php?action=wbsearchentities&search=QUERY&language=en&format=json
// * Id Url - https://www.wikidata.org/wiki/Special:EntityData/Q42.json
//  * Id via ApI https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q42&format=json
//  * The wbgetentities one supports multiple IDs at once (ids=Q42|Q43|Q44).

public class WikidataService : IWikidataService
{
    private readonly LibrestackDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ILogger<LibraryMonitorService> _logger;

    public WikidataService(
            LibrestackDbContext db,
            IHttpClientFactory httpClientFactory,
            UserManager<IdentityUser> userManager,
            ILogger<LibraryMonitorService> logger
            )
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _userManager = userManager;
        _logger = logger;
    }

    private async Task<HttpClient> CreateClient()
    {
        //* Adds identifiers to headers
        var adminUser = await _userManager.GetUsersInRoleAsync("Admin");
        var adminEmail = adminUser.FirstOrDefault()?.Email ?? "librestack";
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.UserAgent.ParseAdd($"Librestack ({adminEmail})");
        return client;
    }

    private string CleanTitle(string title)
    {
        var separators = new[] { "--", "—", ": ", " - " };
        foreach (var sep in separators)
        {
            var idx = title.IndexOf(sep);
            if (idx > 0)
            {
                title = title[..idx];
                break;
            }
        }
        return title.Trim();
    }

    private async Task<Result<Book>> SearchWikidata(Book book)
    {
        // var query = string.IsNullOrEmpty(book.Author) ? book.Title : $"{book.Title} {book.Author}";
        var query = CleanTitle(book.Title);
        var url = $"https://www.wikidata.org/w/api.php?action=wbsearchentities&search={Uri.EscapeDataString(query)}&language=en&type=item&format=json";

        _logger.LogInformation(url);

        var client = await CreateClient();
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return Result<Book>.Failure($"Wikidata Request Failed: {response.StatusCode} - {response.ReasonPhrase}", ErrorType.BadRequest);

        var json = await response.Content.ReadAsStringAsync();
        var root = JsonDocument.Parse(json);

        Console.WriteLine("Search - - ************************************");
        _logger.LogInformation(json);

        var search = root.RootElement.GetProperty("search");

        if (search.GetArrayLength() == 0)
            return Result<Book>.Failure("No Wikidata results found", ErrorType.NotFound);

        var firstResult = search[0];
        var wikiId = firstResult.TryGetProperty("id", out var i) ? i.GetString() : null;

        if (wikiId != null) book.WikiDataIdentifier = wikiId;

        _db.Books.Update(book);
        await _db.SaveChangesAsync();

        return Result<Book>.Success(book);

    }

    // https://www.wikidata.org/wiki/Special:EntityData/q5019811$A922D5DB-9E6E-4E64-9D99-3218A21D57CF.json

    private async Task<Result<Book>> SearchWikidataById(Book book)
    {
        string url = $"https://www.wikidata.org/w/api.php?action=wbgetentities&ids={book.WikiDataIdentifier}&format=json";

        var client = await CreateClient();
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return Result<Book>.Failure($"Wikidata Request Failed: {response.StatusCode} - {response.ReasonPhrase}", ErrorType.BadRequest);

        var json = await response.Content.ReadAsStringAsync();


        Console.WriteLine("By Id - - ************************************");
        _logger.LogInformation("Wikidata Id Response: {Json}", json);

        return Result<Book>.Success(book);
    }

    public async Task<Result> QueryWikidata(string userId, int bookId)
    {
        var book = await _db.Books.FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);
        if (book is null)
            return Result.Failure("Book not found", ErrorType.NotFound);

        if (!string.IsNullOrWhiteSpace(book.WikiDataIdentifier))
        {
            var result = await SearchWikidataById(book);
            if (!result.IsSuccess)
                return Result.Failure(result.Error ?? "Unknown error", ErrorType.Unexpected);
            book = result.Value;
        }
        else
        {
            var result = await SearchWikidata(book);
            if (!result.IsSuccess)
                return Result.Failure(result.Error ?? "Unknown error", ErrorType.Unexpected);
            book = result.Value;
        }

        if (book is null)
            return Result.Failure("Book not found after metadata fetch", ErrorType.Unexpected);

        return Result.Success();
    }
}