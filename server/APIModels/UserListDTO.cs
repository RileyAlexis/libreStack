namespace Librestack.Models.APIModels;

public class LibraryDTOForUserList
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public required string Name { get; set; }
    public required string LibraryPath { get; set; }
    public int BookCount { get; set; }
    public double StorageSizeKb { get; set; }


}


public class UserListDTO
{
    public string Id { get; set; } = "";
    public int AccessFailedCount { get; set; }
    public string? Email { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool LockoutEnabled { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }
    public string UserName { get; set; } = "";
    public PasswordResetCode? ResetCode { get; set; }
    public List<LibraryDTOForUserList>? Libraries { get; set; }
}