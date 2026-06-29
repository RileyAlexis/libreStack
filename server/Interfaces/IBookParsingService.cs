
namespace Librestack.Interfaces;

public interface IBookParsingService
{
    string CleanTitle(string title);
    int ParseSeriesOrderFromLabel(string label);
    string? NormalizeSeriesTitle(string seriesLabel);
}
