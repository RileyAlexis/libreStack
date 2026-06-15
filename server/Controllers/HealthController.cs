using Microsoft.AspNetCore.Mvc;
using Librestack.Database;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/health")] // Use a clear API route
public class HealthController : ControllerBase
{
    private readonly LibrestackDbContext _dbContext;

    // Inject the DbContext to test connectivity
    public HealthController(LibrestackDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealthStatus()
    {
        try
        {
            // Attempt a simple, non-destructive database operation to verify connectivity.
            // This is the most reliable check for container health.
            await _dbContext.Database.OpenConnectionAsync();

            // If successful, return 200 OK status with detailed information
            return Ok(new
            {
                Status = "Healthy",
                Service = "libreStack API",
                Details = "API is running and connected to the database."
            });
        }
        catch (Exception ex)
        {
            // If any exception occurs (e.g., connection timeout, bad credentials), return a failure status.
            return StatusCode(503, new
            {
                Status = "Unhealthy",
                Service = "libreStack API",
                Error = $"Database or service dependency failed: {ex.Message}"
            });
        }
    }
}