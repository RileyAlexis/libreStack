import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";
import type { CollectionsType } from "@/types/BookType";
import { api } from "@/utils/api";

// UI
import {
  DialogContent,
  DialogTitle,
  Box,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  Button,
  DialogActions,
} from "@mui/material";
import { Minus, Plus } from "lucide-react";

import "./AddToCollectionDialog.css";
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";

interface AssignToCollectionDialogProps {
  setIsAddToCollectionOpen: Dispatch<SetStateAction<boolean>>;
}

export const AddToCollectionDialog: React.FC<AssignToCollectionDialogProps> = ({
  setIsAddToCollectionOpen,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [collectionList, setCollectionList] = useState<CollectionsType[]>();
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [selectedCollection, setSelectedCollection] =
    useState<CollectionsType | null>(null);
  const [newCollection, setNewCollection] = useState<string>("");
  const selectedBooks = useSelector(
    (state: LibreRootState) => state.selections.selectedBooks,
  );
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  useEffect(() => {
    const fetchCollectionsList = () => {
      api
        .get("Collections/getAllUserCollections")
        .then((response) => {
          console.log(response.data);
          setCollectionList(response.data.value);
        })
        .catch((error) => {
          console.error(error.data.response);
        });
    };

    fetchCollectionsList();
  }, []);

  const handleSelectCollection = (e: any) => {
    const found =
      collectionList?.find((c) => c.collectionTitle === e.target.value) ?? null;
    setSelectedCollection(found);
  };

  const handleSubmit = async () => {
    let collectionId: number;
    try {
      if (isAddingCollection && newCollection !== "") {
        const response = await api.post("Collections/createCollection", {
          collectionTitle: newCollection,
        });
        collectionId = response.data.value.id;
        console.log(response.data);
      } else if (selectedCollection) {
        collectionId = selectedCollection.id;
      } else {
        return;
      }

      await Promise.all(
        selectedBooks.map((book) =>
          api.post("Collections/addBookToCollection", {
            bookId: book,
            collectionId: collectionId,
          }),
        ),
      );

      setIsAddToCollectionOpen(false);
    } catch (error: any) {
      console.error(error.response.data);
    } finally {
      dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
    }
  };

  return (
    <div>
      <DialogTitle>
        Assign {selectedBooks.length} books to Collection
      </DialogTitle>
      <DialogContent>
        <Box className="collectionSelectorContainer">
          <InputLabel id="collectionLabel">Collection:</InputLabel>
          <div className="collectionSelectorBox">
            <div className="collectionSelectorField">
              {!isAddingCollection && (
                <Select
                  fullWidth
                  size="small"
                  displayEmpty
                  value={selectedCollection?.collectionTitle}
                  onChange={(e) => handleSelectCollection(e)}
                >
                  {collectionList?.map((item) => (
                    <MenuItem key={item.id} value={item.collectionTitle}>
                      {item.collectionTitle}
                    </MenuItem>
                  ))}
                </Select>
              )}
              {isAddingCollection && (
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  placeholder="New Collection Name"
                  value={newCollection}
                  onChange={(e) => setNewCollection(e.target.value)}
                />
              )}
            </div>
            {!isAddingCollection && (
              <Tooltip title="Add New Collection">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => setIsAddingCollection(true)}
                >
                  <Plus />
                </Button>
              </Tooltip>
            )}

            {isAddingCollection && (
              <Tooltip title="Cancel">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => setIsAddingCollection(false)}
                >
                  <Minus />
                </Button>
              </Tooltip>
            )}
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsAddToCollectionOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </div>
  );
};
