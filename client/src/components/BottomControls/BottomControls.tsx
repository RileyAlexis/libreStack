import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { api } from "@/api";
import type { LibreRootState } from "@/types/LibreRootState";
import type { AppDispatch } from "@/redux/store";

// Actions
import {
  saveUserSettings,
  setCoverSize,
  setLastSelectedLibrary,
  setLayout,
} from "@/redux/reducers/AppSettingsReducer";

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
import { Dialog } from "../ui/dialog";
import { Slider } from "../ui/slider";

import "./BottomControls.css";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { NewLibraryDialog } from "../Library/NewLibraryDialog";

export const BottomControls: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [isCreateLibraryOpen, setIsCreateLibraryOpen] =
    useState<boolean>(false);
  const library = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  const handleSelectLibrary = (index: number) => {
    dispatch(setSelectedLibrary(index));
    dispatch(setLastSelectedLibrary(index));
    dispatch(saveUserSettings(appSettings));
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

  const handleShowComplete = () => {
    dispatch(
      setLayout({
        ...appSettings.libraryLayout,
        showCompleted: !appSettings.libraryLayout.showCompleted,
      }),
    );
  };

  const handleShowTitles = () => {
    dispatch(
      setLayout({
        ...appSettings.libraryLayout,
        showTitles: !appSettings.libraryLayout.showTitles,
      }),
    );
  };

  const handleShowAuthors = () => {
    dispatch(
      setLayout({
        ...appSettings.libraryLayout,
        showAuthors: !appSettings.libraryLayout.showAuthors,
      }),
    );
  };

  const handleShowSeries = () => {
    dispatch(
      setLayout({
        ...appSettings.libraryLayout,
        showSeries: !appSettings.libraryLayout.showSeries,
      }),
    );
  };

  return (
    <div className="bottomControlsContainer">
      <Menubar className="bottomMenuBar">
        <MenubarMenu>
          <MenubarTrigger>
            <div className="bottomControlOption">
              <LandmarkIcon />
              <p>Library</p>
            </div>
          </MenubarTrigger>
          <MenubarContent className="menubarContent">
            {library.map((item, index) => (
              <MenubarItem
                className={
                  index === appSettings.lastSelectedLibrary
                    ? "selectedMenu"
                    : ""
                }
                variant="default"
                key={index}
                onClick={() => handleSelectLibrary(index)}
              >
                {item.name}
              </MenubarItem>
            ))}
            <MenubarSeparator />
            <MenubarItem onClick={() => setIsCreateLibraryOpen(true)}>
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
          <MenubarContent className="menubarContent">
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
          <MenubarContent className="menubarContent">
            <MenubarItem className="menubarSwitch">
              <Label htmlFor="showComplete">Show Read</Label>
              <Switch
                id="showComplete"
                checked={appSettings.libraryLayout.showCompleted}
                onCheckedChange={handleShowComplete}
              />
            </MenubarItem>
            <MenubarItem className="menubarSwitch">
              <Label htmlFor="showComplete">Show Titles</Label>
              <Switch
                id="showComplete"
                checked={appSettings.libraryLayout.showTitles}
                onCheckedChange={handleShowTitles}
              />
            </MenubarItem>
            <MenubarItem className="menubarSwitch">
              <Label htmlFor="showComplete">Show Authors</Label>
              <Switch
                id="showComplete"
                checked={appSettings.libraryLayout.showAuthors}
                onCheckedChange={handleShowAuthors}
              />
            </MenubarItem>
            <MenubarItem className="menubarSwitch">
              <Label htmlFor="showComplete">Show Series</Label>
              <Switch
                id="showComplete"
                checked={appSettings.libraryLayout.showSeries}
                onCheckedChange={handleShowSeries}
              />
            </MenubarItem>

            <MenubarSub>
              <MenubarSubTrigger>Cover Size</MenubarSubTrigger>
              <MenubarSubContent className="menubarSubContent">
                <Slider
                  id="coverSlider"
                  className="mx-auto w-full max-w-xs"
                  defaultValue={[
                    appSettings.libraryLayout.libraryCoverSize.width,
                  ]}
                  value={[appSettings.libraryLayout.libraryCoverSize.width]}
                  onValueChange={handleChangeCoverSize}
                  step={10}
                  min={80}
                  max={500}
                />
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
      <Dialog open={isCreateLibraryOpen} onOpenChange={setIsCreateLibraryOpen}>
        <NewLibraryDialog setIsCreateLibraryOpen={setIsCreateLibraryOpen} />
      </Dialog>
    </div>
  );
};
