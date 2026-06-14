import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Button, Splitter } from "antd";
// Import necessary utilities and actions
import type { LibreRootState } from "../../types/LibreRootState";
import { api } from "../../api";

import "./Library.css";
import type { BookType } from "../../types/BookType";

export const Library: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const libraryData = useSelector((state: LibreRootState) => state.library);
  const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  const [selectedLibrary, setSelectedLibrary] = useState<number>(0);

  const handleSelectBook = (book: BookType) => {
    console.log(book.id);
    navigate(`/reader/${book.id}`);
    // api
    //   .get(`/Book/downloadBookEntry?id=${book.id}`)
    //   .then((response) => {
    //     console.log(response.data);

    //   })
    //   .catch((error) => {
    //     console.log(error.response.data);
    //   });
  };

  return (
    <div className="libraryContainer">
      <Splitter style={{ height: "90vh" }}>
        <Splitter.Panel defaultSize={"10%"} min={"5%"} max={"50%"}>
          <div className="libraryListing">
            {libraryData &&
              libraryData.length > 0 &&
              libraryData.map((item, index) => (
                <div
                  className={`libraryButton ${index === selectedLibrary ? "libraryButtonActive" : ""}`}
                  key={index}
                >
                  <Button
                    variant="link"
                    color="primary"
                    onClick={() => {
                      setSelectedLibrary(index);
                    }}
                  >
                    {item.name}
                  </Button>
                </div>
              ))}
          </div>
        </Splitter.Panel>
        <Splitter.Panel defaultSize={"90%"} min={"50%"} max={"95%"}>
          <div className="booksContainer">
            {/* ... Book Cover Display (unchanged) ... */}
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
        </Splitter.Panel>
      </Splitter>
    </div>
  );
};
