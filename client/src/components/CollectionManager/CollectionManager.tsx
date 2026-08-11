import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import type { CollectionsType } from "@/types/BookType";
import type { LibreRootState } from "@/types/LibreRootState";
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
import { Delete, TextCursor } from "lucide-react";

// Components
import { BottomControls } from "../BottomControls/BottomControls";

import "./CollectionManager.css";

type SortColumn = "Title";
type SortDirection = "asc" | "desc";

export const CollectionManager: React.FC = () => {
  const [collections, setCollections] = useState<CollectionsType[] | null>(
    null,
  );
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionsType | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [isAddingCollection, setIsAddingCollection] = useState<boolean>(false);
  const [newCollection, setNewCollection] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortColumn>("Title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    api
      .get("Collections/getAllUserCollections")
      .then((response) => {
        console.log(response.data);
        setCollections(response.data.value);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleRenameTitle = () => {
    api
      .post("Collections/updateCollection", {
        id: selectedCollection?.id,
        collectionTitle: selectedCollection?.collectionTitle,
        collectionCover: selectedCollection?.collectionCover ?? "",
      })
      .then((_) => {
        api
          .get("Collections/getAllUserCollections")
          .then((response) => {
            setCollections(response.data.value);
          })
          .catch((error) => {
            console.error(error);
          });
        setSelectedCollection(null);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleAddCollection = (collectionTitle: string) => {
    api
      .post("Collections/createCollection", {
        collectionTitle: collectionTitle,
      })
      .then((_) => {
        setIsAddingCollection(false);
        api
          .get("Collections/getAllUserCollections")
          .then((response) => {
            setCollections(response.data.value);
          })
          .catch((error) => {
            console.error(error);
          });
        setSelectedCollection(null);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteCollection = (item: CollectionsType) => {
    api
      .delete(`Collections?collectionId=${item.id}`)
      .then((_) => {
        setSelectedCollection(null);
        api
          .get("Collections/getAllUserCollections")
          .then((response) => setCollections(response.data.value))
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

  const sortedCollections = useMemo(() => {
    if (!collections) return null;

    const sorted = [...collections].sort((a, b) => {
      let comparison = 0;

      if (sortBy === "Title") {
        comparison = a.collectionTitle.localeCompare(
          b.collectionTitle,
          undefined,
          {
            sensitivity: "base",
          },
        );
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [collections, sortBy, sortDirection]);

  return (
    <div className="collectionManagerContainer">
      <div className="collectionListContainer">
        <TableContainer component={Paper}>
          <Table>
            <TableHead className="collectionHeader">
              <TableRow>
                <TableCell
                  sortDirection={sortBy === "Title" ? sortDirection : false}
                >
                  <TableSortLabel
                    active={sortBy === "Title"}
                    direction={sortBy === "Title" ? sortDirection : "asc"}
                    onClick={() => handleSort("Title")}
                  >
                    Collection Title
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedCollections &&
                sortedCollections.map((item) => (
                  <TableRow key={item.id} style={{ cursor: "pointer" }}>
                    {selectedCollection?.id === item.id ? (
                      <TableCell>
                        <TextField
                          size="small"
                          onBlur={handleRenameTitle}
                          value={selectedCollection.collectionTitle}
                          onChange={(e) =>
                            setSelectedCollection({
                              ...selectedCollection,
                              collectionTitle: e.target.value,
                            })
                          }
                        />
                      </TableCell>
                    ) : (
                      <TableCell onClick={() => setSelectedCollection(item)}>
                        {item.collectionTitle}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="collectionActionsContainer">
                        <ButtonGroup>
                          <Tooltip title="Edit">
                            <IconButton
                              aria-label="Edit"
                              onClick={() => setSelectedCollection(item)}
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
                                setSelectedCollection(item);
                              }}
                            >
                              <Delete size={18} />
                            </IconButton>
                          </Tooltip>

                          <Dialog
                            open={
                              isDeleteAlertOpen &&
                              selectedCollection?.id === item.id
                            }
                            onClose={() => {
                              setIsDeleteAlertOpen(false);
                              setSelectedCollection(null);
                            }}
                          >
                            <DialogTitle>Are you sure?</DialogTitle>
                            <DialogContent>
                              <Typography>
                                This will delete the collection{" "}
                                {item.collectionTitle} and remove the
                                association from any books in it.
                              </Typography>
                            </DialogContent>
                            <DialogActions>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  setIsDeleteAlertOpen(false);
                                  setSelectedCollection(null);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => handleDeleteCollection(item)}
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
              {isAddingCollection && (
                <TableRow style={{ border: "none" }}>
                  <TableCell colSpan={2}>
                    <div className="addCollectionRow">
                      <TextField
                        size="small"
                        placeholder="New Collection Title"
                        value={newCollection}
                        onChange={(e) => setNewCollection(e.target.value)}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => handleAddCollection(newCollection)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setIsAddingCollection(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell colSpan={2}>
                  <div className="addCollectionRow">
                    <Button
                      variant="contained"
                      onClick={() => setIsAddingCollection(true)}
                    >
                      Add Collection
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
