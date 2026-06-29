using Librestack.Models;

namespace Librestack.Interfaces;

public interface IUserSettingsService
{
    Task<Result> UpdateUserSettings(UserSettings settings, string UserId);
    Task<Result<UserSettings>> GetUserSettings(string UserId);
}