import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { api } from "@/api";
import type { BookType, SeriesType } from "@/types/BookType";
import type { AppDispatch } from "@/redux/store";

import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "../ui/select";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";
import { ButtonGroup, ButtonGroupSeparator } from "../ui/button-group";
import { Textarea } from "../ui/textarea";
import { Plus } from "lucide-react";

import "./BookCardDialog.css";

// ---------------------------------------------------------------------------
// FIELD ORDER
// ---------------------------------------------------------------------------
type EditableField = Exclude<keyof BookType, "series" | "seriesId">;

type FieldConfig =
  | { kind: "series" }
  | { kind: "text"; id: EditableField; label: string }
  | { kind: "textarea"; id: EditableField; label: string };

const FIELD_ORDER: FieldConfig[] = [
  { kind: "text", id: "title", label: "Title" },
  { kind: "text", id: "author", label: "Author" },
  { kind: "series" },
  { kind: "text", id: "seriesOrder", label: "Series Order" },
  { kind: "text", id: "publisher", label: "Publisher" },
  { kind: "textarea", id: "description", label: "Description" },
  { kind: "text", id: "isbn", label: "ISBN" },
  { kind: "text", id: "isbn13", label: "ISBN-13" },
  { kind: "text", id: "lccn", label: "LCCN" },
  { kind: "text", id: "openLibraryWorkId", label: "Open Library Work ID" },
  {
    kind: "text",
    id: "openLibraryEditionId",
    label: "Open Library Edition ID",
  },
  { kind: "text", id: "openLibraryAuthorId", label: "Open Library Author ID" },
  { kind: "text", id: "openLibraryCoverId", label: "Open Library Cover ID" },
  { kind: "text", id: "wikidataId", label: "Wikidata ID" },
  { kind: "text", id: "oclcWorldCat", label: "OCLC WorldCat" },
];

interface BookCardDialogProps {
  bookId: number;
}

