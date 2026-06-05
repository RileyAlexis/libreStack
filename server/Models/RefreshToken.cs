using System.ComponentModel.DataAnnotations;

namespace Librestack.Models;

public class RefreshToken
{
    [Key]
    public int Id { get; set; }

    // SHA256-hashed token value
    public string HashedToken { get; set; } = null!;

    public string UserId { get; set; } = null!;

    public DateTime Expires { get; set; }

    public DateTime Created { get; set; }

    public DateTime? Revoked { get; set; }

    // Hash of the replacement token if rotated
    public string? ReplacedByHash { get; set; }

    public bool IsActive => Revoked == null && DateTime.UtcNow < Expires;
}
