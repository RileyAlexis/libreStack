import { useSelector, useDispatch } from "react-redux";
import type { LibreRootState } from "@/types/LibreRootState";

// Actions
import { setSelectedLibrary } from "@/redux/reducers/SelectedReducer";

// UI
import { LibraryBig, PlusIcon } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
} from "../ui/menubar";

import "./BottomControls.css";

export const BottomControls: React.FC = () => {
  const dispatch = useDispatch();
  const library = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);

  const handleSelectLibrary = (index: number) => {
    dispatch(setSelectedLibrary(index));
  };

  return (
    <div className="bottomControlsContainer">
      <Menubar
        style={{
          paddingTop: "2.0em",
          paddingBottom: "2.0em",
          border: "none",
        }}
      >
        <MenubarMenu>
          <MenubarTrigger>
            <div className="bottomControlOption">
              <LibraryBig size="lg" />
              <p>Library</p>
            </div>
          </MenubarTrigger>
          <MenubarContent>
            {library.map((item, index) => (
              <MenubarItem
                className={
                  index === selections.selectedLibrary ? "selectedMenu" : ""
                }
                variant="default"
                key={index}
                onClick={() => handleSelectLibrary(index)}
              >
                {item.name}
              </MenubarItem>
            ))}
            <MenubarItem>
              <PlusIcon />
              Create New Library
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};
