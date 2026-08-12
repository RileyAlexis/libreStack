import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "@/types/LibreRootState";
import { setSearchTerm } from "@/redux/reducers/SelectedReducer";

import { TextField } from "@mui/material";

import "./SearchControl.css";

export const SearchControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const librarySearchTerm = useSelector(
    (state: LibreRootState) => state.selections.librarySearchTerm,
  );

  return (
    <div className="searchControlContainer">
      <TextField
        type="search"
        variant="filled"
        label="Search"
        value={librarySearchTerm}
        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        sx={{
          borderRadius: "15px",
          background: "var(--menu-background)",
        }}
      />
    </div>
  );
};
