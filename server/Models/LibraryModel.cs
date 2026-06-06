namespace Librestack.Models;

public class Library
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public required string Name { get; set; }
    public required string LibraryPath { get; set; }

    public ICollection<Book> Books { get; set; } = new List<Book>();
}