export const BookCardDialog: React.FC<BookCardDialogProps> = ({ bookId }) => {
  const dispatch = useDispatch<AppDispatch>();

  const [book, setBook] = useState<BookType>();
  const [seriesList, setSeriesList] = useState<SeriesType[]>([]);
  const [seriesInput, setSeriesInput] = useState("");
  const [isAddingSeries, setIsAddingSeries] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isWikiSyncing, setIsWikiSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -- Data loading ----------------------------------------------------------

  useEffect(() => {
    api
      .get(`Book/getBookEntry?id=${bookId}`)
      .then((response) => setBook(response.data.value))
      .catch((error) => console.log(error));
  }, [bookId]);

  useEffect(() => {
    api
      .get("series")
      .then((response) => setSeriesList(response.data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    setSeriesInput(book?.series?.seriesTitle ?? "");
  }, [book?.id]);

  // -- Field editing -----------------------------------------------------------

  const handleChange = (field: EditableField, value: string) => {
    setBook((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleBlur = (field: EditableField, value: string) => {
    api
      .patch(`book/updateBookEntry`, {
        ...book,
        [field]: value === "" ? null : value,
      })
      .then((response) => {
        setBook(response.data?.value ?? response.data);
      })
      .catch((err) => {
        console.error("Failed to save", field, err);
      });
  };

  // -- Series editing ----------------------------------------------------------

  const commitSeries = (rawValue: string) => {
    const trimmed = rawValue.trim();
    if (trimmed === (book?.series?.seriesTitle ?? "")) return;

    api
      .patch(`book/updateBookEntry`, {
        ...book,
        series: trimmed ? { seriesTitle: trimmed } : null,
      })
      .then((response) => {
        const returnedSeries: SeriesType | null =
          response.data?.value?.series ?? response.data?.series ?? null;

        setBook((prev) =>
          prev
            ? {
                ...prev,
                series: returnedSeries,
                seriesId: returnedSeries?.id ?? null,
              }
            : prev,
        );

        if (returnedSeries) {
          setSeriesList((prev) =>
            prev.some((s) => s.id === returnedSeries.id)
              ? prev
              : [...prev, returnedSeries],
          );
          setSeriesInput(returnedSeries.seriesTitle);
        } else {
          setSeriesInput("");
        }

        dispatch(fetchLibraryData());
      })
      .catch((err) => {
        console.error("Failed to save series", err);
        setError("Failed to save series.");
      });
  };

  // -- Metadata sync buttons -----------------------------------------------------

  const handleOpenLibrary = () => {
    setIsSyncing(true);
    setError(null);
    api
      .get(`metadata/queryOpenLibraryData?bookId=${bookId}`)
      .then(() => api.get(`Book/getBookEntry?id=${bookId}`))
      .then((response) => setBook(response.data.value))
      .catch((error) => {
        setError(
          error.response?.data?.error || "Failed to fetch Open Library data.",
        );
        console.error(error);
      })
      .finally(() => setIsSyncing(false));
  };

  const handleWikidata = () => {
    setIsWikiSyncing(true);
    setError(null);
    api
      .get(`metadata/queryWikidata?bookId=${bookId}`)
      .then(() => api.get(`Book/getBookEntry?id=${bookId}`))
      .then((response) => setBook(response.data.value))
      .catch((error) => {
        setError(
          error.response?.data?.error || "Failed to fetch Wikidata data.",
        );
        console.error(error);
      })
      .finally(() => setIsWikiSyncing(false));
  };

  const handleFetchCover = () => {
    setIsSyncing(true);
    setError(null);
    api
      .get(`metadata/fetchOpenLibraryCover?bookId=${bookId}`)
      .then((_) => {
        dispatch(fetchLibraryData());
      })
      .catch((error) => {
        setError(
          error.response?.data?.error || "Failed to fetch Wikidata data.",
        );
        console.error(error);
      })
      .finally(() => setIsSyncing(false));
  };

  // -- Field renderers -----------------------------------------------------------

  const renderTextField = (id: EditableField, label: string) => (
    <div key={id} className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={(book![id] as string) ?? ""}
        onChange={(e) => handleChange(id, e.target.value)}
        onBlur={() => handleBlur(id, book![id] as string)}
      />
    </div>
  );

  const renderTextareaField = (id: EditableField, label: string) => (
    <div key={id} className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={(book![id] as string) ?? ""}
        onChange={(e) => handleChange(id, e.target.value)}
        onBlur={() => handleBlur(id, book![id] as string)}
      />
    </div>
  );

  const renderSeriesField = () => {
    if (isAddingSeries) {
      return (
        <div key="series" className="seriesSelectorContainer">
          <div className="seriesSelectorBox">
            <Input
              autoFocus
              placeholder="New series name"
              value={seriesInput}
              onChange={(e) => setSeriesInput(e.target.value)}
              onBlur={() => {
                commitSeries(seriesInput);
                setIsAddingSeries(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  commitSeries(seriesInput);
                  setIsAddingSeries(false);
                }
                if (e.key === "Escape") {
                  setSeriesInput(book?.series?.seriesTitle ?? "");
                  setIsAddingSeries(false);
                }
              }}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSeriesInput(book?.series?.seriesTitle ?? "");
              setIsAddingSeries(false);
            }}
          >
            <Plus className="rotate-45" />
          </Button>
        </div>
      );
    }

    return (
      <div key="series" className="seriesSelectorContainer">
        <div className="seriesSelectorBox">
          <Select
            value={book?.series?.seriesTitle ?? ""}
            onValueChange={(value) => commitSeries(value!)}
          >
            <SelectTrigger style={{ width: "100%" }}>
              <SelectValue placeholder="Series">
                {book?.series?.seriesTitle}
              </SelectValue>
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {seriesList.map((item) => (
                  <SelectItem key={item.id} value={item.seriesTitle}>
                    {item.seriesTitle}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsAddingSeries(true)}
        >
          <Plus />
        </Button>
      </div>
    );
  };

  const renderField = (field: FieldConfig) => {
    switch (field.kind) {
      case "series":
        return renderSeriesField();
      case "textarea":
        return renderTextareaField(field.id, field.label);
      case "text":
        return renderTextField(field.id, field.label);
    }
  };

  // -- Render ------------------------------------------------------------------

  if (!book) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loading...</DialogTitle>
        </DialogHeader>
      </DialogContent>
    );
  }

  return (
    <DialogContent className="max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{book.title}</DialogTitle>
        <DialogDescription>Edit metadata: Id {book.id}</DialogDescription>
        <div className="metadataButtonsContainer">
          <Label htmlFor="metadataButtons">Get Metadata</Label>
          <ButtonGroup id="metadataButtons">
            <Button
              variant="secondary"
              onClick={handleOpenLibrary}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Loading
                </>
              ) : (
                "Open Library"
              )}
            </Button>
            <ButtonGroupSeparator />
            <Button
              variant="secondary"
              onClick={handleWikidata}
              disabled={isWikiSyncing}
            >
              {isWikiSyncing ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Loading
                </>
              ) : (
                "Wikidata"
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleFetchCover}
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <Spinner data-icon="inline-start" />
                </>
              ) : (
                "Fetch Cover"
              )}
            </Button>
          </ButtonGroup>
          {error && (
            <div className="mt-2">
              <Alert>
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </DialogHeader>
      <div className="grid gap-4 py-4">{FIELD_ORDER.map(renderField)}</div>
    </DialogContent>
  );
};
