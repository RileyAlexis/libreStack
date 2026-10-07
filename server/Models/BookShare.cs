using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Identity;

namespace Librestack.Models;

public class BookShare
{
    public int Id { get; set; }
    public string UserIdFrom { get; set; } = null!;
    public string UserIdTo { get; set; } = null!;
    public int BookId { get; set; }

    [JsonIgnore] public Book? Book { get; set; }
    [JsonIgnore] public IdentityUser? UserFrom { get; set; }
    [JsonIgnore] public IdentityUser? UserTo { get; set; }
}