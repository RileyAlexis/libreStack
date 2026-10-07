namespace Librestack.Models.APIModels;

public class ApiSharedLibraryModel
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public required string Name { get; set; }
    public required string LibraryPath { get; set; }

    public ICollection<ApiBook> Books { get; set; } = new List<ApiBook>();
}