import { useSelector, useDispatch } from "react-redux";
import { api } from "@/api";
import type { LibreRootState } from "@/types/LibreRootState";

// Actions
import { setSelectedLibrary } from "@/redux/reducers/SelectedReducer";
import { setCoverSize } from "@/redux/reducers/AppSettingsReducer";

// UI
import {
  LandmarkIcon,
  LayoutDashboard,
  LibraryBig,
  PlusIcon,
  ScanSearch,
  ScanText,
  UploadIcon,
} from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarMenu,
  MenubarTrigger,
  MenubarItem,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from "../ui/menubar";
import { Slider } from "../ui/slider";

import "./BottomControls.css";

export const BottomControls: React.FC = () => {
  const dispatch = useDispatch();
  const library = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

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

  const handleMetadataRefresh = () => {
    api
      .get(
        `metadata/refreshOpenLibraryData?libraryId=${library[selections.selectedLibrary].id}`,
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleWikidataRefresh = () => {
    api
      .get(
        `metadata/refreshWikidata?libraryId=${library[selections.selectedLibrary].id}`,
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleChangeCoverSize = (value: number | readonly number[], _: any) => {
    const num = Array.isArray(value) ? value[0] : value;
    dispatch(setCoverSize(num));
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
              <LandmarkIcon />
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
            <MenubarSeparator />
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
        <MenubarMenu>
          <MenubarTrigger>
            <div className="bottomControlOption">
              <LibraryBig />
              <p>Manage</p>
            </div>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={handleMetadataRefresh}>
              <ScanText />
              Refresh Open Library Metadata
            </MenubarItem>
            <MenubarItem onClick={handleWikidataRefresh}>
              <ScanText />
              Refresh Wikidata Metadata
            </MenubarItem>
            <MenubarItem>
              <UploadIcon />
              Upload Book
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>
            <div className="bottomControlOption">
              <LayoutDashboard />
              <p>Layout</p>
            </div>
          </MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Cover Size</MenubarSubTrigger>
              <MenubarSubContent>
                <div className="libraryControlSlider">
                  <Slider
                    id="coverSlider"
                    className="slider-track"
                    defaultValue={
                      appSettings.libraryLayout.libraryCoverSize.width
                    }
                    value={appSettings.libraryLayout.libraryCoverSize.width}
                    onValueChange={handleChangeCoverSize}
                    step={10}
                    min={80}
                    max={500}
                  />
                </div>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </div>
  );
};
