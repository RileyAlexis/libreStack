using Librestack.Models;

namespace Librestack.Interfaces;

public interface IlibraryScanService
{
    Task<Result> ScanLibraryFiles(int libraryId);
}

