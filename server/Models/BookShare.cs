namespace Librestack.Models;

public class BookShare
{
    public int Id { get; set; }
    public string UserIdFrom { get; set; } = null!;
    public string UserIdTo { get; set; } = null!;
    public int BookId { get; set; }
    public Book? Book { get; set; }
}