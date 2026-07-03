using System.Text.Json.Serialization;

namespace Librestack.Models.APIModels;

public class ApiSeries
{
    public int Id { get; set; }
    public string SeriesTitle { get; set; } = "";
    public int SeriesTotal { get; set; }
    public int? BookCount { get; set; }
}