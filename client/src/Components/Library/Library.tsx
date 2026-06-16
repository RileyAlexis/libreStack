import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import type { LibreRootState } from "../../types/LibreRootState";
import "./Library.css";
import type { BookType } from "../../types/BookType";

export const Library: React.FC = () => {
  const navigate = useNavigate();
  const libraryData = useSelector((state: LibreRootState) => state.library);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);
  const [selectedLibrary, setSelectedLibrary] = useState<number>(0);

  const handleSelectBook = (book: BookType) => {
    navigate(`/reader/${book.id}`);
  };

  return (
    <SidebarProvider>
      <div className="libraryContainer">
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              {libraryData &&
                libraryData.length > 0 &&
                libraryData.map((item, index) => (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton
                      isActive={index === selectedLibrary}
                      onClick={() => setSelectedLibrary(index)}
                    >
                      {item.name}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="booksContainer">
          {libraryData &&
            libraryData[selectedLibrary] &&
            libraryData[selectedLibrary].books &&
            libraryData[selectedLibrary].books.map((book: BookType) => (
              <div
                key={book.id}
                className="bookCover"
                style={{
                  width: appSettings.libraryCoverSize.width,
                  height: appSettings.libraryCoverSize.height,
                  cursor: "pointer",
                }}
                onClick={() => handleSelectBook(book)}
              >
                <center>
                  <img
                    src={`data:${book.contentType};base64,${book.coverImage}`}
                    alt={book.title}
                  />
                </center>
              </div>
            ))}
        </div>
      </div>
    </SidebarProvider>
  );
};
