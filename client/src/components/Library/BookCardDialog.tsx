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
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../ui/combobox";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";
import { ButtonGroup, ButtonGroupSeparator } from "../ui/button-group";
import { Textarea } from "../ui/textarea";

import "./BookCardDialog.css";

interface BookCardDialogProps {
  bookId: number;
}

export const BookCardDialog: React.FC<BookCardDialogProps> = ({ bookId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [seriesList, setSeriesList] = useState<SeriesType[]>([]);
  const [seriesInput, setSeriesInput] = useState("");
  const [isOpenLibLoading, setIsOpenLibLoading] = useState(false);
  const [isSeriesSaving, setIsSeriesSaving] = useState(false);
  const [book, setBook] = useState<BookType>();
  const [error, setError] = useState<string | null>(null);

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

  // keep the free-text input in sync once the book actually loads
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
        setBook(response.data);
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

    if (trimmed === (book?.series?.seriesTitle ?? "")) return; // no change

    setIsSeriesSaving(true);

    api
      .patch(`book/updateBookEntry`, {
        ...book,
        series: trimmed ? { seriesTitle: trimmed } : null,
      })
      .then((response) => {
        const returnedSeries: SeriesType | null =
          response.data?.value?.series ?? response.data?.series ?? null;
        console.log("***************************************************");
        console.log(response.data);
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
      })
      .finally(() => setIsSeriesSaving(false));

    dispatch(fetchLibraryData());
  };

  const handleOpenLibrary = () => {
    setIsOpenLibLoading(true);
    setError(null);
    api
      .get(`metadata/queryOpenLibraryData?bookId=${bookId}`)
      .then(() => {
        api
          .get(`Book/getBookEntry?id=${bookId}`)
          .then((response) => {
            setBook(response.data.value);
            setIsOpenLibLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setIsOpenLibLoading(false);
          });
      })
      .catch((error) => {
        setError(
          error.response?.data?.error || "Failed to fetch Open Library data.",
        );
        setIsOpenLibLoading(false);
        console.error(error);
      });
  };

  const handleWikidata = () => {
    setError(null);
    api
      .get(`metadata/queryWikidata?bookId=${bookId}`)
      .then(() => {
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

  const renderSeriesField = () => (
    <div className="grid gap-1.5">
      <Label htmlFor="titleCombo">Series Title</Label>
      <Combobox
        id="titleCombo"
        items={seriesList.map((s) => s.seriesTitle)}
        value={seriesInput}
        onValueChange={(val) => setSeriesInput(val ?? "")}
      >
        <ComboboxInput
          placeholder="No series"
          showClear
          onBlur={() => commitSeries(seriesInput)}
        />
        <ComboboxContent>
          <ComboboxList>
            {(item) => (
              <ComboboxItem
                key={item}
                value={item}
                onClick={() => commitSeries(item)}
              >
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {isSeriesSaving && (
        <span className="text-xs text-muted-foreground">Saving series…</span>
      )}
    </div>
  );

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
            <Button variant="secondary" onClick={handleOpenLibrary}>
              {isOpenLibLoading && (
                <>
                  <Spinner data-icon="inline-start" />
                  Loading
                </>
              )}
              {!isOpenLibLoading && <>Open Library</>}
            </Button>
            <ButtonGroupSeparator />
            <Button variant="secondary" onClick={handleWikidata}>
              Wikidata
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
