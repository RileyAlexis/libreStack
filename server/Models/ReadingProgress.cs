using System.Text.Json.Serialization;

namespace Librestack.Models;

public class ReadingProgress
{
    [JsonIgnore]
    public int Id { get; set; }
    [JsonIgnore]
    public string UserId { get; set; } = null!;
    public int BookId { get; set; }
    public string? CfiLocation { get; set; }
    public DateTime? LastRead { get; set; }
    public bool IsComplete { get; set; }
    public int PercentComplete { get; set; }
}