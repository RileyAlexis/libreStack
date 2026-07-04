
using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Text.Json;
using Microsoft.VisualBasic;

namespace Librestack.Services;

public class OpenLibraryService : IOpenLibraryService
{
    private readonly LibrestackDbContext _db;
    private readonly IEpubParseService _epubParser;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IBookParsingService _bookParsing;
    private readonly ISeriesService _seriesService;
    private readonly ILogger<LibraryMonitorService> _logger;
    private static readonly SemaphoreSlim _rateLimiter = new(1, 1);


    public OpenLibraryService(
        LibrestackDbContext db,
        IEpubParseService epubParser,
        IHttpClientFactory httpClientFactory,
        UserManager<IdentityUser> userManager,
        IBookParsingService bookParsing,
        ISeriesService seriesService,
        ILogger<LibraryMonitorService> logger
        )
    {
        _db = db;
        _epubParser = epubParser;
        _httpClientFactory = httpClientFactory;
        _userManager = userManager;
        _bookParsing = bookParsing;
        _seriesService = seriesService;
        _logger = logger;
    }


    private static async Task RateLimit()
    {
        await _rateLimiter.WaitAsync();
        try
        {
            await Task.Delay(350); // ~3 requests per second
        }
        finally
        {
            _rateLimiter.Release();
        }
    }

    private async Task<HttpClient> CreateClient()
    {
        //* Adds identifiers to headers per Open Library documentation
        //* Adding the email increases the rate limit to 3/second from only 1/second
        var adminUser = await _userManager.GetUsersInRoleAsync("Admin");
        var adminEmail = adminUser.FirstOrDefault()?.Email ?? "librestack";
        var client = _httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.UserAgent.ParseAdd($"Librestack ({adminEmail})");
        return client;
    }

    private async Task<Result<Book>> CallByISBN(Book book)
    {
        string url = $"https://openlibrary.org/api/works?bibkeys=ISBN:{book.ISBN}&format=json&jscmd=data";
        var client = await CreateClient();

        await RateLimit();
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return Result<Book>
                .Failure($"Open Library Request Failed: {response.StatusCode} - {response.ReasonPhrase}", ErrorType.Unexpected);

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var root = doc.RootElement.EnumerateObject().FirstOrDefault().Value;
        if (root.ValueKind == JsonValueKind.Undefined)
            return Result<Book>.Failure("No Results Found", ErrorType.NotFound);

        var title = root.TryGetProperty("title", out var t) ? t.GetString() : null;

        var series = root.TryGetProperty("series", out var s)
            && s.GetArrayLength() > 0 ? s[0].GetString() : null;

        var workId = root.TryGetProperty("identifiers", out var idents) &&
           idents.TryGetProperty("openlibrary", out var w) &&
           w.GetArrayLength() > 0 ? w[0].GetString() : null;

        var isbn13 = root.TryGetProperty("identifiers", out var idents2) &&
            idents2.TryGetProperty("isbn_13", out var ident13) &&
            ident13.GetArrayLength() > 0 ? ident13[0].GetString() : null;

        var author = root.TryGetProperty("authors", out var auths) &&
            auths[0].TryGetProperty("name", out var authName) ? authName.GetString() : null;

        var authorUrl = root.TryGetProperty("authors", out var auths2) &&
            auths2[0].TryGetProperty("url", out var authUrl) ? authUrl.GetString() : null;

        var authorId = authorUrl != null
            ? authorUrl.Split('/').FirstOrDefault(s => s.StartsWith("OL") && s.EndsWith("A"))
            : null;

        var description = root.TryGetProperty("description", out var desc)
            ? desc.ValueKind == JsonValueKind.String
                ? desc.GetString()
                : desc.TryGetProperty("value", out var val) ? val.GetString() : null
            : null;

        var coverId = root.TryGetProperty("covers", out var cv)
            && cv.ValueKind == JsonValueKind.Array
            && cv.GetArrayLength() > 0
            && cv[0].ValueKind == JsonValueKind.Number
            && cv[0].GetInt32() > 0
                ? cv[0].GetInt32().ToString()
                : null;

        var oclc = root.TryGetProperty("identifiers", out var idents3) &&
            idents3.TryGetProperty("oclc", out var idents13) &&
            idents13.GetArrayLength() > 0 ? idents13[0].GetString() : null;

        var publishDate = root.TryGetProperty("publish_date", out var publish) ? publish.GetString() : null;

        var publisher = root.TryGetProperty("publishers", out var publishersData) &&
            publishersData[0].TryGetProperty("name", out var pubArray) ? pubArray.GetString() : null;

        if (title != null && string.IsNullOrWhiteSpace(book.Title)) book.Title = title;
        if (author != null && string.IsNullOrWhiteSpace(book.Author)) book.Author = author;
        if (authorId != null) book.OpenLibraryAuthorId = authorId;
        if (description != null) book.Description = description;
        if (coverId != null) book.OpenLibraryCoverId = coverId;
        if (series != null)
        {
            var apiSeries = _bookParsing.NormalizeSeriesTitle(series);
            var seriesObject = await _seriesService.ResolveOrCreateSeriesAsync(apiSeries!, book.UserId);
            var order = _bookParsing.ParseSeriesOrderFromLabel(series ?? "");
            book.Series = seriesObject;
            book.SeriesOrder = order;
            book.Series.UserId = book.UserId;
        }
        if (workId != null) book.OpenLibraryWorkId = workId;
        if (isbn13 != null) book.ISBN = isbn13;
        if (oclc != null) book.OCLCWorldCat = oclc;
        if (publishDate != null) book.PublishDate = publishDate;
        if (publisher != null) book.Publisher = publisher;

        book.OpenLibraryMetadataLastUpdated = DateTime.UtcNow;

        _db.Books.Update(book);
        await _db.SaveChangesAsync();
        return Result<Book>.Success(book);
    }

