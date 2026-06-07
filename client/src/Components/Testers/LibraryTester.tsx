import { useState } from "react";
import { api } from "../../api";
import { Button, Input } from "antd";

export const LibraryTester: React.FC = () => {
  const [libraryId, setLibraryId] = useState<number>();
  const [libName, setLibName] = useState<string>();
  const [libPath, setLibPath] = useState<string>("./Library");
  const [bookId, setBookId] = useState<number>();

  const handleGetLibraries = () => {
    api
      .get("/Library/getAllLibraries")
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error.response.data.errors);
      });
  };

  const handleCreateLibrary = () => {
    api
      .post("/Library/createLibrary", {
        name: libName,
        libraryPath: libPath,
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  const handleDeleteLibrary = () => {
    api
      .delete("/Library/deleteLibrary", {
        params: {
          libraryId: libraryId,
        },
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  const handleAddBookToLibrary = () => {
    api
      .post("/Library/addBookToLibrary", null, {
        params: {
          libraryId: libraryId,
          bookId: bookId,
        },
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  const handleRemoveBookFromLibrary = () => {
    api
      .post("/Library/removeFromLibrary", null, {
        params: {
          libraryId: libraryId,
          bookId: bookId,
        },
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  return (
    <div className="testingButtonContainer">
      <h2>Library</h2>
      <Button type="primary" onClick={handleGetLibraries}>
        Get Libraries
      </Button>
      <div className="testingCombo">
        <Button onClick={handleCreateLibrary}>Create Library</Button>
        <Input
          placeholder="name"
          type="string"
          value={libName}
          onChange={(e) => setLibName(e.target.value)}
        />
      </div>
      <div className="testingCombo">
        <Button onClick={handleDeleteLibrary}>Delete Library</Button>
        <Input
          placeholder="libraryId"
          type="number"
          value={libraryId}
          onChange={(e) => setLibraryId(Number(e.target.value))}
        />
      </div>
      <div className="testingCombo">
        <Button onClick={handleAddBookToLibrary}>Add Book To Library</Button>
        <Input
          placeholder="libraryId"
          type="number"
          value={libraryId}
          onChange={(e) => setLibraryId(Number(e.target.value))}
        />
        <Input
          placeholder="bookId"
          type="number"
          value={bookId}
          onChange={(e) => setBookId(Number(e.target.value))}
        />
      </div>
      <div className="testingCombo">
        <Button onClick={handleRemoveBookFromLibrary}>
          Remove Book From Library
        </Button>
        <Input
          placeholder="libraryId"
          type="number"
          value={libraryId}
          onChange={(e) => setLibraryId(Number(e.target.value))}
        />
        <Input
          placeholder="bookId"
          type="number"
          value={bookId}
          onChange={(e) => setBookId(Number(e.target.value))}
        />
      </div>
    </div>
  );
};
