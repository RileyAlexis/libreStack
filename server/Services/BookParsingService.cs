
using System.Globalization;
using System.Text.RegularExpressions;
using Librestack.Interfaces;

namespace Librestack.Services;

public class BookParsingService : IBookParsingService
{

    public string CleanTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return title ?? string.Empty;

        var cleaned = title;

        // 1. Strip bracketed/parenthetical content entirely: (...), [...], {...}
        cleaned = Regex.Replace(cleaned, @"[\(\[\{][^\)\]\}]*[\)\]\}]", " ");
        cleaned = Regex.Replace(cleaned, @"\s+", " ").Trim();

        // 2. Cut at the first "edition/format" noise phrase.
        var noisePhrases = new[]
        {
        "omnibus edition", "omnibus",
        "boxed set", "box set",
        "complete collection", "collection",
        "complete series", "anthology",
        "trilogy", "duology",
        "unabridged", "abridged",
        "special edition", "annotated edition",
    };
        cleaned = CutAtFirstMatch(cleaned, noisePhrases);

        // 3. Hard title/series separator: "--" or em dash.
        cleaned = CutAtFirstOccurrence(cleaned, new[] { "--", "—" });

        // 4. "Series - Number - Title" pattern: 2+ " - " separators means
        //    the real title is the LAST segment.
        var dashSegments = cleaned.Split(" - ");
        if (dashSegments.Length >= 3)
        {
            cleaned = dashSegments[^1].Trim();
        }
        else if (dashSegments.Length == 2)
        {
            cleaned = dashSegments[0].Trim();
        }

        // 5. "Title: Subtitle" vs "Series: Subseries: Title" pattern.
        //    1 colon  -> keep first segment. 2+ colons -> keep last segment.
        var colonSegments = cleaned.Split(": ");
        if (colonSegments.Length >= 3)
        {
            cleaned = colonSegments[^1].Trim();
        }
        else if (colonSegments.Length == 2)
        {
            cleaned = colonSegments[0].Trim();
        }

        // 6. Trailing numbering artifacts: "#2", ", #2", "Book 2", "Vol. 2".
        cleaned = Regex.Replace(
            cleaned,
            @"\s*,?\s*#\s*\d+\s*$|\s*\b(book|vol\.?|volume|part)\s+\d+\s*$",
            string.Empty,
            RegexOptions.IgnoreCase);

        return cleaned.Trim(' ', '-', ':', ',');
    }

    private static string CutAtFirstOccurrence(string input, string[] separators)
    {
        var firstIdx = int.MaxValue;
        foreach (var sep in separators)
        {
            var idx = input.IndexOf(sep, StringComparison.Ordinal);
            if (idx > 0 && idx < firstIdx) firstIdx = idx;
        }
        return firstIdx == int.MaxValue ? input : input[..firstIdx].Trim();
    }

    private static string CutAtFirstMatch(string input, string[] phrases)
    {
        var lower = input.ToLowerInvariant();
        var firstIdx = int.MaxValue;
        foreach (var phrase in phrases)
        {
            var idx = lower.IndexOf(phrase, StringComparison.Ordinal);
            if (idx > 0 && idx < firstIdx) firstIdx = idx;
        }
        return firstIdx == int.MaxValue ? input : input[..firstIdx].Trim();
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

        var match = Regex.Match(processedLabel, @"\b(\d+)\b");
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