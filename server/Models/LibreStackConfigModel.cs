using Microsoft.AspNetCore.Identity;

namespace Librestack.Models;

public class LibreStackConfig
{
    public required string LibraryPath { get; set; }
    public required bool IsSetupComplete { get; set; } = false;
    public required bool IsInterAccessible { get; set; } = false;
}