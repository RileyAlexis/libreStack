import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "@/utils/api";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";
import type { Dispatch, SetStateAction } from "react";

import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  Tooltip,
  Box,
  TextField,
} from "@mui/material";
import { Minus, Plus } from "lucide-react";

import "./AssignToSeriesDialog.css";
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";

interface SeriesListType {
  bookCount: number;
  id: number;
  seriesTitle: string;
  seriesTotal: number;
}

interface AssignToSeriesDialogProps {
  setIsAddToSeriesOpen: Dispatch<SetStateAction<boolean>>;
}

export const AssignToSeriesDialog: React.FC<AssignToSeriesDialogProps> = ({
  setIsAddToSeriesOpen,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const selections = useSelector(
    (state: LibreRootState) => state.selections.selectedBooks,
  );
  const selectedBooks = useSelector((state: LibreRootState) =>
    state.library.books.filter((b) => selections.includes(b.id)),
  );
  const [seriesList, setSeriesList] = useState<SeriesListType[] | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesListType | null>(
    null,
  );
  const [isAddingSeries, setIsAddingSeries] = useState<boolean>(false);
  const [newSeries, setNewSeries] = useState<string>("");

  useEffect(() => {
    const fetchSeriesData = async () => {
      try {
        const seriesResponse = await api.get(
          `Series/GetSeriesByLibrary?libraryId=${appSettings.lastSelectedLibrary}`,
        );
        const sortedSeries = seriesResponse.data.sort((a: any, b: any) =>
          a.seriesTitle.localeCompare(b.seriesTitle),
        );
        console.log(seriesResponse);
        setSeriesList(sortedSeries);
      } catch (error) {
        console.error("Failed to fetch global library data:", error);
      }
    };

    fetchSeriesData();
  }, []);

  const handleSelectSeries = (e: any) => {
    const found =
      seriesList?.find((s) => s.seriesTitle === e.target.value) ?? null;
    setSelectedSeries(found);
    console.log(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      let seriesId: number;

      if (isAddingSeries && newSeries !== "") {
        const response = await api.post("Series", {
          seriesTitle: newSeries,
          seriesTotal: 0,
        });
        seriesId = response.data.id;
      } else if (selectedSeries) {
        seriesId = selectedSeries.id;
      } else {
        return; // nothing selected, nothing to do
      }

      await Promise.all(
        selectedBooks.map((book) =>
          api.post("series/reassignSeries", {
            bookId: book.id,
            seriesId: seriesId,
          }),
        ),
      );

      setIsAddToSeriesOpen(false);
    } catch (error: any) {
      console.error(error.response.data);
    } finally {
      dispatch(fetchLibraryData(appSettings.lastSelectedLibrary));
    }
  };

  return (
    <div>
      <DialogTitle>Assign {selectedBooks.length} Books To Series</DialogTitle>
      <DialogContent>
        <Box key="series" className="seriesSelectorContainer">
          <InputLabel id="assignToSeriesSelectLabel">Series:</InputLabel>
          <div className="seriesSelectorBox">
            <div className="seriesSelectorField">
              {!isAddingSeries && (
                <Select
                  fullWidth
                  size="small"
                  displayEmpty
                  value={selectedSeries?.seriesTitle}
                  onChange={(e) => handleSelectSeries(e)}
                >
                  {seriesList?.map((item) => (
                    <MenuItem key={item.id} value={item.seriesTitle}>
                      {item.seriesTitle}
                    </MenuItem>
                  ))}
                </Select>
              )}
              {isAddingSeries && (
                <TextField
                  autoFocus
                  fullWidth
                  size="small"
                  placeholder="New series name"
                  value={newSeries}
                  onChange={(e) => setNewSeries(e.target.value)}
                />
              )}
            </div>

            {!isAddingSeries && (
              <Tooltip title="Add New Series">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => setIsAddingSeries(true)}
                >
                  <Plus />
                </Button>
              </Tooltip>
            )}
            {isAddingSeries && (
              <Tooltip title="Cancel">
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => setIsAddingSeries(false)}
                >
                  <Minus />
                </Button>
              </Tooltip>
            )}
          </div>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setIsAddToSeriesOpen(false)}>Cancel</Button>
        <Button onClick={handleSubmit}>Submit</Button>
      </DialogActions>
    </div>
  );
};
