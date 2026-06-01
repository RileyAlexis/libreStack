using System.Text.Json.Serialization;

namespace Librestack.Models;

public class ReadingProgress
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public int LibraryId { get; set; }
    public string? CfiLocation { get; set; }
    public float Progress { get; set; }
    public DateTime LastRead { get; set; }
}