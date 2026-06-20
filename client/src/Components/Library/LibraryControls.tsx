import { useDispatch, useSelector } from "react-redux";
import type { LibreRootState } from "@/types/LibreRootState";
import { setCoverSize } from "@/redux/reducers/AppSettingsReducer";
import { setSelectedLibrary } from "@/redux/reducers/SelectedReducer";
import "./LibraryControls.css";

//UI
import { Slider } from "../ui/slider";
import { DeleteIcon, PlusIcon, ScanText, UploadIcon } from "lucide-react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "../ui/menubar";
import { api } from "@/api";

export const LibraryControls: React.FC = () => {
  const dispatch = useDispatch();
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const library = useSelector((state: LibreRootState) => state.library);
  const selections = useSelector((state: LibreRootState) => state.selections);

  const handleChangeCoverSize = (value: number | readonly number[], _: any) => {
    const num = Array.isArray(value) ? value[0] : value;
    dispatch(setCoverSize(num));
  };

  const handleSelectLibrary = (index: number) => {
    dispatch(setSelectedLibrary(index));
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

  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Library</MenubarTrigger>
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
            New Library
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Manage</MenubarTrigger>
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
          <MenubarItem variant="destructive">
            <DeleteIcon />
            Delete Selected
          </MenubarItem>
        </MenubarContent>

        <MenubarMenu>
          <MenubarTrigger>Layout</MenubarTrigger>
          <MenubarContent>
            <MenubarSub>
              <MenubarSubTrigger>Cover Size</MenubarSubTrigger>
              <MenubarSubContent>
                <div className="libraryControlSlider">
                  <Slider
                    id="coverSlider"
                    className="slider-track"
                    defaultValue={appSettings.libraryCoverSize.width}
                    value={appSettings.libraryCoverSize.width}
                    onValueChange={handleChangeCoverSize}
                    step={20}
                    min={80}
                    max={600}
                  />
                </div>
              </MenubarSubContent>
            </MenubarSub>
          </MenubarContent>
        </MenubarMenu>
      </MenubarMenu>
    </Menubar>
  );
};
