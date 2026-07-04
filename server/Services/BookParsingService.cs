using System.Globalization;
using System.Text.RegularExpressions;
using Librestack.Interfaces;

namespace Librestack.Services;

public record SeriesParseResult(string? SeriesTitle, int? SeriesTotal);

public class BookParsingService : IBookParsingService
{
    // =========================================================================
    // Title cleaning — strips series/edition/format noise to get a clean
    // search term for Open Library / Wikidata lookups.
    // =========================================================================

    public string CleanTitle(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return title ?? string.Empty;

        var cleaned = title;

        // 1. Strip bracketed/parenthetical content entirely: (...), [...], {...}
        cleaned = Regex.Replace(cleaned, @"[\(\[\{][^\)\]\}]*[\)\]\}]", " ");
        cleaned = Regex.Replace(cleaned, @"\s+", " ").Trim();

        // 2. Cut at the first "edition/format" noise phrase.
        cleaned = CutAtFirstMatch(cleaned, NoisePhrases);

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

    private static readonly string[] NoisePhrases =
    {
        "omnibus edition", "omnibus",
        "boxed set", "box set",
        "complete collection", "collection",
        "complete series", "anthology",
        "trilogy", "duology",
        "unabridged", "abridged",
        "special edition", "annotated edition",
    };

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

    // =========================================================================
    // Series label normalization — cleans a series string already known to be
    // a series label (e.g. from Wikidata/Open Library), not a raw book title.
    // =========================================================================

    public string? NormalizeSeriesTitle(string seriesLabel)
    {
        if (string.IsNullOrWhiteSpace(seriesLabel)) return null;

        // Strip trailing: " - Book 3", ", Volume 3", " #3", " 3", etc.
        var result = Regex.Replace(
            seriesLabel,
            @"[\s,\-\—:]+(?:book|volume|vol|bk|part|#|num)?\.?\s*\d+\s*$",
            "",
            RegexOptions.IgnoreCase).Trim();

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

        var processedLabel = label.ToLowerInvariant();
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

    // =========================================================================
    // Series parsing from filename/title — extracts series name + total book
    // count from raw, uncleaned strings like "Wool Omnibus Edition (Wool 1-5)
    // (Silo series)". See SeriesParseResult for the return shape.
    //
    // Works via a candidate-and-priority system: every possible series signal
    // found in either input string is collected as a tiered candidate, then
    // the highest-confidence one wins the name. The total book count can come
    // from a DIFFERENT (lower-tier) candidate than the name — e.g. "Silo"
    // wins the name from the "(Silo series)" parenthetical, but "5" only
    // shows up on the "Wool 1-5" parenthetical.
    // =========================================================================

    public SeriesParseResult ParseSeries(string? fileName, string? title)
    {
        var candidates = new List<(int Priority, string Name, int? Total)>();

        EvaluateParens(fileName, candidates);
        EvaluateParens(title, candidates);
        EvaluateRemainder(fileName, candidates);
        EvaluateRemainder(title, candidates);

        if (candidates.Count == 0)
            return new SeriesParseResult(null, null);

        var best = candidates.OrderBy(c => c.Priority).First();

        var total = candidates
            .Where(c => c.Total.HasValue)
            .OrderBy(c => c.Priority)
            .Select(c => c.Total)
            .FirstOrDefault();

        return new SeriesParseResult(CleanSeriesName(best.Name), total);
    }

    private static readonly (string Keyword, int Total)[] SetSizeWords =
    {
        ("duology", 2), ("trilogy", 3), ("tetralogy", 4), ("quartet", 4),
        ("pentalogy", 5), ("quintet", 5), ("hexalogy", 6),
        ("septology", 7), ("heptalogy", 7), ("octology", 8),
    };

    private static readonly Regex ExplicitMarkerRegex = new(
        @"^(book|vol\.?|volume|part)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)$",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly string[] SeriesKeywordExclusions =
        { "book", "series", "vol", "volume", "part", "trilogy", "duology", "tetralogy", "quartet", "pentalogy", "quintet" };

    // --- Parenthetical content: "(Silo series)", "(Wool 1 - 5)", "(Wayfarers)" ---

    private static void EvaluateParens(string? source, List<(int, string, int?)> candidates)
    {
        if (string.IsNullOrWhiteSpace(source)) return;

        foreach (Match m in Regex.Matches(source, @"\(([^()]*)\)"))
        {
            var content = m.Groups[1].Value.Trim();
            if (content.Length == 0) continue;

            // Tier 1: "X series"
            var seriesMatch = Regex.Match(content, @"^(?<name>.+?)\s+series\b", RegexOptions.IgnoreCase);
            if (seriesMatch.Success)
                candidates.Add((1, seriesMatch.Groups["name"].Value, null));

            // Tier 2: "X Trilogy" / "X Duology" / etc.
            foreach (var (keyword, total) in SetSizeWords)
            {
                var m2 = Regex.Match(content, $@"^(?<name>.+?)\s+{keyword}\b", RegexOptions.IgnoreCase);
                if (m2.Success)
                    candidates.Add((2, m2.Groups["name"].Value, total));
            }

            // Tier 3: "X Book N" (no series/trilogy keyword)
            var bookMatch = Regex.Match(
                content, @"^(?<name>.+?)\s+(book|vol\.?|volume|part)\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b",
                RegexOptions.IgnoreCase);
            if (bookMatch.Success)
                candidates.Add((3, bookMatch.Groups["name"].Value, null));

            // Tier 5: bare numeric range "X 1 - 5"
            var rangeMatch = Regex.Match(content, @"^(?<name>.+?)\s+\d+\s*-\s*(?<end>\d+)\s*$");
            if (rangeMatch.Success)
                candidates.Add((5, rangeMatch.Groups["name"].Value, int.Parse(rangeMatch.Groups["end"].Value)));

            // Tier 4: lone name, no digits or series-ish keywords at all
            if (!Regex.IsMatch(content, @"\d") &&
                !SeriesKeywordExclusions.Any(k => Regex.IsMatch(content, $@"\b{k}\b", RegexOptions.IgnoreCase)))
                candidates.Add((4, content, null));
        }
    }

    // --- Non-parenthetical: "Star Trek: Coda: Book 2: ...", "Dreadnought: Nemesis - Book One" ---

    private static void EvaluateRemainder(string? source, List<(int, string, int?)> candidates)
    {
        if (string.IsNullOrWhiteSpace(source)) return;

        var remainder = Regex.Replace(source, @"\([^()]*\)", " ");
        remainder = Regex.Replace(remainder, @"\s+", " ").Trim();
        if (remainder.Length > 0)
            TryLevel(remainder, new[] { ": ", " - " }, candidates);
    }

    // Recursively splits on separators (colon first, then dash) looking for a
    // segment that IS a marker ("Book 2", "Book One"). Whatever comes before
    // the marker segment, at THAT split level, is the series name.
    private static bool TryLevel(string text, string[] separators, List<(int, string, int?)> candidates)
    {
        if (separators.Length == 0) return false;

        var sep = separators[0];
        var segments = text.Split(sep);
        if (segments.Length < 2)
            return TryLevel(text, separators[1..], candidates);

        for (int i = 0; i < segments.Length; i++)
        {
            if (ExplicitMarkerRegex.IsMatch(segments[i].Trim()))
            {
                if (i > 0)
                    candidates.Add((3, string.Join(sep, segments[..i]).Trim(), null));
                return true;
            }
        }

        var foundDeeper = false;
        foreach (var seg in segments)
            foundDeeper |= TryLevel(seg, separators[1..], candidates);
        if (foundDeeper) return true;

        // Last resort: a bare trailing number with no marker word, e.g. ": 1"
        for (int i = 0; i < segments.Length; i++)
        {
            if (Regex.IsMatch(segments[i].Trim(), @"^\d+$"))
            {
                if (i > 0)
                    candidates.Add((6, string.Join(sep, segments[..i]).Trim(), null));
                return true;
            }
        }

        return false;
    }

    private static string CleanSeriesName(string name) =>
        Regex.Replace(name, @"\s+", " ").Trim(' ', ':', '-', ',');
}