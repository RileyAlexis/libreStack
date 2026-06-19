
using Librestack.Models;
using Librestack.Database;
using Librestack.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Text.Json;

namespace Librestack.Services;

public class OpenLibraryService : IOpenLibraryService
{
    private readonly LibrestackDbContext _db;
    private readonly IEpubParseService _epubParser;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly UserManager<IdentityUser> _userManager;

    public OpenLibraryService(
        LibrestackDbContext db,
        IEpubParseService epubParser,
        IHttpClientFactory httpClientFactory,
        UserManager<IdentityUser> userManager)
    {
        _db = db;
        _epubParser = epubParser;
        _httpClientFactory = httpClientFactory;
        _userManager = userManager;
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

    private async Task<Result<Book>> CallByISBN(string userId, Book book)
    {
        string url = $"https://openlibrary.org/api/books?bibkeys=ISBN:{book.ISBN}&format=json&jscmd=data";
        var client = await CreateClient();

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

        var oclc = root.TryGetProperty("identifiers", out var idents3) &&
            idents3.TryGetProperty("oclc", out var idents13) &&
            idents13.GetArrayLength() > 0 ? idents13[0].GetString() : null;

        var publishDate = root.TryGetProperty("publish_date", out var publish) ? publish.GetString() : null;

        var publisher = root.TryGetProperty("publishers", out var publishersData) &&
            publishersData[0].TryGetProperty("name", out var pubArray) ? pubArray.GetString() : null;

        if (title != null) book.Title = title;
        if (author != null) book.Author = author;
        if (authorId != null) book.OpenLibraryAuthorId = authorId;
        if (workId != null) book.OpenLibraryWorkId = workId;
        if (isbn13 != null) book.ISBN = isbn13;
        if (oclc != null) book.OCLCWorldCat = oclc;
        if (publishDate != null) book.PublishDate = publishDate;
        if (publisher != null) book.Publisher = publisher;

        _db.Books.Update(book);
        await _db.SaveChangesAsync();
        return Result<Book>.Success(book);
    }

    private async Task<Result<Book>> CallByOpenLibraryWorkId(string userId, Book book)
    {
        string url = $"https://openlibrary.org/books/{book.OpenLibraryWorkId}.json";
        var client = await CreateClient();
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
        Console.WriteLine(json);

        var title = root.TryGetProperty("title", out var t) ? t.GetString() : null;

        var series = root.TryGetProperty("series", out var s)
            && s.GetArrayLength() > 0 ? s[0].GetString() : null;

        var wikiData = (root.TryGetProperty("identifiers", out var ident) &&
            ident.TryGetProperty("wikidata", out var wik) &&
            wik.GetArrayLength() > 0) ? wik[0].GetString() : null;

        Console.WriteLine("************************************");
        Console.WriteLine(wikiData);

        var isbn10 = root.TryGetProperty("isbn_10", out var i)
            && i.GetArrayLength() > 0 ? i[0].GetString() : null;

        var isbn13 = root.TryGetProperty("isbn_13", out var i13)
            && i13.GetArrayLength() > 0 ? i13[0].GetString() : null;

        var lccn = root.TryGetProperty("lccn", out var ic)
            && ic.GetArrayLength() > 0 ? ic[0].GetString() : null;

        var description = root.TryGetProperty("description", out var desc)
            && desc.TryGetProperty("value", out var val) ? val.GetString() : null;

        var publishDate = root.TryGetProperty("publish_date", out var pub) ? pub.GetString() : null;

        if (title != null) book.Title = title;
        if (series != null) book.SeriesTitle = series;
        if (wikiData != null) book.WikiDataIdentifier = wikiData;
        if (description != null) book.Description = description;
        if (publishDate != null) book.PublishDate = publishDate;
        if (isbn10 != null) book.ISBN = isbn10;
        if (isbn13 != null) book.ISBN13 = isbn13;
        if (lccn != null) book.LCCN = lccn;

        _db.Books.Update(book);
        await _db.SaveChangesAsync();
        return Result<Book>.Success(book);

    }

    private async Task<Result<Book>> CallByTitleAndAuthor(string userId, Book book)
    {
        string url = $"https://openlibrary.org/search.json?title={Uri.EscapeDataString(book.Title)}&author={Uri.EscapeDataString(book.Author)}&limit=1";
        var client = await CreateClient();
        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return Result<Book>
                .Failure($"Open Library Request Failed: {response.StatusCode} - {response.ReasonPhrase}", ErrorType.Unexpected);

        throw new NotImplementedException();
    }


    public async Task<Result> QueryOpenLibrary(string userId, int bookId)
    {
        var book = await _db.Books.FirstOrDefaultAsync(b => b.Id == bookId && b.UserId == userId);
        if (book is null)
            return Result.Failure("Book not found", ErrorType.NotFound);

        if (!string.IsNullOrWhiteSpace(book.OpenLibraryWorkId))
        {
            var resultBook = await CallByOpenLibraryWorkId(userId, book);
            if (resultBook is null)
                return Result.Failure("Done Broke More", ErrorType.Unexpected);

            return Result.Success();
        }

        if (!string.IsNullOrWhiteSpace(book.ISBN) && !string.IsNullOrEmpty(book.ISBN))
        {

            var resultBook = await CallByISBN(userId, book);
            if (resultBook is null)
                return Result.Failure("Done broke good", ErrorType.Unexpected);

            return Result.Success();
        }
        else return Result.Failure("No ISBN", ErrorType.NotFound);
        // var client = await CreateClient();

        // string url = $"https://openlibrary.org/api/books?bibkeys=ISBN:{book.ISBN}&format=json&jscmd=data";
        // var response = await client.GetAsync(url);
        // var json = await response.Content.ReadAsStringAsync();
        // Console.WriteLine(json);










    }
}