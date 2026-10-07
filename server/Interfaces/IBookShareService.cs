using Librestack.Models;
namespace Librestack.Interfaces;

public interface IBookShareService
{
    Task<Result> ShareBook(string userIdOwner, string userIdRecipient, int BookId);
    Task<Result> UnshareBook(string userIdOwner, string userIdRecipient, int BookId);
}