using Librestack.Models;
namespace Librestack.Interfaces;

public interface IWikidataService
{
    Task<Result> QueryWikidata(string userId, int bookId);
}