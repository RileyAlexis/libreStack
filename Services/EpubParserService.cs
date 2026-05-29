using Librestack.Models;
using VersOne.Epub;

public class EpubParserService : IEpubParseService
{
    public async Task<Library> ParseMetadata(string filePath, string UserId)
    {
        var book = await EpubReader.ReadBookAsync(filePath);
        var metaData = book.Schema.Package.Metadata;

        return new Library
        {
            UserId = UserId,
            EpubPath = filePath,

            // Use the top-level string properties — not the raw schema objects
            Title = book.Title ?? "Unknown Title",
            Author = book.Author ?? string.Empty,

            // Schema objects do have a clean string property — .Name for creator, .Publisher for publisher
            Publisher = metaData.Publishers.FirstOrDefault()?.Publisher ?? string.Empty,
            ISBN = metaData.Identifiers
                        .FirstOrDefault(i => i.Scheme?.ToUpper() == "ISBN")?.Identifier
                        ?? string.Empty,
            LCCN = metaData.Identifiers
                        .FirstOrDefault(i => i.Scheme?.ToUpper() == "LCCN")?.Identifier,
        };
    }
}
