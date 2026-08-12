import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import type { LibreRootState } from "@/types/LibreRootState";
import { setSearchTerm } from "@/redux/reducers/SelectedReducer";

import { TextField, IconButton, InputAdornment } from "@mui/material";
import { XIcon } from "lucide-react";

import "./SearchControl.css";

export const SearchControl: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const librarySearchTerm = useSelector(
    (state: LibreRootState) => state.selections.librarySearchTerm,
  );

  return (
    <div className="searchControlContainer">
      <TextField
        variant="filled"
        label="Search"
        autoFocus
        value={librarySearchTerm}
        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
        sx={{
          background: "var(--menu-background)",
        }}
        slotProps={{
          input: {
            endAdornment: librarySearchTerm && (
              <InputAdornment position="end">
                <IconButton
                  aria-label="clear search"
                  onClick={() => dispatch(setSearchTerm(""))}
                  edge="end"
                  size="small"
                >
                  <XIcon size={18} fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
    </div>
  );
};
