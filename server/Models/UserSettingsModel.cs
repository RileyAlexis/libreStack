using Microsoft.AspNetCore.Identity;

namespace Librestack.Models;

public class UserSettings
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public IdentityUser? User { get; set; } = null!;

    // Top-level
    public bool ShowLibraryAsHome { get; set; }
    public string ReadingTheme { get; set; } = "Default";
    public string Spread { get; set; } = "auto";
    public string ReadingFontLabel { get; set; } = "Default";
    public string ReadingFontValue { get; set; } = "inherit";
    public int ReadingFontSize { get; set; } = 16;
    public double LineHeight { get; set; } = 1.5;

    // LibraryLayout
    public string LibraryBase { get; set; } = "Grid";
    public bool ShowTitles { get; set; } = true;
    public bool ShowAuthors { get; set; } = true;
    public bool ShowSeries { get; set; } = false;
    public bool ShowCollections { get; set; } = false;
    public bool ShowCompleted { get; set; } = true;
    public bool ShowDescriptionOnHover { get; set; } = false;
    public int CoverWidth { get; set; } = 150;
    public int CoverHeight { get; set; } = 220;
    public string? SortBy { get; set; } = null;
    public bool SortAscending { get; set; } = true;
}