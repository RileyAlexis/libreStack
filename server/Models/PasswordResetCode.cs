using Microsoft.AspNetCore.Identity;

namespace Librestack.Models;

public class PasswordResetCode
{
    public int Id { get; set; }
    public string UserId { get; set; }
    public string Code { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool Used { get; set; }
    public DateTime CreatedAt { get; set; }

    public IdentityUser User { get; set; }
}