    private async Task<Result<Book>> CallByOpenLibraryWorkId(Book book)
    {
        string url = $"https://openlibrary.org/works/{book.OpenLibraryWorkId}.json";
        var client = await CreateClient();


        await RateLimit();
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return Result<Book>
                .Failure($"Open Library Request Failed: {response.StatusCode} - {response.ReasonPhrase}", ErrorType.Unexpected);

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        if (root.ValueKind == JsonValueKind.Undefined)
            return Result<Book>.Failure("No Results Found", ErrorType.NotFound);

        Console.WriteLine("************************************");
        Console.WriteLine($"------------------- {url}");
        Console.WriteLine("************************************");
        Console.WriteLine(json);

        var title = root.TryGetProperty("title", out var t) ? t.GetString() : null;

        var series = root.TryGetProperty("series", out var s) && s.GetArrayLength() > 0
            ? s[0].ValueKind == JsonValueKind.String
                ? s[0].GetString()
                : s[0].TryGetProperty("series", out var seriesObj) && seriesObj.TryGetProperty("key", out var seriesKey)
                    ? seriesKey.GetString()?.Split('/').Last()
                    : null
            : null;

        var seriesPosition = root.TryGetProperty("series", out var sp) && sp.GetArrayLength() > 0
            && sp[0].TryGetProperty("position", out var pos)
            ? pos.GetString()
            : null;

        string? seriesName = null;
        string seriesURl = $"https://openlibrary.org/series/{series}.json";
        await RateLimit();
        var seriesResponse = await client.GetAsync(seriesURl);
        if (seriesResponse.IsSuccessStatusCode)
        {
            var seriesJson = await seriesResponse.Content.ReadAsStringAsync();
            var seriesDoc = JsonDocument.Parse(seriesJson);
            var seriesRoot = seriesDoc.RootElement;
            if (seriesRoot.ValueKind != JsonValueKind.Undefined)
                seriesName = seriesRoot.TryGetProperty("name", out var name) ? name.GetString() : null;
        }

        var wikiData = (root.TryGetProperty("identifiers", out var ident) &&
            ident.TryGetProperty("wikidata", out var wik) &&
            wik.GetArrayLength() > 0) ? wik[0].GetString() : null;

        var isbn10 = root.TryGetProperty("isbn_10", out var i)
            && i.GetArrayLength() > 0 ? i[0].GetString() : null;

        var isbn13 = root.TryGetProperty("isbn_13", out var i13)
            && i13.GetArrayLength() > 0 ? i13[0].GetString() : null;

        var lccn = root.TryGetProperty("lccn", out var ic)
            && ic.GetArrayLength() > 0 ? ic[0].GetString() : null;

        var description = root.TryGetProperty("description", out var desc)
            ? desc.ValueKind == JsonValueKind.String
                ? desc.GetString()
                : desc.TryGetProperty("value", out var val) ? val.GetString() : null
            : null;

        var coverId = root.TryGetProperty("covers", out var cv)
            && cv.ValueKind == JsonValueKind.Array
            && cv.GetArrayLength() > 0
            && cv[0].ValueKind == JsonValueKind.Number
            && cv[0].GetInt32() > 0
                ? cv[0].GetInt32().ToString()
                : null;

        var publishDate = root.TryGetProperty("publish_date", out var pub) ? pub.GetString() : null;

        if (title != null && string.IsNullOrWhiteSpace(book.Title)) book.Title = title;
        if (seriesName != null)
        {
            var apiSeries = _bookParsing.NormalizeSeriesTitle(seriesName);
            var seriesObject = await _seriesService.ResolveOrCreateSeriesAsync(apiSeries!, book.UserId);
            var order = _bookParsing.ParseSeriesOrderFromLabel(seriesPosition ?? "");
            book.Series = seriesObject;
            book.SeriesOrder = order;
            book.Series.UserId = book.UserId;
        }
        if (seriesPosition != null)
            book.SeriesOrder = int.TryParse(seriesPosition, out var order) ? order : null;
        if (wikiData != null) book.WikidataId = wikiData;
        if (description != null) book.Description = description;
        if (coverId != null) book.OpenLibraryCoverId = coverId;
        if (publishDate != null) book.PublishDate = publishDate;
        if (isbn10 != null) book.ISBN = isbn10;
        if (isbn13 != null) book.ISBN13 = isbn13;
        if (lccn != null) book.LCCN = lccn;

        book.OpenLibraryMetadataLastUpdated = DateTime.UtcNow;

        _db.Books.Update(book);
        await _db.SaveChangesAsync();
        return Result<Book>.Success(book);

    }

