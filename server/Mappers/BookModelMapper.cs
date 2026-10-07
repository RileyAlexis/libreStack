using Librestack.Models;
using Librestack.Models.APIModels;

namespace Librestack.Mappers;

public static class BookModelMapper
{

    public static ApiSeries? SeriesMapper(Series series)
    {
        if (series == null) return null;

        return new ApiSeries
        {
            Id = series.Id,
            SeriesTitle = series.SeriesTitle ?? "",
            SeriesTotal = series.SeriesTotal,
        };
    }

    public static ApiBook ToDto(Book model, bool isShared)
    {
        return new ApiBook
        {
            Id = model.Id,
            UserId = model.UserId,
            Title = model.Title ?? "",
            Author = model.Author ?? "",
            Publisher = model.Publisher ?? "",
            Description = model.Description,
            PublishDate = model.PublishDate,
            CoverImage = model.CoverImage,
            CoverContentType = model.CoverContentType,
            SeriesOrder = model.SeriesOrder,
            ISBN = model.ISBN ?? "",
            ISBN13 = model.ISBN13 ?? "",
            LCCN = model.LCCN,
            OCLCWorldCat = model.OCLCWorldCat,
            OpenLibraryWorkId = model.OpenLibraryWorkId,
            OpenLibraryEditionId = model.OpenLibraryEditionId,
            OpenLibraryAuthorId = model.OpenLibraryAuthorId,
            OpenLibraryCoverId = model.OpenLibraryCoverId,
            WikidataId = model.WikidataId,
            WikidataAuthorId = model.WikidataAuthorId,
            wikiAuthorURL = model.wikiAuthorURL,
            Language = model.Language,
            EpubPath = model.EpubPath,
            OpenLibraryMetadataLastUpdated = model.OpenLibraryMetadataLastUpdated,
            WikidataMetaLastUpdated = model.WikidataMetaLastUpdated,
            AddedDate = model.AddedDate,
            IsShared = isShared,
            Libraries = model.Libraries,
            BookTags = model.BookTags,
            ReadingProgress = model.ReadingProgress,
            Bookmarks = model.Bookmarks,
            Collections = model.Collections,
            SeriesId = model.SeriesId,
            Series = SeriesMapper(model.Series!) ?? null
            // model.Series
        };

        // public static Book FromDTO(ApiBook apiBook)
        // {
        //     return new Book
        //     {
        //         Id = apiBook.Id,
        //         UserId = apiBook.UserId,
        //         Title = apiBook.Title,
        //         Author = apiBook.Author,
        //         Publisher = apiBook.Publisher,
        //         Description = apiBook.Description,
        //         PublishDate = apiBook.PublishDate,
        //         CoverImage = apiBook.CoverImage,
        //         CoverContentType = apiBook.CoverContentType,
        //         SeriesOrder = apiBook.SeriesOrder,
        //         ISBN = apiBook.ISBN ?? "",
        //         ISBN13 = apiBook.ISBN13 ?? "",
        //         LCCN = apiBook.LCCN,
        //         OCLCWorldCat = apiBook.OCLCWorldCat,
        //         OpenLibraryWorkId = apiBook.OpenLibraryWorkId,
        //         OpenLibraryEditionId = apiBook.OpenLibraryEditionId,
        //         OpenLibraryAuthorId = apiBook.OpenLibraryAuthorId,
        //         OpenLibraryCoverId = apiBook.OpenLibraryCoverId,
        //         WikidataId = apiBook.WikidataId,
        //         WikidataAuthorId = apiBook.WikidataAuthorId,
        //         wikiAuthorURL = apiBook.wikiAuthorURL,
        //         Language = apiBook.Language,
        //         EpubPath = "",
        //         OpenLibraryMetadataLastUpdated = apiBook.OpenLibraryMetadataLastUpdated,
        //         WikidataMetaLastUpdated = apiBook.WikidataMetaLastUpdated,
        //         AddedDate = apiBook.AddedDate,
        //         Libraries = apiBook.Libraries,
        //         BookTags = apiBook.BookTags,
        //         ReadingProgress = apiBook.ReadingProgress,
        //         Bookmarks = apiBook.Bookmarks,
        //         Collections = apiBook.Collections,
        //         SeriesId = apiBook.SeriesId,
        //         Series = apiBook.Series
        //     };
        // }
    }
}