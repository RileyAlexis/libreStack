using Librestack.Models;
using Librestack.Interfaces;

using VersOne.Epub;
using VersOne.Epub.Options;
using System.Text.RegularExpressions;
using Librestack.Database;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;

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

    private static async Task<string> RepairEpubZipAsync(string filePath)
    {
        var repairedPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid()}.epub");

        var psi = new ProcessStartInfo
        {
            FileName = "zip",
            ArgumentList = { "-FF", "-FF", filePath, "--out", repairedPath },
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
        };

        using var process = Process.Start(psi)
            ?? throw new InvalidOperationException("Failed to start zip repair process");

        // zip -FF sometimes asks "Is this a single-disk archive?" - answer yes
        await process.StandardInput.WriteLineAsync("y");
        process.StandardInput.Close();

        await process.WaitForExitAsync();

        if (!File.Exists(repairedPath) || new FileInfo(repairedPath).Length == 0)
        {
            var stderr = await process.StandardError.ReadToEndAsync();
            throw new InvalidOperationException($"zip -FF failed to repair {Path.GetFileName(filePath)}: {stderr}");
        }

        return repairedPath;
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

        EpubBook book;
        string? tempRepairedPath = null;

        try
        {
            try
            {
                book = await EpubReader.ReadBookAsync(filePath, options)
                    ?? throw new Exception("Failed to Parse Epub File");
            }
            catch (InvalidDataException ex)
            {
                _logger.LogWarning(ex, "Corrupt zip structure in {FilePath}, attempting repair", filePath);
                tempRepairedPath = await RepairEpubZipAsync(filePath);
                book = await EpubReader.ReadBookAsync(tempRepairedPath, options)
                    ?? throw new Exception("Failed to parse EPUB even after repair");
            }

            var cover = book.CoverImage;
            var description = book.Description;
            var metaData = book.Schema.Package.Metadata;
            string filename = Path.GetFileNameWithoutExtension(filePath);
            DateTime? extractedPublishDate = null;

            foreach (var item in metaData.Dates)
            {
                extractedPublishDate = DateTime.Parse(item.Date);
            }

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
                PublishDate = extractedPublishDate?.Year.ToString(),
                OCLCWorldCat = metaData.Identifiers
                    .FirstOrDefault(i => i.Scheme?.ToUpper() == "OCLC")?.Identifier
                    ?? string.Empty,
                ISBN = metaData.Identifiers
                    .FirstOrDefault(i => i.Scheme?.ToUpper() == "ISBN")?.Identifier
                    ?? string.Empty,
                LCCN = metaData.Identifiers
                    .FirstOrDefault(i => i.Scheme?.ToUpper() == "LCCN")?.Identifier,
                AddedDate = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse EPUB at {FilePath}", filePath);
            throw;
        }
        finally
        {
            if (tempRepairedPath is not null && File.Exists(tempRepairedPath))
                File.Delete(tempRepairedPath);
        }
    }
}
