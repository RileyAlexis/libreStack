namespace Librestack.Models.APIModels;

public class ApiCreateNewUserModel
{
    public string Username { get; set; } = "";
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
    public string LibraryName { get; set; } = "";
    public string LibraryPath { get; set; } = "";
}