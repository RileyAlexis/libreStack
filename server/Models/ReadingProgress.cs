namespace Librestack.Models;

public class ReadingProgress
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public int BookId { get; set; }
    public string? CfiLocation { get; set; }
    public float Progress { get; set; }
    public DateTime LastRead { get; set; }
}