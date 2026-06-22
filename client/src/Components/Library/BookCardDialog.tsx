import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { api } from "@/api";
import type { BookType } from "@/types/BookType";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { LibreRootState } from "@/types/LibreRootState";

interface BookCardDialogProps {
  bookId: number;
}

export const BookCardDialog: React.FC<BookCardDialogProps> = ({ bookId }) => {
  const library = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const [series, setSeries] = useState<string[]>([]);
  const [seriesTitle, setSeriesTitle] = useState<string>("");
  const [book, setBook] = useState<BookType>();

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

  const handleBlur = (field: keyof BookType, value: string) => {
    if (!book) return;
    api
      .patch(`book/updateBookEntry`, {
        ...book,
        [field]: value === "" ? null : value,
      })
      .catch((err) => {
        console.error("Failed to save", field, err);
      });
  };

  const handleChange = (field: keyof BookType, value: string) => {
    setBook((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const fields: { id: keyof BookType; label: string }[] = [
    { id: "author", label: "Author" },
    { id: "publisher", label: "Publisher" },
    { id: "seriesTitle", label: "Series Title" },
    { id: "seriesOrder", label: "Series Order" },
    { id: "isbn", label: "ISBN" },
    { id: "isbn13", label: "ISBN-13" },
    { id: "lccn", label: "LCCN" },
    { id: "openLibraryWorkId", label: "Open Library Work ID" },
    { id: "openLibraryEditionId", label: "Open Library Edition ID" },
    { id: "openLibraryAuthorId", label: "Open Library Author ID" },
    { id: "openLibraryCoverId", label: "Open Library Cover ID" },
    { id: "wikiDataId", label: "Wikidata ID" },
    { id: "oclcWorldCat", label: "OCLC WorldCat" },
  ];

  const renderField = (id: keyof BookType, label: string) => {
    if (id === "seriesTitle") {
      return (
        <div className="grid gap-1.5">
          <Label htmlFor="titleCombo">Series Title</Label>
          <Combobox
            id="titleCombo"
            items={series}
            defaultValue={book?.seriesTitle}
            onValueChange={(val) => {
              console.log("onValueChange", val);
              const value = val ?? "";
              setSeriesTitle(value);
              handleChange("seriesTitle", value);
              handleBlur("seriesTitle", value);
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
      </DialogHeader>
      <div className="grid gap-4 py-4">
        {fields.map(({ id, label }) => renderField(id, label))}
      </div>
    </DialogContent>
  );
};
