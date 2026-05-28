namespace Librestack.Models;

public class AppliedLibraryTags
{
    public int Id { get; set; }
    public int LibraryId { get; set; }
    public int TagId { get; set; }

    public LibraryTags LibraryTags { get; set; } = new LibraryTags();
}