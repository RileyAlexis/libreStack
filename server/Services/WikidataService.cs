using Librestack.Models;
using Librestack.Database;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Text.Json;
using Librestack.Interfaces;
using Microsoft.AspNetCore.Components.Endpoints;
using System.Globalization;
using System.Security.Cryptography.X509Certificates;
using System.Text.RegularExpressions;

namespace Librestack.Services;

// * Search URl - https://www.wikidata.org/w/api.php?action=wbsearchentities&search=QUERY&language=en&format=json
// * Id Url - https://www.wikidata.org/wiki/Special:EntityData/Q42.json
//  * Id via ApI https://www.wikidata.org/w/api.php?action=wbgetentities&ids=Q42&format=json
//  * The wbgetentities one supports multiple IDs at once (ids=Q42|Q43|Q44).
//  * SPARQL query https://query.wikidata.org/sparql?query=YOUR_SPARQL&format=json

public class WikidataService : IWikidataService
{
    private readonly LibrestackDbContext _db;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly ILogger<LibraryMonitorService> _logger;
    private readonly IBookParsingService _bookParsing;

    public WikidataService(
            LibrestackDbContext db,
            IHttpClientFactory httpClientFactory,
            UserManager<IdentityUser> userManager,
            ILogger<LibraryMonitorService> logger,
            IBookParsingService bookParsing
            )
    {
        _db = db;
        _httpClientFactory = httpClientFactory;
        _userManager = userManager;
        _logger = logger;
        _bookParsing = bookParsing;
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

    private async Task<Result<Book>> SearchWikidata(Book book)
    {
        var query = string.IsNullOrEmpty(book.Author)
            ? _bookParsing.CleanTitle(book.Title)
            : $"{_bookParsing.CleanTitle(book.Title)} {book.Author}";

        var url = $"https://www.wikidata.org/w/api.php?action=wbsearchentities&search={Uri.EscapeDataString(query)}&language=en&type=item&format=json&limit=10";
        _logger.LogInformation(url);

        var client = await CreateClient();
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return Result<Book>.Failure($"Wikidata Request Failed: {response.StatusCode} - {response.ReasonPhrase}", ErrorType.BadRequest);

        var json = await response.Content.ReadAsStringAsync();
        var root = JsonDocument.Parse(json);
        var search = root.RootElement.GetProperty("search");

        if (search.GetArrayLength() == 0)
            return Result<Book>.Failure("No Wikidata results found", ErrorType.NotFound);

        string[] BookDescriptionKeywords = ["novel", "book", "short story", "novella", "anthology", "collection", "nonfiction", "non-fiction", "memoir", "biography", "essay", "hardcover", "paperback"];

        JsonElement? bestMatch = null;
        foreach (var item in search.EnumerateArray())
        {
            var description = item.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "";
            if (BookDescriptionKeywords.Any(k => description.Contains(k, StringComparison.OrdinalIgnoreCase)))
            {
                bestMatch = item;
                break;
            }
        }

        // Fall back to first result if no book-like description matched
        bestMatch ??= search[0];

        var wikiId = bestMatch.Value.TryGetProperty("id", out var i) ? i.GetString() : null;
        if (wikiId != null) book.WikidataId = wikiId;
        book.WikidataMetaLastUpdated = DateTime.UtcNow;
        _db.Books.Update(book);
        await _db.SaveChangesAsync();
        return Result<Book>.Success(book);
    }

    private string? GetBindingValue(JsonElement binding, string key)
    {
        if (binding.TryGetProperty(key, out var prop))
            return prop.GetProperty("value").GetString();
        return null;
    }

    // https://www.wikidata.org/wiki/Special:EntityData/Q6142591.json

    private async Task<Result<Book>> QueryWikidataById(Book book)
    {
        if (string.IsNullOrWhiteSpace(book.WikidataId))
            return Result<Book>.Failure("Wiki Id not in database", ErrorType.NotFound);

        Console.WriteLine("_________________________________________________ BY ID");


        var sparql = "SELECT ?title ?authorLabel ?publicationDate ?genreLabel ?seriesLabel ?positionInSeries ?openLibraryId ?oclcId ?isfd ?uncon ?website ?fantLab " +
                     "WHERE { " +
                     $"BIND(wd:{book.WikidataId} AS ?book) " +
                     "OPTIONAL { ?book wdt:P1476 ?title. FILTER(LANG(?title) = \"en\") } " +
                     "OPTIONAL { ?book wdt:P50 ?author } " +
                     "OPTIONAL { ?book wdt:P577 ?publicationDate } " +
                     "OPTIONAL { ?book wdt:P136 ?genre } " +
                     "OPTIONAL { ?book wdt:P179 ?series } " +
                     "OPTIONAL { ?book p:P179 ?seriesStatement. ?seriesStatement pq:P1545 ?positionInSeries } " +
                     "OPTIONAL { ?book wdt:P648 ?openLibraryId } " +
                     "OPTIONAL { ?book wdt:P243 ?oclcId } " +
                     "OPTIONAL { ?book wdt:P1274 ?isfc } " +
                     "OPTIONAL { ?book wdt:P9821 ?uncon } " +
                     "OPTIONAL { ?book wdt:P856 ?website } " +
                     "OPTIONAL { ?book wdt:P7439 ?fantLab } " +
                     "SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\". } " +
                     "}";

        var url = $"https://query.wikidata.org/sparql?query={Uri.EscapeDataString(sparql)}&format=json";

        Console.WriteLine(url);

        var client = await CreateClient();
        client.DefaultRequestHeaders.Add("Accept", "application/sparql-results+json");

        var response = await client.GetAsync(url);
        var json = await response.Content.ReadAsStringAsync();
        var root = JsonDocument.Parse(json);
        var binding = root.RootElement
            .GetProperty("results")
            .GetProperty("bindings")[0];

        var title = GetBindingValue(binding, "title");
        var author = GetBindingValue(binding, "authorLabel");
        var genre = GetBindingValue(binding, "genreLabel");
        var oclc = GetBindingValue(binding, "oclcId");
        var isfd = GetBindingValue(binding, "isfd");
        var unconsent = GetBindingValue(binding, "uncon");
        var website = GetBindingValue(binding, "website");
        var fantLab = GetBindingValue(binding, "fantLab");
        var series = GetBindingValue(binding, "seriesLabel");
        var position = GetBindingValue(binding, "positionInSeries");
        var openLibraryId = GetBindingValue(binding, "openLibraryId");
        var publicationDate = GetBindingValue(binding, "publicationDate");

        if (title != null && string.IsNullOrWhiteSpace(book.Title)) book.Title = title;
        if (author != null && string.IsNullOrWhiteSpace(book.Author)) book.Author = author;
        if (series != null)
        {
            book.SeriesTitle = _bookParsing.NormalizeSeriesTitle(series);
            var order = _bookParsing.ParseSeriesOrderFromLabel(position ?? "");
            book.SeriesOrder = order;
        }
        if (openLibraryId != null) book.OpenLibraryWorkId = openLibraryId;
        if (oclc != null) book.OCLCWorldCat = oclc;
        if (publicationDate != null) book.PublishDate = publicationDate;

        book.WikidataMetaLastUpdated = DateTime.UtcNow;

        _db.Books.Update(book);
        await _db.SaveChangesAsync();

        return Result<Book>.Success(book);

    }

    public async Task<Result> QueryWikidata(string userId, int bookId)
    {
        var book = await _db.Books.FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);
        if (book is null)
            return Result.Failure("Book not found", ErrorType.NotFound);

        if (!string.IsNullOrWhiteSpace(book.WikidataId))
        {
            var result = await QueryWikidataById(book);
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

        if (!string.IsNullOrWhiteSpace(book.WikidataId))
        {
            var workResult = await QueryWikidataById(book);
            if (!workResult.IsSuccess)
                return Result.Failure(workResult.Error ?? "Unknown Error", ErrorType.Unexpected);
        }

        return Result.Success();
    }

    public async Task<Result> RefreshWikidata(string userId, int libraryId)
    {
        var library = await _db.Libraries.Include(b => b.Books).FirstOrDefaultAsync(l => l.Id == libraryId && l.UserId == userId);
        if (library is null)
            return Result.Failure("Library not found", ErrorType.NotFound);

        var cutoff = DateTime.UtcNow.AddMonths(-1);
        var booksToUpdate = library.Books
            .Where(b => b.WikidataMetaLastUpdated == DateTime.MinValue ||
                        b.WikidataMetaLastUpdated == DateTime.MaxValue ||
                        b.WikidataMetaLastUpdated < cutoff)
            .ToList();

        var errors = new List<string>();

        foreach (var book in booksToUpdate)
        {
            var result = await QueryWikidata(userId, book.Id);
            if (!result.IsSuccess)
                errors.Add($"{book.Title}: {result.Error}");
        }

        return errors.Count == 0
            ? Result.Success()
            : Result.Failure($"Some books failed to update: {string.Join("; ", errors)}", ErrorType.BadRequest);

    }


}