    private async Task<Result<Book>> CallByTitleAndAuthor(Book book)
    {
        var searchTitle = _bookParsing.CleanTitle(book.Title);
        _logger.LogInformation($"Searching Open Library for id {book.Id} - {book.Title} - Cleaned Title {searchTitle}");
        string url = $"https://openlibrary.org/search.json?title={Uri.EscapeDataString(searchTitle)}&author={Uri.EscapeDataString(book.Author)}&limit=1";
        var client = await CreateClient();

        await RateLimit();
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return Result<Book>
                .Failure($"Open Library Request Failed: {response.StatusCode} - {response.ReasonPhrase}", ErrorType.Unexpected);

        var json = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(json);
        var basic = doc.RootElement;
        var docs = basic.GetProperty("docs");
        if (docs.GetArrayLength() == 0)
            return Result<Book>.Failure("No Results Found", ErrorType.NotFound);

        var root = docs[0];

        var title = root.TryGetProperty("title", out var t) ? t.GetString() : null;

        var series = root.TryGetProperty("series", out var s)
            && s.GetArrayLength() > 0 ? s[0].GetString() : null;

        var wikiData = (root.TryGetProperty("identifiers", out var ident) &&
            ident.TryGetProperty("wikidata", out var wik) &&
            wik.GetArrayLength() > 0) ? wik[0].GetString() : null;

        var isbn10 = root.TryGetProperty("isbn_10", out var i)
            && i.GetArrayLength() > 0 ? i[0].GetString() : null;

        var isbn13 = root.TryGetProperty("isbn_13", out var i13)
            && i13.GetArrayLength() > 0 ? i13[0].GetString() : null;

        var lccn = root.TryGetProperty("lccn", out var ic)
            && ic.GetArrayLength() > 0 ? ic[0].GetString() : null;

        var description = root.TryGetProperty("description", out var desc)
            ? desc.ValueKind == JsonValueKind.String
                ? desc.GetString()
                : desc.TryGetProperty("value", out var val) ? val.GetString() : null
            : null;

        var coverId = root.TryGetProperty("covers", out var cv)
            && cv.ValueKind == JsonValueKind.Array
            && cv.GetArrayLength() > 0
            && cv[0].ValueKind == JsonValueKind.Number
            && cv[0].GetInt32() > 0
                ? cv[0].GetInt32().ToString()
                : null;

        var publishDate = root.TryGetProperty("publish_date", out var pub) ? pub.GetString() : null;

        var authorKey = (root.TryGetProperty("author_key", out var ak) && ak.GetArrayLength() > 0) ? ak[0].GetString() : null;
        var workKey = root.TryGetProperty("key", out var k) ? k.GetString()?.Replace("/works/", "") : null;

        if (title != null && string.IsNullOrWhiteSpace(book.Title)) book.Title = title;
        if (authorKey != null && string.IsNullOrWhiteSpace(book.Author)) book.OpenLibraryAuthorId = authorKey;
        if (workKey != null) book.OpenLibraryWorkId = workKey;
        if (wikiData != null) book.WikidataId = wikiData;
        if (series != null)
        {
            var apiSeries = _bookParsing.NormalizeSeriesTitle(series);
            var seriesObject = await _seriesService.ResolveOrCreateSeriesAsync(apiSeries!, book.UserId);
            var order = _bookParsing.ParseSeriesOrderFromLabel(series ?? "");
            book.Series = seriesObject;
            book.SeriesOrder = order;
            book.Series.UserId = book.UserId;
        }
        if (description != null) book.Description = description;
        if (coverId != null) book.OpenLibraryCoverId = coverId;
        if (publishDate != null) book.PublishDate = publishDate;
        if (isbn10 != null) book.ISBN = isbn10;
        if (isbn13 != null) book.ISBN13 = isbn13;
        if (lccn != null) book.LCCN = lccn;

        book.OpenLibraryMetadataLastUpdated = DateTime.UtcNow;

        _db.Books.Update(book);
        await _db.SaveChangesAsync();
        return Result<Book>.Success(book);

    }


