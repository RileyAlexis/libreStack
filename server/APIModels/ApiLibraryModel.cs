namespace Librestack.Models.APIModels;

public class ApiLibrary
{
    public int Id { get; set; }
    public string Name { get; set; }
    public bool IsUserLibrary { get; set; }
}

public class ApiLibraryAdmin
{
    public string Name { get; set; }
    public string LibraryPath { get; set; }
}