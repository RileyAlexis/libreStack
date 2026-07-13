import { useState, useEffect, useMemo } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import type { AppDispatch } from "@/redux/store";
import type { SeriesType } from "@/types/BookType";
// import type { LibreRootState } from "@/types/LibreRootState";
import { api } from "@/utils/api";

// UI
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableSortLabel,
  Button,
  TextField,
  ButtonGroup,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TableContainer,
  Paper,
} from "@mui/material";

// Components
import { BottomControls } from "../BottomControls/BottomControls";

import "./SeriesManager.css";
import { Delete, TextCursor } from "lucide-react";

type SortColumn = "Title" | "Books";
type SortDirection = "asc" | "desc";

export const SeriesManager: React.FC = () => {
  // const dispatch = useDispatch<AppDispatch>();
  const [series, setSeries] = useState<SeriesType[] | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesType | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [isAddingSeries, setIsAddingSeries] = useState<boolean>(false);
  const [newSeries, setNewSeries] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortColumn>("Title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  // const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  useEffect(() => {
    api
      .get("series")
      .then((response) => {
        console.log(response.data);
        setSeries(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleRenameTitle = () => {
    api
      .patch("series", {
        seriesId: selectedSeries?.id,
        seriesTitle: selectedSeries?.seriesTitle,
        seriesTotal: selectedSeries?.seriesTotal,
      })
      .then((_) => {
        api
          .get("series")
          .then((response) => {
            setSeries(response.data);
          })
          .catch((error) => {
            console.error(error);
          });
        setSelectedSeries(null);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleAddSeries = (seriesTitle: string) => {
    api
      .post("series", {
        seriesTitle: seriesTitle,
        seriesTotal: 0,
      })
      .then((response) => {
        console.log(response.data);
        setIsAddingSeries(false);
        api
          .get("series")
          .then((response) => {
            setSeries(response.data);
          })
          .catch((error) => {
            console.error(error);
          });
        setSelectedSeries(null);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteSeries = (item: SeriesType) => {
    console.log(item);
    console.log(selectedSeries);
    api
      .delete(`series?seriesId=${item.id}`)
      .then((response) => {
        console.log(response.data);
        setSelectedSeries(null);
        api
          .get("series")
          .then((response) => setSeries(response.data))
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));

    setIsDeleteAlertOpen(false);
  };

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const sortedSeries = useMemo(() => {
    if (!series) return null;

    const sorted = [...series].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "Title") {
        comparison = a.seriesTitle.localeCompare(b.seriesTitle, undefined, {
          sensitivity: "base",
        });
      } else if (sortBy === "Books") {
        comparison = a.bookCount - b.bookCount;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [series, sortBy, sortDirection]);

  return (
    <div className="seriesManagerContainer">
      <div className="seriesListContainer">
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="seriesHeader">
              <TableRow>
                <TableCell
                  sortDirection={sortBy === "Title" ? sortDirection : false}
                >
                  <TableSortLabel
                    active={sortBy === "Title"}
                    direction={sortBy === "Title" ? sortDirection : "asc"}
                    onClick={() => handleSort("Title")}
                  >
                    Series Title
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={sortBy === "Books" ? sortDirection : false}
                >
                  <TableSortLabel
                    active={sortBy === "Books"}
                    direction={sortBy === "Books" ? sortDirection : "asc"}
                    onClick={() => handleSort("Books")}
                  >
                    Count of Books
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSeries &&
                sortedSeries.map((item) => (
                  <TableRow key={item.id} style={{ cursor: "pointer" }}>
                    {selectedSeries?.id === item.id ? (
                      <TableCell>
                        <TextField
                          size="small"
                          onBlur={handleRenameTitle}
                          value={selectedSeries.seriesTitle}
                          onChange={(e) =>
                            setSelectedSeries({
                              ...selectedSeries,
                              seriesTitle: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                    ) : (
                      <TableCell onClick={() => setSelectedSeries(item)}>
                        {item.seriesTitle}
                      </TableCell>
                    )}
                    <TableCell>{item.bookCount}</TableCell>
                    <TableCell>
                      <div className="seriesActionsContainer">
                        <ButtonGroup>
                          <Tooltip title="Edit">
                            <IconButton
                              aria-label="Edit"
                              onClick={() => setSelectedSeries(item)}
                            >
                              <TextCursor size={18} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <IconButton
                              aria-label="Delete"
                              color="error"
                              onClick={() => {
                                setIsDeleteAlertOpen(true);
                                setSelectedSeries(item);
                              }}
                            >
                              <Delete size={18} />
                            </IconButton>
                          </Tooltip>

                          <Dialog
                            open={
                              isDeleteAlertOpen &&
                              selectedSeries?.id === item.id
                            }
                            onClose={() => {
                              setIsDeleteAlertOpen(false);
                              setSelectedSeries(null);
                            }}
                          >
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogContent>
                              <Typography>
                                This will delete the series {item.seriesTitle}{" "}
                                and remove the association from {item.bookCount}{" "}
                                books.
                              </Typography>
                            </DialogContent>
                            <DialogActions>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  setIsDeleteAlertOpen(false);
                                  setSelectedSeries(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleDeleteSeries(item)}
                              >
                                Delete!
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </ButtonGroup>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {isAddingSeries && (
                <TableRow style={{ border: "none" }}>
                  <TableCell colSpan={3}>
                    <div className="addSeriesRow">
                      <TextField
                        size="small"
                        placeholder="New Series Title"
                        value={newSeries}
                        onChange={(e) => setNewSeries(e.target.value)}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => handleAddSeries(newSeries)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setIsAddingSeries(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={3}>
                  <div className="addSeriesRow">
                    <Button
                      variant="contained"
                      onClick={() => setIsAddingSeries(true)}
                    >
                      Add Series
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>
      <BottomControls />
    </div>
  );
};
