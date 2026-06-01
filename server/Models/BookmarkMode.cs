namespace Librestack.Models;

public class Bookmark
{
    public int Id { get; set; }
    public int LibraryId { get; set; }
    public string UserId { get; set; }
    public string Name { get; set; }
    public string CfiLocation { get; set; }
    public DateTime CreatedAt { get; set; }
}