import { useState, useRef, useEffect } from "react";
import { api } from "../api";

import { Button, Field } from "@fluentui/react-components";
import { ArrowUploadRegular } from "@fluentui/react-icons";

export const Tester: React.FC = () => {
  const [data, setData] = useState<any>([]);
  const [libraryId, setLibraryId] = useState<number>(0);
  const [tagId, setTagId] = useState<number>(0);
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

  const handleDownloadEntry = () => {
    api
      .get("/Library/downloadLibraryEntry", {
        params: { id: libraryId },
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        const disposition = response.headers["content-disposition"];
        const filename = disposition?.split("filename=")[1] ?? "book.epub";
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      });
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

  const handleGetUserTag = () => {
    api
      .get("LibraryTag/getUserTag", { params: { id: tagId } })
      .then((response) => {
        console.log(response.data);
        setData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleUpdateTag = () => {
    api
      .post("/libraryTag/updateUserTag", { id: tagId, tag: newTag })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleApplyTag = () => {
    api
      .post("/libraryTag/applyTag", { libraryId: libraryId, tagId: tagId })
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

  useEffect(() => {
    console.log(`LibraryId ${libraryId}`);
    console.log(`TagId ${tagId}`);
  }, [libraryId, tagId]);

  return (
    <div className="testerContainer">
      <div>
        <div className="testingButtonContainer">
          <h2>Library</h2>
          <Button onClick={handleGetLibrary} appearance="primary">
            Get Library
          </Button>
          <div className="testingCombo">
            <Button onClick={handleGetLibraryEntry}>Get Library Entry</Button>
            <Field
              placeholder="id"
              value={libraryId}
              onChange={(e) => setLibraryId(Number(e.target.value))}
            />
          </div>

          <div className="testingCombo">
            <Button onClick={handleDownloadEntry} appearance="subtle">
              Download Entry
            </Button>

            <Field
              placeholder="id"
              value={libraryId}
              onChange={(e) => setLibraryId(Number(e.target.value))}
            />
          </div>

          <div className="testingCombo">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <Button
              appearance="secondary"
              icon={<ArrowUploadRegular />}
              size="medium"
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
          <h2>Tags</h2>
          <Button onClick={handleGetAllTags}>Get All Tags</Button>

          <div className="testingCombo">
            <Button onClick={handleCreateUserTag}>Create Tag</Button>
            <Field value={newTag} onChange={(e) => setNewTag(e.target.value)} />
          </div>
        </div>

        <div className="testingCombo">
          <Button onClick={handleGetUserTag} shape="circular">
            Get User Tag
          </Button>
          <Field
            value={tagId}
            onChange={(e) => setTagId(Number(e.target.value))}
          />
        </div>

        <div className="testingCombo">
          <Button onClick={handleUpdateTag}>Update Tag</Button>
          <Field
            value={tagId}
            onChange={(e) => setTagId(Number(e.target.value))}
          />
          <Field value={newTag} onChange={(e) => setNewTag(e.target.value)} />
        </div>

        <div className="testingCombo">
          <Button onClick={handleApplyTag}>Apply Tag</Button>
          <Field
            value={libraryId}
            onChange={(e) => setLibraryId(Number(e.target.value))}
          />
          <Field
            value={tagId}
            onChange={(e) => setTagId(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="responseContainer">
        {data.length > 0 &&
          data.map((item: any, index: number) => (
            <div key={index}>
              <img
                style={{ maxWidth: "160px" }}
                src={`data:${item.contentType};base64,${item.coverImage}`}
              />
              <div>
                {item.id} - {item.title}
                {JSON.stringify(item.libraryTags)}
                {item.tag}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
