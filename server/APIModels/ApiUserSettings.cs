namespace Librestack.Models.APIModels;

public class ApiUserSettings
{
    public bool ShowLibraryAsHome { get; set; }
    public string ReadingTheme { get; set; } = null!;
    public string Spread { get; set; } = null!;
    public ReadingFontDto ReadingFont { get; set; } = null!;
    public LibraryLayoutDto LibraryLayout { get; set; } = null!;
    public int LastSelectedLibrary { get; set; }
}

public class LibraryLayoutDto
{
    public string Base { get; set; } = null!;
    public bool ShowTitles { get; set; }
    public bool ShowAuthors { get; set; }
    public bool ShowSeries { get; set; }
    public bool ShowCollections { get; set; }
    public bool ShowCompleted { get; set; }
    public bool ShowDescriptionOnHover { get; set; }
    public string? SortBy { get; set; }
    public bool SortAscending { get; set; }
    public bool GroupBySeries { get; set; }
    public bool GroupByCollections { get; set; }
    public bool ShowSharedBooks { get; set; }
}

public class ReadingFontDto
{
    public string Label { get; set; } = null!;
    public string Value { get; set; } = null!;
}