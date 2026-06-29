import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";
import type { SortByType } from "@/types/AppSettings";

// Actions
import {
  sortLibraryByAuthor,
  sortLibraryByLastRead,
  sortLibraryByTitle,
} from "@/redux/reducers/LibraryReducer";
import { clearSelectedBooks } from "@/redux/reducers/SelectedReducer";
import { setSortBy, setAscending } from "@/redux/reducers/AppSettingsReducer";

// UI
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../ui/combobox";
import { ButtonGroup, ButtonGroupSeparator } from "../ui/button-group";
import { Button } from "../ui/button";
import { CircleXIcon, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { Label } from "../ui/label";

import "./LibraryHeaderControls.css";

export const LibraryHeaderControls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const library = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);

  const sortingOptions = ["Author", "Title", "Last Read"];

  const handleSortChange = (value: SortByType, ascending?: boolean) => {
    dispatch(setSortBy(value));
    const asc = ascending ?? appSettings.libraryLayout.sortAscending;
    if (value === "Author") {
      dispatch(
        sortLibraryByAuthor({
          libraryId: library[selections.selectedLibrary].id,
          ascending: asc,
        }),
      );
    } else if (value === "Title") {
      dispatch(
        sortLibraryByTitle({
          libraryId: library[selections.selectedLibrary].id,
          ascending: asc,
        }),
      );
    } else if (value === "Last Read") {
      dispatch(
        sortLibraryByLastRead({
          libraryId: library[selections.selectedLibrary].id,
        }),
      );
    }
  };

  const handleClearSelection = () => {
    dispatch(clearSelectedBooks());
  };

  const handleAscending = () => {
    dispatch(setAscending(true));
    handleSortChange(appSettings.libraryLayout.sortBy, true);
  };

  const handleDescending = () => {
    dispatch(setAscending(false));
    handleSortChange(appSettings.libraryLayout.sortBy, false);
  };

  return (
    <div className="libraryHeaderControlsContainer">
      <div className="libraryHeaderControls">
        {selections.selectedBooks.length > 0 && (
          <div className="selectedContainer">
            <CircleXIcon
              size={28}
              strokeWidth={2}
              color="red"
              onClick={handleClearSelection}
              style={{ cursor: "pointer" }}
            />
            {selections.selectedBooks.length} Selected
          </div>
        )}
        <div className="sortingContainer">
          <ButtonGroup>
            <Button variant="outline" size="icon" onClick={handleAscending}>
              <ArrowDownAZ />
            </Button>
            <ButtonGroupSeparator />
            <Button variant="outline" size="icon" onClick={handleDescending}>
              <ArrowUpAZ />
            </Button>
          </ButtonGroup>
          <Label id="sortingLabel" htmlFor="sortingCombo">
            Sort By:{" "}
          </Label>
          <Combobox
            id="sortingCombo"
            items={sortingOptions}
            value={appSettings.libraryLayout.sortBy}
            onValueChange={(value) => handleSortChange(value)}
          >
            <ComboboxInput placeholder="Sort by" />
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
      </div>
    </div>
  );
};
