import { useSelector, useDispatch } from "react-redux";
import type { LibreRootState } from "@/types/LibreRootState";

// Actions
import { setSelectedLibrary } from "@/redux/reducers/SelectedReducer";

// UI
import { LibraryBig, PlusIcon, ScanSearch } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
} from "../ui/menubar";

import "./BottomControls.css";
import { api } from "@/api";

export const BottomControls: React.FC = () => {
  const dispatch = useDispatch();
  const library = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);

  const handleSelectLibrary = (index: number) => {
    dispatch(setSelectedLibrary(index));
  };

  const handleScanLibrary = () => {
    api
      .post(
        `/LibraryScan/scanLibrary?libraryId=${library[selections.selectedLibrary].id}`,
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
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
            <MenubarItem onClick={handleScanLibrary}>
              <ScanSearch />
              Scan Library
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};
