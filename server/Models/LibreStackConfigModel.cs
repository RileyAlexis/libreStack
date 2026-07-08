using System.Text.Json.Serialization;

namespace Librestack.Models;

public class LibreStackConfig
{
    [JsonIgnore]
    public int Id { get; set; }
    public required bool IsSetupComplete { get; set; } = false;
    public bool ScanLibrariesService { get; set; } = true;
    public int LibraryScanInterval { get; set; } = 15;
    public bool AttemptSeriesParsing { get; set; } = false;
    public bool AllowNewUsers { get; set; } = false;
    public bool AllowNewLibraries { get; set; } = true;
    public bool AllowDeleteFromDisk { get; set; } = true;
    public bool AllowRemoveBooksFromLibrary { get; set; } = true;
    public bool AllowUploadToLibrary { get; set; } = true;
    public bool AllowLibraryUpdates { get; set; } = true;
}