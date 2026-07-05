import { useState, useEffect, type SetStateAction } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import { api } from "@/api";
import type { BookType } from "@/types/BookType";
import type { BookSearchType } from "@/types/BookSearchType";

// UI
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
} from "../ui/alert-dialog";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

import "./FixMisMatchDialog.css";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { setIsSyncing } from "@/redux/reducers/AppSettingsReducer";

interface FixMismatchDialogProps {
  book: BookType;
  setIsSelectOpen: React.Dispatch<SetStateAction<boolean>>;
}

export const FixMismatchDialog: React.FC<FixMismatchDialogProps> = ({
  book,
  setIsSelectOpen,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [isAlertSelectOpen, setIsAlertSelectOpen] = useState<boolean>(false);
  const [selectedResult, setSelectedResult] = useState<BookSearchType | null>(
    null,
  );
  const [searchResults, setSearchResults] = useState<BookSearchType[] | null>(
    null,
  );

  const truncate = (text: string | null | undefined, maxLength = 40) => {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
  };

  useEffect(() => {
    const handleSearch = () => {
      setIsLoading(true);
      setError(null);
      api
        .get(`metadata/searchOpenLibrary?bookId=${book.id}`)
        .then((response) => {
          console.log(response.data.value);
          setSearchResults(response.data.value);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };
    handleSearch();
  }, []);

  const handleNewSearch = () => {
    if (!searchTerm || searchTerm === "") return;
    setIsSyncing(true);
    api
      .get(
        `metadata/searchOpenLibrary?bookId=${book.id}&searchTerm=${searchTerm}`,
      )
      .then((response) => {
        setSearchResults(response.data.value);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsSyncing(false);
      });
  };

  const handleSelectResult = async (item: BookSearchType) => {
    setIsSyncing(true);
    setError(null);
    dispatch(setIsSyncing(true));

    try {
      await api.patch("book/updateBookEntry", {
        id: item.bookId,
        title: item.title,
        author: item.author,
        publisher: item.publisher,
        publishDate: item.publishDate,
        seriesOrder: item.seriesOrder,
        openLibraryWorkId: item.openLibraryWorkId,
        language: item.language,
        series: item.seriesName
          ? { seriesTitle: item.seriesName, seriesTotal: 0 }
          : null,
      });

      await api.get(`metadata/queryOpenLibraryData?bookId=${item.bookId}`);
      await api.get(`metadata/fetchOpenLibraryCover?bookId=${item.bookId}`);
    } catch (error: any) {
      setError(
        error.response?.data?.error || "Failed to update book metadata.",
      );
      console.error(error);
    } finally {
      setIsSyncing(false);
      setIsSelectOpen(false);
      dispatch(fetchLibraryData());
      dispatch(setIsSyncing(false));
    }
  };

  return (
    <DialogContent
      style={{ maxWidth: "90vw" }}
      className="max-h-[80vh] overflow-y-auto"
    >
      <DialogHeader>
        <DialogTitle>Fix Mismatch</DialogTitle>
        <DialogDescription>
          <p>{book.title}</p>
          <p>{book.author}</p>
        </DialogDescription>
        {error && (
          <div className="mt-2">
            <Alert>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
      </DialogHeader>

      <div className="mismatchContentContainer">
        <div className="tableHeaderContainer">
          <div>
            <p style={{ textAlign: "center" }}>
              Open Library Results {searchResults?.[0]?.numResults ?? 0}
            </p>
          </div>
          <div className="searchTermContainer">
            <Label htmlFor="searchTermBox">Search Term</Label>
            <Input
              id="searchTermBox"
              placeholder="use search term"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="secondary" onClick={handleNewSearch}>
              Search
            </Button>
          </div>
        </div>
        {isLoading && (
          <div className="emptyLoadingContainer">
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <Spinner />
                </EmptyMedia>
                <EmptyTitle>Searching Open Library</EmptyTitle>
              </EmptyHeader>
            </Empty>
          </div>
        )}

        {!isLoading && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Publish Date</TableHead>
                  <TableHead>Series Title</TableHead>
                  <TableHead>Series Position</TableHead>
                  <TableHead>Language</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searchResults?.map((item, index) => (
                  <TableRow
                    key={index}
                    onClick={() => {
                      setSelectedResult(item);
                      setIsAlertSelectOpen(true);
                    }}
                  >
                    <TableCell title={item.title ?? ""}>
                      {truncate(item.title)}
                    </TableCell>
                    <TableCell className="truncate-cell">
                      {item.author}
                    </TableCell>
                    <TableCell>{item.publisher}</TableCell>
                    <TableCell>{item.publishDate}</TableCell>
                    <TableCell>{item.seriesName}</TableCell>
                    <TableCell>{item.seriesOrder}</TableCell>
                    <TableCell>{item.language}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <AlertDialog
              open={isAlertSelectOpen}
              onOpenChange={(open) => {
                setIsAlertSelectOpen(open);
                if (!open) setSelectedResult(null);
              }}
            >
              <AlertDialogContent>
                <AlertDialogDescription>
                  Replace book meta data with {selectedResult?.title} by{" "}
                  {selectedResult?.author}
                </AlertDialogDescription>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="default"
                  onClick={() => {
                    if (selectedResult) handleSelectResult(selectedResult);
                    setIsAlertSelectOpen(false);
                    setIsSelectOpen(false);
                  }}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </DialogContent>
  );
};
