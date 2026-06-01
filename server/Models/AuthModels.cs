namespace Librestack.Models;

public record RegisterRequest(string Username, string Email, string Password);
public record LoginRequest(string Username, string Password);
public record AuthUserResponse(string Id, string UserName, string Email);
public record AssignRoleRequest(string UserId);
