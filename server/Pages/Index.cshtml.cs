using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.AspNetCore.Authorization;

using Librestack.Database;
using Librestack.Interfaces;
using Librestack.Models;

namespace Librestack.Pages;

[Authorize(AuthenticationSchemes = "AdminCookie")]
public class IndexModel : PageModel
{
    private readonly LibrestackDbContext _db;
    private readonly ILibraryService _libraryService;

    public string GetCoverBase64(byte[] cover)
    {
        return Convert.ToBase64String(cover);
    }

    public List<Library> LibraryData { get; set; } = new List<Library>();

    public string? Message { get; set; }

    public IndexModel(LibrestackDbContext db, ILibraryService libraryService)
    {
        _db = db;
        _libraryService = libraryService;
    }

    public async Task OnGetAsync()
    {
        LibraryData = await _libraryService.GetAllLibraryEntries();

    }

}