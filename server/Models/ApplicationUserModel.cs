using Microsoft.AspNetCore.Identity;

namespace Librestack.Models;

public class ApplicationUserModel : IdentityUser
{
    public bool IsActive { get; set; } = true;
}