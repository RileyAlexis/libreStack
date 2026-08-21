import { useState } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import type { Book, Rendition } from "@likecoin/epub-ts";

// Redux
import type { Dispatch, RefObject, SetStateAction } from "react";
import type { LibreRootState } from "@/types/LibreRootState";

// UI
import { Drawer, IconButton, Button, ButtonGroup } from "@mui/material";
import { CircleXIcon } from "lucide-react";
import "./InReaderDrawer.css";

// Components
import { BookmarkCard } from "./BookmarkCard";
import { TocCard } from "./TocCard";

type SelectedState = "TOC" | "BOOKMARKS";

interface InReaderDrawerProps {
  isReaderDrawerOpen: boolean;
  setIsReaderDrawerOpen: Dispatch<SetStateAction<boolean>>;
  renditionRef: RefObject<Rendition | null>;
  bookInstance: Book | null;
  beginSuppressReadingLocationUpdate: () => void;
}

export const InReaderDrawer: React.FC<InReaderDrawerProps> = ({
  isReaderDrawerOpen,
  setIsReaderDrawerOpen,
  renditionRef,
  bookInstance,
  beginSuppressReadingLocationUpdate,
}) => {
  const { id } = useParams();
  const [selectedTab, setSelectedTab] = useState<SelectedState>("TOC");
  const bookmarks = useSelector(
    (state: LibreRootState) =>
      state.library.books.find((book) => book.id === Number(id))?.bookmarks,
  );

  const handleNavigate = (href: string) => {
    beginSuppressReadingLocationUpdate();
    renditionRef.current?.display(href);
    setIsReaderDrawerOpen(false);
  };

  return (
    <Drawer
      open={isReaderDrawerOpen}
      onClose={() => setIsReaderDrawerOpen(false)}
      anchor="left"
      sx={{
        paddingTop: "calc(env(safe-area-inset-top))",
        paddingRight: "0.5em",
      }}
    >
      <div className="closeButton">
        <IconButton
          size="small"
          onClick={() => setIsReaderDrawerOpen(false)}
          aria-label="close"
        >
          <CircleXIcon />
        </IconButton>
      </div>
      <div className="drawerContents">
        {selectedTab === "TOC" && (
          <div className="drawerTableOfContents">
            {bookInstance?.navigation.toc.map((item) => (
              <TocCard toc={item} handleNavigate={handleNavigate} />
            ))}
          </div>
        )}
        {selectedTab === "BOOKMARKS" && (
          <div className="drawerBookmarksContainer">
            {bookmarks?.map((mark) => (
              <BookmarkCard
                key={mark.cfiLocation}
                bookmark={mark}
                bookInstance={bookInstance}
                handleNavigate={handleNavigate}
              />
            ))}
          </div>
        )}
        <div className="drawerButtonGroup">
          <ButtonGroup>
            <Button variant="outlined" onClick={() => setSelectedTab("TOC")}>
              TOC
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelectedTab("BOOKMARKS")}
            >
              BookMarks
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </Drawer>
  );
};
