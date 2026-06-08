import { useState, useEffect } from "react";

import { useSelector, useDispatch } from "react-redux";

import type { LibreRootState } from "../../types/LibreRootState";

import { api } from "../../api";

//UI
import { Drawer, Button, Splitter, Card } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";

import "./Library.css";

export const Library: React.FC = () => {
  const dispatch = useDispatch();
  const library = useSelector((state: LibreRootState) => state.library);
  const settings = useSelector((state: LibreRootState) => state.appSettings);
  const [selectedLibrary, setSelectedLibrary] = useState<number>(0);

  return (
    <div className="libraryContainer">
      <Splitter style={{ height: "100%" }}>
        <Splitter.Panel defaultSize={"15%"} min={"5%"} max={"50%"}>
          <div className="libraryListing">
            {library &&
              library.length > 0 &&
              library.map((item, index) => (
                <div
                  className={`libraryButton ${index === selectedLibrary ? "libraryButtonActive" : ""}`}
                  key={index}
                >
                  <Button
                    variant="link"
                    color="primary"
                    onClick={() => setSelectedLibrary(index)}
                  >
                    {item.name}
                  </Button>
                </div>
              ))}
          </div>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={"75%"} min={"50%"} max={"95%"}>
          <div className="booksContainer">
            {library &&
              library.length > 0 &&
              library[selectedLibrary].books &&
              library[selectedLibrary].books.map((book) => (
                <div
                  className="bookCover"
                  style={{
                    width: settings.libraryCoverSize.width,
                    height: settings.libraryCoverSize.height,
                  }}
                >
                  <center>
                    <img
                      src={`data:${book.contentType};base64,${book.coverImage}`}
                    />
                  </center>
                </div>
              ))}
          </div>
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};
