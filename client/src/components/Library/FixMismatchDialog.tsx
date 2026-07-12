import { useState, useEffect, type SetStateAction } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";
import { api } from "@/utils/api";
import type { BookType } from "@/types/BookType";
import type { BookSearchType } from "@/types/BookSearchType";

// UI
import {
  DialogContent,
  DialogTitle,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Dialog,
  DialogActions,
  Alert,
  AlertTitle,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";

import "./FixMisMatchDialog.css";
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
    dispatch(setIsSyncing(true));
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
        dispatch(setIsSyncing(false));
      });
  };

  const handleSelectResult = async (item: BookSearchType) => {
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
      setIsSelectOpen(false);
      dispatch(fetchLibraryData());
      dispatch(setIsSyncing(false));
    }
  };

  return (
    <>
      <DialogTitle style={{ maxWidth: "90vw" }}>
        Fix Mismatch
        <Typography variant="body2" color="text.secondary">
          {book.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {book.author}
        </Typography>
        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              {error}
            </Alert>
          </Box>
        )}
      </DialogTitle>

      <DialogContent
        style={{ maxWidth: "90vw" }}
        className="max-h-[80vh] overflow-y-auto"
      >
        <div className="mismatchContentContainer">
          <div className="tableHeaderContainer">
            <div>
              <p style={{ textAlign: "center" }}>
                Open Library Results {searchResults?.[0]?.numResults ?? 0}
              </p>
            </div>
            <div className="searchTermContainer">
              <TextField
                id="searchTermBox"
                label="Search Term"
                size="small"
                placeholder="use search term"
                value={searchTerm ?? ""}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outlined" onClick={handleNewSearch}>
                Search
              </Button>
            </div>
          </div>
          {isLoading && (
            <Box
              className="emptyLoadingContainer"
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                py: 4,
              }}
            >
              <CircularProgress />
              <Typography variant="body2">Searching Open Library</Typography>
            </Box>
          )}

          {!isLoading && (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Author</TableCell>
                    <TableCell>Publisher</TableCell>
                    <TableCell>Publish Date</TableCell>
                    <TableCell>Series Title</TableCell>
                    <TableCell>Series Position</TableCell>
                    <TableCell>Language</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults?.map((item, index) => (
                    <TableRow
                      key={index}
                      hover
                      sx={{ cursor: "pointer" }}
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

              <Dialog
                open={isAlertSelectOpen}
                onClose={() => {
                  setIsAlertSelectOpen(false);
                  setSelectedResult(null);
                }}
              >
                <DialogContent>
                  <Typography>
                    Replace book meta data with {selectedResult?.title} by{" "}
                    {selectedResult?.author}
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsAlertSelectOpen(false);
                      setSelectedResult(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (selectedResult) handleSelectResult(selectedResult);
                      setIsAlertSelectOpen(false);
                      setIsSelectOpen(false);
                    }}
                  >
                    Confirm
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </div>
      </DialogContent>
    </>
  );
};
