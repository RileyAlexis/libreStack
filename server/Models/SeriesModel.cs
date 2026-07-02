using System.Text.Json.Serialization;

namespace Librestack.Models;

public class Series
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string? SeriesTitle { get; set; }
    public int SeriesTotal { get; set; }

    [JsonIgnore]
    public ICollection<Book> Books { get; set; } = new List<Book>();
}