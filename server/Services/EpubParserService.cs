using Librestack.Models;
using Librestack.Interfaces;

using VersOne.Epub;
using VersOne.Epub.Options;
using System.Text.RegularExpressions;
using Librestack.Database;
using Microsoft.EntityFrameworkCore;

namespace Librestack.Services;

public class EpubParserService : IEpubParseService
{
    private readonly ILogger<EpubParserService> _logger;
    private readonly IBookParsingService _bookParser;
    private readonly ISeriesService _seriesService;
    private readonly LibrestackDbContext _db;

    public EpubParserService(
        ILogger<EpubParserService> logger,
        IBookParsingService bookParser,
        ISeriesService seriesService,
        LibrestackDbContext db
        )
    {
        _logger = logger;
        _bookParser = bookParser;
        _seriesService = seriesService;
        _db = db;

    }

    private static string? StripHtml(string? input) =>
        input == null ? null : Regex.Replace(input, "<.*?>", string.Empty).Trim();

    public async Task<Book> ParseMetadata(string filePath, string UserId)
    {
        var libreStackConfig = await _db.LibreStackConfig.FirstAsync();
        var options = new EpubReaderOptions(EpubReaderOptionsPreset.RELAXED)
        {
            PackageReaderOptions = new PackageReaderOptions()
            {
                IgnoreMissingToc = true,
                SkipInvalidManifestItems = true,
            },
        };
        options.BookCoverReaderOptions.Epub2MetadataIgnoreMissingContentFile = true;

        try
        {
            var book = await EpubReader.ReadBookAsync(filePath, options) ?? throw new Exception("Failed to Parse Epub File");
            var cover = book.CoverImage;
            var description = book.Description;
            var metaData = book.Schema.Package.Metadata;
            string filename = Path.GetFileNameWithoutExtension(filePath);

            Series? series = null;
            if (libreStackConfig.AttemptSeriesParsing)
            {

                var parsedSeries = _bookParser.ParseSeries(filename, book.Title);
                _logger.LogInformation("Book Title: {Title}", book.Title);
                _logger.LogInformation("Parsed Title Data: {ParsedTitle}", parsedSeries);

                if (!string.IsNullOrWhiteSpace(parsedSeries.SeriesTitle))
                {
                    series = await _seriesService.ResolveOrCreateSeriesAsync(parsedSeries.SeriesTitle, UserId);
                }
            }

            return new Book
            {
                UserId = UserId,
                EpubPath = filePath,
                Title = book.Title ?? "Unknown Title",
                Author = book.Author ?? string.Empty,
                CoverImage = cover,
                Description = StripHtml(description),
                SeriesId = series?.Id,
                Publisher = metaData.Publishers.FirstOrDefault()?.Publisher ?? string.Empty,
                PublishDate = metaData.Dates.ToString(),
                OCLCWorldCat = metaData.Identifiers
                    .FirstOrDefault(i => i.Scheme?.ToUpper() == "OCLC")?.Identifier
                    ?? string.Empty,
                ISBN = metaData.Identifiers
                    .FirstOrDefault(i => i.Scheme?.ToUpper() == "ISBN")?.Identifier
                    ?? string.Empty,
                LCCN = metaData.Identifiers
                    .FirstOrDefault(i => i.Scheme?.ToUpper() == "LCCN")?.Identifier,
            };
        }
        catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
    }
}
