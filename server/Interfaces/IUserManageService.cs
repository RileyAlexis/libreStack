using Librestack.Models;
using Librestack.Models.APIModels;

namespace Librestack.Interfaces;

public interface IUserManageService
{
    Task<Result<List<UserListDTO>>> GetAllUsers();
    Task<Result<List<UserListDTOSimple>>> GetSimpleUserList();
    Task<Result> DisableUser(string UserId);
    Task<Result> EnableUser(string UserId);
    Task<Result> DeleteUser(string UserId);
}