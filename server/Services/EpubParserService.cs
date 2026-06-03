using Librestack.Models;
using Librestack.Interfaces;

using VersOne.Epub;
using VersOne.Epub.Options;

namespace Librestack.Services;

public class EpubParserService : IEpubParseService
{
    public async Task<Library> ParseMetadata(string filePath, string UserId)
    {
        var options = new EpubReaderOptions(EpubReaderOptionsPreset.RELAXED)
        {
            PackageReaderOptions = new PackageReaderOptions()
            {
                IgnoreMissingToc = true,
                SkipInvalidManifestItems = true,
            },
        };
        options.BookCoverReaderOptions.Epub2MetadataIgnoreMissingContentFile = true;
        // options.ContentReaderOptions.ContentFileMissing += (sender, e) =>
        // {
        //     Console.WriteLine($"Content file is missing content file name = '{e.FileName}', content file path in the EPUB archive = '{e.FilePathInEpubArchive}', content type = '{e.ContentType}, MIME type = {e.ContentMimeType}.");
        // };


        try
        {
            var book = await EpubReader.ReadBookAsync(filePath, options) ?? throw new Exception("Failed to Parse Epub File");
            var cover = book.CoverImage;
            var metaData = book.Schema.Package.Metadata;
            return new Library
            {
                UserId = UserId,
                EpubPath = filePath,
                Title = book.Title ?? "Unknown Title",
                Author = book.Author ?? string.Empty,
                CoverImage = cover,
                Publisher = metaData.Publishers.FirstOrDefault()?.Publisher ?? string.Empty,
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
