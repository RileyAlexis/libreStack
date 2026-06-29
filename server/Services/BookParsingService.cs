
using System.Globalization;
using System.Text.RegularExpressions;
using Librestack.Interfaces;

namespace Librestack.Services;

public class BookParsingService : IBookParsingService
{
    public string CleanTitle(string title)
    {
        var separators = new[] { "--", "—", ": ", " - ", "[]", "_", "__", "#", "()", "number", ", #", ",#" };
        foreach (var sep in separators)
        {
            var idx = title.IndexOf(sep);
            if (idx > 0)
            {
                title = title[..idx];
                break;
            }
        }
        return title.Trim();
    }

    public string? NormalizeSeriesTitle(string seriesLabel)
    {
        Console.WriteLine("=================================================");
        Console.WriteLine(seriesLabel);

        if (string.IsNullOrWhiteSpace(seriesLabel)) return null;

        // Strip trailing: " - Book 3", ", Volume 3", " #3", " 3", etc.
        string result = Regex.Replace(seriesLabel,
            @"[\s,\-\—:]+(?:book|volume|vol|bk|part|#|num)?\.?\s*\d+\s*$",
            "", RegexOptions.IgnoreCase).Trim();


        Console.WriteLine(result);
        Console.WriteLine("=================================================");

        return string.IsNullOrWhiteSpace(result) ? null : result;
    }

    public int ParseSeriesOrderFromLabel(string label)
    {
        if (string.IsNullOrWhiteSpace(label)) return 0;

        var numberMap = new Dictionary<string, int>
        {
            {"one", 1}, {"two", 2}, {"three", 3}, {"four", 4}, {"five", 5},
            {"six", 6}, {"seven", 7}, {"eight", 8}, {"nine", 9}, {"ten", 10}
        };

        string processedLabel = label.ToLowerInvariant();
        foreach (var pair in numberMap)
        {
            processedLabel = processedLabel.Replace(pair.Key, pair.Value.ToString());
        }

        var match = System.Text.RegularExpressions.Regex.Match(processedLabel, @"\b(\d+)\b");
        if (match.Success && int.TryParse(match.Groups[1].Value, out int order))
        {
            return order;
        }

        if (int.TryParse(label, NumberStyles.Integer, CultureInfo.InvariantCulture, out int fallbackOrder))
        {
            return fallbackOrder;
        }

        return 0;
    }
}