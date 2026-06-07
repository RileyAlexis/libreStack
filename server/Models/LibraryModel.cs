using System.Text.Json.Serialization;

namespace Librestack.Models;

public class Library
{
    [JsonIgnore]
    public int Id { get; set; }
    [JsonIgnore]
    public string UserId { get; set; }

    public required string Name { get; set; }
    public required string LibraryPath { get; set; }

    public ICollection<Book> Books { get; set; } = new List<Book>();
}