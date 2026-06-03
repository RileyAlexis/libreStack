using Microsoft.AspNetCore.Identity;

namespace Librestack.Models;

public class LibreStackConfig
{
    public int Id { get; set; }
    public required string LibraryPath { get; set; } = "./Library";
    public required bool IsSetupComplete { get; set; } = false;
}