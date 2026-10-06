using Librestack.Models;
using Librestack.Models.APIModels;

namespace Librestack.Interfaces;

public interface IUserSettingsService
{
    Task<Result> UpdateUserSettings(UserSettings settings, string UserId);
    Task<Result<UserSettings>> GetUserSettings(string UserId);
    Task<Result<List<ApiUserModel>>> GetLocalUsers(string UserId);
}