import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "@/api";
import type { BookType } from "@/types/BookType";
import type { LibreRootState } from "@/types/LibreRootState";
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
  const library = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const [series, setSeries] = useState<string[]>([]);
  const [isOpenLibLoading, setIsOpenLibLoading] = useState(false);
  const [_, setSeriesTitle] = useState<string>("");
  const [book, setBook] = useState<BookType>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get(`Book/getBookEntry?id=${bookId}`)
      .then((response) => setBook(response.data.value))
      .catch((error) => console.log(error));

    const uniqueSeries = [
      ...new Set(
        library[selections.selectedLibrary].books
          .filter((item) => item.seriesTitle)
          .map((item) => item.seriesTitle),
      ),
    ];
    setSeries(uniqueSeries);
  }, [bookId]);

  useEffect(() => {
    if (book?.seriesTitle) setSeriesTitle(book.seriesTitle);
  }, [book]);

  // MODIFIED: Explicitly check for empty string and convert to null before API call
  const handleBlur = (field: keyof BookType, value: string) => {
    let payloadValue: any;
    if (value === "") {
      payloadValue = null; // Send null if the field is cleared
    } else {
      payloadValue = value;
    }

    api
      .patch(`book/updateBookEntry`, {
        ...book,
        [field]: payloadValue,
      })
      .catch((err) => {
        console.error("Failed to save", field, err);
      });
    dispatch(fetchLibraryData());
  };

  const handleChange = (field: keyof BookType, value: string) => {
    setBook((prev) => (prev ? { ...prev, [field]: value } : prev));
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
    { id: "seriesTitle", label: "Series Title" },
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
    if (id === "seriesTitle") {
      return (
        <div className="grid gap-1.5" key={id}>
          <Label htmlFor="titleCombo">Series Title</Label>
          <Combobox
            id="titleCombo"
            items={series}
            defaultValue={book?.seriesTitle}
            onValueChange={(val) => {
              const value = val ?? "";
              setSeriesTitle(value);
              handleChange("seriesTitle", value);
              handleBlur("seriesTitle", value); // Trigger blur on change for immediate update
            }}
          >
            <ComboboxInput placeholder={book?.seriesTitle} showClear />
            <ComboboxContent>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      );
    }

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
        {fields.map(({ id, label }) => renderField(id, label))}
      </div>
    </DialogContent>
  );
};
