import type { Dispatch, RefObject, SetStateAction } from "react";
import type { Book, Rendition } from "@likecoin/epub-ts";

import { Drawer, IconButton, Button } from "@mui/material";
import { CircleXIcon } from "lucide-react";

interface InReaderDrawerProps {
  isReaderDrawerOpen: boolean;
  setIsReaderDrawerOpen: Dispatch<SetStateAction<boolean>>;
  renditionRef: RefObject<Rendition | null>;
  bookInstance: Book | null;
}

export const InReaderDrawer: React.FC<InReaderDrawerProps> = ({
  isReaderDrawerOpen,
  setIsReaderDrawerOpen,
  renditionRef,
  bookInstance,
}) => {
  const handleNavigate = (href: string) => {
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
      <div className="drawerTableOfContents">
        <ul>
          {bookInstance?.navigation.toc.map((item) => (
            <li>
              <Button
                variant="text"
                key={item.id}
                onClick={() => handleNavigate(item.href)}
                aria-label={item.label}
              >
                {item.label}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </Drawer>
  );
};
