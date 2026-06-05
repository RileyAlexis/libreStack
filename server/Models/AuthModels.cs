namespace Librestack.Models;

public record RegisterRequest(string Username, string Email, string Password);
public record LoginRequest(string Username, string Password);
public record AuthUserResponse(string Id, string UserName, string Email);
public record AssignRoleRequest(string UserId);
public record LoginResponse(string AccessToken, string RefreshToken);
public record RefreshRequest(string RefreshToken);
public record RefreshResponse(string AccessToken, string RefreshToken);
