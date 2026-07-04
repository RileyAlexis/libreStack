
using Librestack.Services;
namespace Librestack.Interfaces;

public interface IBookParsingService
{
    string CleanTitle(string title);
    string? NormalizeSeriesTitle(string seriesLabel);
    int ParseSeriesOrderFromLabel(string label);
    SeriesParseResult ParseSeries(string? fileName, string? title);
}
