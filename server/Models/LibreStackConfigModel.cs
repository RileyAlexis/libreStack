using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace Librestack.Models;

public class LibreStackConfig
{
    [JsonIgnore]
    public int Id { get; set; }
    public required bool IsSetupComplete { get; set; } = false;
    public bool ScanLibrariesService { get; set; } = true;
    public int LibraryScanInterval { get; set; } = 15;
}