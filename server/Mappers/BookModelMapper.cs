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
            Title = model.Title ?? "",
            Author = model.Author ?? "",
            Publisher = model.Publisher ?? "",
            Description = model.Description,
            PublishDate = model.PublishDate,
            CoverImage = model.CoverImage,
            CoverContentType = model.CoverContentType,
            SeriesOrder = model.SeriesOrder,
            Isbn = model.ISBN ?? "",
            Isbn13 = model.ISBN13 ?? "",
            LCCN = model.LCCN,
            OCLCWorldCat = model.OCLCWorldCat,
            OpenLibraryWorkId = model.OpenLibraryWorkId,
            OpenLibraryEditionId = model.OpenLibraryEditionId,
            OpenLibraryAuthorId = model.OpenLibraryAuthorId,
            OpenLibraryCoverId = model.OpenLibraryCoverId,
            WikidataId = model.WikidataId,
            WikidataAuthorId = model.WikidataAuthorId,
            WikiAuthorURL = model.WikiAuthorURL,
            Language = model.Language,

            OpenLibraryMetadataLastUpdated = model.OpenLibraryMetadataLastUpdated,
            WikidataMetaLastUpdated = model.WikidataMetaLastUpdated,
            AddedDate = model.AddedDate,
            IsShared = isShared,
            Libraries = model.Libraries,
            BookTags = model.BookTags,
            ReadingProgress = model.ReadingProgress.FirstOrDefault(),
            Bookmarks = model.Bookmarks,
            Collections = model.Collections,
            SeriesId = model.SeriesId,
            Series = SeriesMapper(model.Series!) ?? null
        };
    }
}