import { useSelector, useDispatch } from "react-redux";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";

// Actions
import {
  sortLibraryByAuthor,
  sortLibraryByLastRead,
  sortLibraryByTitle,
} from "@/redux/reducers/LibraryReducer";
import { setSortBy, setAscending } from "@/redux/reducers/AppSettingsReducer";

// UI
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "../ui/combobox";

import "./LibraryHeaderControls.css";
import { Label } from "../ui/label";
import type { SortyByType } from "@/types/AppSettings";

export const LibraryHeaderControls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const library = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);

  const sortingOptions = ["Author", "Title", "Last Read"];

  const handleSortChange = (value: SortyByType) => {
    dispatch(setSortBy(value));
    if (value === "Author") {
      dispatch(
        sortLibraryByAuthor({
          libraryId: library[selections.selectedLibrary].id,
          ascending: appSettings.libraryLayout.sortAscending,
        }),
      );
    } else if (value === "Title") {
      dispatch(
        sortLibraryByTitle({
          libraryId: library[selections.selectedLibrary].id,
          ascending: appSettings.libraryLayout.sortAscending,
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

  return (
    <div className="libraryHeaderControlsContainer">
      <div className="libraryHeaderControls">
        <div className="sortingContainer">
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
