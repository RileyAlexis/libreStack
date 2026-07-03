import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { api } from "@/api";
import type { BookType, SeriesType } from "@/types/BookType";
import type { AppDispatch } from "@/redux/store";

//Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";

// UI
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

import "./BookCardDialog.css";
import { Plus } from "lucide-react";

interface BookCardDialogProps {
  bookId: number;
}

export const BookCardDialog: React.FC<BookCardDialogProps> = ({ bookId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [seriesList, setSeriesList] = useState<SeriesType[]>([]);
  const [seriesInput, setSeriesInput] = useState("");
  const [book, setBook] = useState<BookType>();
  const [error, setError] = useState<string | null>(null);
  const [isAddingSeries, setIsAddingSeries] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isWikiSyncing, setIsWikiSyncing] = useState(false);

  useEffect(() => {
    api
      .get(`Book/getBookEntry?id=${bookId}`)
      .then((response) => setBook(response.data.value))
      .catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    api
      .get("series")
      .then((response) => setSeriesList(response.data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    setSeriesInput(book?.series?.seriesTitle ?? "");
  }, [book?.id]);

  const handleBlur = (field: keyof BookType, value: string) => {
    const payloadValue = value === "" ? null : value;

    api
      .patch(`book/updateBookEntry`, {
        ...book,
        [field]: payloadValue,
      })
      .then((response) => {
        setBook(response.data?.value ?? response.data);
      })
      .catch((err) => {
        console.error("Failed to save", field, err);
      });
  };

  const handleChange = (field: keyof BookType, value: string) => {
    setBook((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

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
      })
      .catch((err) => {
        console.error("Failed to save series", err);
        setError("Failed to save series.");
      });

    dispatch(fetchLibraryData());
  };

  const handleOpenLibrary = () => {
    setIsSyncing(true);
    setError(null);
    api
      .get(`metadata/queryOpenLibraryData?bookId=${bookId}`)
      .then(() => {
        api
          .get(`Book/getBookEntry?id=${bookId}`)
          .then((response) => {
            setBook(response.data.value);
            setIsSyncing(false);
          })
          .catch((error) => {
            console.log(error);
            setIsSyncing(false);
          });
      })
      .catch((error) => {
        setError(
          error.response?.data?.error || "Failed to fetch Open Library data.",
        );
        setIsSyncing(false);
        console.error(error);
      });
  };

  const handleWikidata = () => {
    setIsWikiSyncing(true);
    setError(null);
    api
      .get(`metadata/queryWikidata?bookId=${bookId}`)
      .then(() => {
        setIsWikiSyncing(false);
        api
          .get(`Book/getBookEntry?id=${bookId}`)
          .then((response) => setBook(response.data.value))
          .catch((error) => console.log(error));
      })
      .catch((error) => {
        setError(
          error.response?.data?.error || "Failed to fetch Wikidata data.",
        );
        console.error(error);
        setIsWikiSyncing(false);
      });
  };

  const fields: { id: keyof BookType; label: string }[] = [
    { id: "title", label: "Title" },
    { id: "author", label: "Author" },
    { id: "publisher", label: "Publisher" },
    { id: "description", label: "Description" },
    { id: "seriesOrder", label: "Series Order" },
    { id: "isbn", label: "ISBN" },
    { id: "isbn13", label: "ISBN-13" },
    { id: "lccn", label: "LCCN" },
    { id: "openLibraryWorkId", label: "Open Library Work ID" },
    { id: "openLibraryEditionId", label: "Open Library Edition ID" },
    { id: "openLibraryAuthorId", label: "Open Library Author ID" },
    { id: "openLibraryCoverId", label: "Open Library Cover ID" },
    { id: "wikidataId", label: "Wikidata ID" },
    { id: "oclcWorldCat", label: "OCLC WorldCat" },
  ];

  const renderField = (id: keyof BookType, label: string) => {
    if (id === "description") {
      return (
        <div className="grid gap-1.5" key={id}>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={(book![id] as string) ?? ""}
            onChange={(e) => handleChange(id, e.target.value)}
            onBlur={() => handleBlur(id, book![id] as string)}
          />
        </div>
      );
    }

    return (
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
  };

  const renderSeriesField = () => {
    if (isAddingSeries) {
      return (
        <div className="seriesSelectorContainer">
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
      <div className="seriesSelectorContainer">
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
                    {item.seriesTitle} - {item.bookCount}
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

  if (!book)
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Loading...</DialogTitle>
        </DialogHeader>
      </DialogContent>
    );

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
              {isSyncing && (
                <>
                  <Spinner data-icon="inline-start" />
                  Loading
                </>
              )}
              {!isSyncing && <>Open Library</>}
            </Button>
            <ButtonGroupSeparator />
            <Button
              variant="secondary"
              onClick={handleWikidata}
              disabled={isWikiSyncing}
            >
              {isWikiSyncing && (
                <>
                  <Spinner data-icon="inline-start" />
                  Loading
                </>
              )}
              {!isWikiSyncing && <>Wikidata</>}
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
      <div className="grid gap-4 py-4">
        {renderSeriesField()}
        {fields.map(({ id, label }) => renderField(id, label))}
      </div>
    </DialogContent>
  );
};
