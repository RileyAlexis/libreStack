namespace Librestack.Models;

public class LibraryTags
{
    public int Id { get; set; }
    public string Tag { get; set; } = null!;
    public ICollection<AppliedLibraryTags> AppliedLibraryTags { get; set; }
        = new List<AppliedLibraryTags>();
}