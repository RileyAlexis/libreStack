namespace Librestack.Areas.Admin.Pages;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

public class SetupModel : PageModel
{
    public async Task<IActionResult> OnGetAsync()
    {
        // redirect away if already configured
        return Page();
    }
}