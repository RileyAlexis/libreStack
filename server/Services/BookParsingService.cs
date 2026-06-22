
using System.Globalization;
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

    public string NormalizeSeriesTitle(string seriesLabel)
    {
        Console.WriteLine("=================================================");
        Console.WriteLine(seriesLabel);

        if (string.IsNullOrWhiteSpace(seriesLabel)) return null;

        // 1. Initial Cleanup: Remove common punctuation and non-word characters that aren't part of a word structure.
        // This handles commas, colons, etc., globally before regex stripping.
        string cleaned = System.Text.RegularExpressions.Regex.Replace(seriesLabel, @"[^\w\s]", "");

        // 2. Regex pattern to match common trailing volume/part indicators (using the already cleaned string).
        var pattern = @"[\s\-\—:]+\s*(?:(book|volume|bk|#|num|)\.?\s*[:\-]?\s*)?(\d+|[a-zA-Z]+)$";

        // Attempt to strip the trailing part that matches common volume/part patterns.
        string normalizedTitle = System.Text.RegularExpressions.Regex.Replace(cleaned, pattern, "").Trim();


        normalizedTitle = System.Text.RegularExpressions.Regex.Replace(normalizedTitle, @"\s{2,}", " ").Trim();
        // 3. Final Capitalization and Comma Removal (though commas should be gone by step 1)
        string result = string.Join(" ", normalizedTitle.Split(' ')
                      .Select(word => word.Length > 0
                          ? char.ToUpper(word[0]) + word.Substring(1).ToLower()
                          : word));

        Console.WriteLine(result);
        Console.WriteLine("=================================================");

        return result;
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