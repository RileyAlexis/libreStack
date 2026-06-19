using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Identity;

namespace Librestack.Models;

public class MetadataServices
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? ApiKey { get; set; }
    public DateOnly ApiKeyExpiration { get; set; }
    public string? BaseUrl { get; set; }
    public string RateLimit { get; set; }


}