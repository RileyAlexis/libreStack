using System.Text.Json.Serialization;

namespace Librestack.Models.APIModels;

public class APIReadingProgress
{
    public int LibraryId { get; set; }
    public string? CfiLocation { get; set; }
}