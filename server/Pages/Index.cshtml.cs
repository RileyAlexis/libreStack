using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.DependencyInjection;

using Librestack.Database;
using Librestack.Services;
using Microsoft.EntityFrameworkCore;
using Librestack.Models;

namespace Librestack.Pages;

public class IndexModel : PageModel
{
    private readonly LibrestackDbContext _db;
    private readonly ILibraryService _libraryService;
    public List<Library> LibraryData { get; set; } = new List<Library>();

    public string? Message { get; set; }

    public IndexModel(LibrestackDbContext db, ILibraryService libraryService)
    {
        _db = db;
        _libraryService = libraryService;
    }

    public async Task OnGetAsync()
    {
        LibraryData = await _db.Library
            .Include(l => l.LibraryTags)
            .Include(l => l.Bookmarks)
            .Include(l => l.ReadingProgress)
            .ToListAsync();
    }

    public IActionResult OnPostHandleButtonOne()
    {
        Message = "Button was clicked";

        return Page();
    }
}