namespace Librestack.Models.APIModels;

public class APIReadingProgress
{
    public int BookId { get; set; }
    public string? CfiLocation { get; set; }
    public bool IsComplete { get; set; }
    public DateTime? LastRead { get; set; }
}