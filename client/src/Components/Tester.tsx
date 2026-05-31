import { useState, useRef, useEffect } from "react";
import { api } from "../api";
import { Button, TextField } from "@radix-ui/themes";

export const Tester: React.FC = () => {
  const [data, setData] = useState<any>([]);
  const [libraryId, setLibraryId] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newTag, setNewTag] = useState<string>();

  const handleGetLibrary = () => {
    api
      .get("/Library/getLibrary")
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => console.log(error));
  };

  const handleGetLibraryEntry = () => {
    api
      .get("/Library/getLibraryEntry", { params: { id: libraryId } })
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => console.error(error));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    api
      .post("/Library/addLibraryEntry", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => console.log(response.data))
      .catch((error) => console.error(error));
  };

  const handleGetAllTags = () => {
    api
      .get("/LibraryTag/getAllTags")
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCreateUserTag = () => {
    api
      .post("/LibraryTag/createUserTag", { tag: newTag })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    console.log("useEffect data");
    console.log(data);
  }, [data]);

  return (
    <div className="testerContainer">
      <div>
        <div className="testingButtonContainer">
          <h2>Library</h2>
          <Button onClick={handleGetLibrary}>Get Library</Button>
          <div className="testingCombo">
            <Button onClick={handleGetLibraryEntry}>Get Library Entry</Button>
            <TextField.Root
              placeholder="id"
              value={libraryId}
              onChange={(e) => setLibraryId(Number(e.target.value))}
            >
              <TextField.Slot />
            </TextField.Root>
          </div>

          <div className="testingCombo">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <Button
              variant="soft"
              onClick={() => fileInputRef.current?.click()}
            >
              Add Book
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile}>
              Upload
            </Button>
          </div>
        </div>
        <div className="testingButtonContainer">
          <Button onClick={handleGetAllTags}>Get All Tags</Button>
          <div className="testingCombo">
            <Button onClick={handleCreateUserTag}>Create Tag</Button>
            <TextField.Root
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
            >
              <TextField.Slot />
            </TextField.Root>
          </div>
        </div>
      </div>
      <div className="responseContainer">
        {data.length > 0 &&
          data.map((item: any, index: number) => (
            <div key={index}>
              {item.id} - {item.title}
            </div>
          ))}
      </div>
    </div>
  );
};
