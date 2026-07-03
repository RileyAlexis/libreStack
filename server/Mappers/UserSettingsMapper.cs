using Librestack.Models;
using Librestack.Models.APIModels;

public static class UserSettingsMapper
{
    public static UserSettings FromDto(ApiUserSettings dto, string userId) => new()
    {
        UserId = userId,
        ShowLibraryAsHome = dto.ShowLibraryAsHome,
        ReadingTheme = dto.ReadingTheme,
        Spread = dto.Spread,
        ReadingFontLabel = dto.ReadingFont.Label,
        ReadingFontValue = dto.ReadingFont.Value,
        ReadingFontSize = dto.ReadingFontSize,
        LineHeight = dto.LineHeight,
        LibraryBase = dto.LibraryLayout.Base,
        ShowTitles = dto.LibraryLayout.ShowTitles,
        ShowAuthors = dto.LibraryLayout.ShowAuthors,
        ShowSeries = dto.LibraryLayout.ShowSeries,
        ShowCollections = dto.LibraryLayout.ShowCollections,
        ShowCompleted = dto.LibraryLayout.ShowCompleted,
        ShowDescriptionOnHover = dto.LibraryLayout.ShowDescriptionOnHover,
        CoverWidth = dto.LibraryLayout.LibraryCoverSize.Width,
        CoverHeight = dto.LibraryLayout.LibraryCoverSize.Height,
        SortBy = dto.LibraryLayout.SortBy,
        SortAscending = dto.LibraryLayout.SortAscending,
        LastSelectedLibrary = dto.LastSelectedLibrary,
    };

    public static ApiUserSettings ToDto(UserSettings s) => new()
    {
        ShowLibraryAsHome = s.ShowLibraryAsHome,
        ReadingTheme = s.ReadingTheme,
        Spread = s.Spread,
        ReadingFont = new ReadingFontDto { Label = s.ReadingFontLabel, Value = s.ReadingFontValue },
        ReadingFontSize = s.ReadingFontSize,
        LineHeight = s.LineHeight,
        LastSelectedLibrary = s.LastSelectedLibrary,
        LibraryLayout = new LibraryLayoutDto
        {
            Base = s.LibraryBase,
            ShowTitles = s.ShowTitles,
            ShowAuthors = s.ShowAuthors,
            ShowSeries = s.ShowSeries,
            ShowCollections = s.ShowCollections,
            ShowCompleted = s.ShowCompleted,
            ShowDescriptionOnHover = s.ShowDescriptionOnHover,
            LibraryCoverSize = new LibraryCoverSizeDto { Width = s.CoverWidth, Height = s.CoverHeight },
            SortBy = s.SortBy,
            SortAscending = s.SortAscending,
        },
    };
}