    public async Task<Result> QueryOpenLibrary(string userId, int bookId)
    {
        var book = await _db.Books.FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);
        if (book is null)
            return Result.Failure("Book not found", ErrorType.NotFound);

        if (string.IsNullOrWhiteSpace(book.OpenLibraryWorkId))
        {
            if (!string.IsNullOrWhiteSpace(book.ISBN))
            {
                var isbnResult = await CallByISBN(book);
                if (!isbnResult.IsSuccess)
                    return Result.Failure(isbnResult.Error ?? "Unknown error", ErrorType.Unexpected);
                book = isbnResult.Value;
            }
            else
            {
                var searchResult = await CallByTitleAndAuthor(book);
                if (!searchResult.IsSuccess)
                    return Result.Failure(searchResult.Error ?? "Unknown error", ErrorType.Unexpected);
                book = searchResult.Value;
            }
        }

        if (book is null)
            return Result.Failure("Book not found after metadata fetch", ErrorType.Unexpected);

        if (!string.IsNullOrWhiteSpace(book.OpenLibraryWorkId))
        {
            var workResult = await CallByOpenLibraryWorkId(book);
            if (!workResult.IsSuccess)
                return Result.Failure(workResult.Error ?? "Unknown error", ErrorType.Unexpected);
        }

        return Result.Success();
    }

    public async Task<Result> RefreshOpenLibrarydata(string userId, int libraryId)
    {
        var library = await _db.Libraries
            .Include(b => b.Books)
            .FirstOrDefaultAsync(l => l.Id == libraryId && l.UserId == userId);

        if (library is null)
            return Result.Failure("Library not found", ErrorType.NotFound);

        var cutoff = DateTime.UtcNow.AddMonths(-1);
        var booksToUpdate = library.Books
            .Where(b => b.OpenLibraryMetadataLastUpdated == DateTime.MinValue ||
                        b.OpenLibraryMetadataLastUpdated == DateTime.MaxValue ||
                        b.OpenLibraryMetadataLastUpdated < cutoff)
            .ToList();

        var errors = new List<string>();

        foreach (var book in booksToUpdate)
        {
            var result = await QueryOpenLibrary(userId, book.Id);
            if (!result.IsSuccess)
                errors.Add($"{book.Title}: {result.Error}");
        }

        return errors.Count == 0
            ? Result.Success()
            : Result.Failure($"Some books failed to update: {string.Join("; ", errors)}", ErrorType.BadRequest);

    }

    public async Task<Result> FetchBookCover(string userId, int bookId)
    {
        var book = await _db.Books.FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);
        if (book is null)
            return Result.Failure("Book Not Found", ErrorType.NotFound);

        string searchBy;
        string dataPoint = book.OpenLibraryCoverId ?? book.OpenLibraryWorkId ?? string.Empty;

        if (string.IsNullOrEmpty(dataPoint))
            return Result.Failure("Open Library Ids not found", ErrorType.NotFound);

        if (book.OpenLibraryCoverId is null)
            searchBy = "olid";
        else
            searchBy = "id";

        var url = $"https://covers.openlibrary.org/b/{searchBy}/{book.OpenLibraryCoverId}-L.jpg?default=false";

        _logger.LogInformation($"Fetching Open Library Cover at {url}");

        var client = await CreateClient();
        await RateLimit();

        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return Result.Failure(
                $"Open Library Request Failed: {response.StatusCode} - {response.ReasonPhrase}",
                ErrorType.Unexpected);

        var imageBytes = await response.Content.ReadAsByteArrayAsync();
        if (imageBytes.Length == 0)
            return Result.Failure("Open Library returned an empty image.", ErrorType.Unexpected);

        book.CoverImage = imageBytes;
        await _db.SaveChangesAsync();

        return Result.Success();
    }
}