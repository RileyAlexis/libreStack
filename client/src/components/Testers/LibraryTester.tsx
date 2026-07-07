import { useState } from "react";
import { api } from "../../utils/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "../ui/field";
import {
  Card,
  CardAction,
  CardTitle,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
} from "../ui/card";

export const LibraryTester: React.FC = () => {
  const [libraryId, setLibraryId] = useState<number>();
  const [libName, setLibName] = useState<string>();
  const [libPath, _] = useState<string>("./Library");
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
      <Card size="sm">
        <CardHeader>
          <CardTitle>Card Header</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>Card Action</CardAction>
        </CardHeader>
        <CardContent>
          <Button variant="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="xs"> Extra Small</Button>
          <Button variant="destructive">Destructive</Button>
        </CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
      <Button variant="default" onClick={handleGetLibraries}>
        Get Libraries
      </Button>
      <div className="testingCombo">
        <Button onClick={handleCreateLibrary}>Create Library</Button>
        <Field orientation="responsive">
          <FieldLabel htmlFor="libraryName">
            <Input
              id="libraryName"
              placeholder="name"
              type="string"
              value={libName}
              onChange={(e) => setLibName(e.target.value)}
            />
            <FieldDescription>Name for the new Library</FieldDescription>
          </FieldLabel>
        </Field>
      </div>
      <div className="testingCombo">
        <Button variant="secondary" onClick={handleDeleteLibrary}>
          Delete Library
        </Button>
        <Input
          placeholder="libraryId"
          type="number"
          value={libraryId}
          onChange={(e) => setLibraryId(Number(e.target.value))}
        />
      </div>
      <div className="testingCombo">
        <Button variant="ghost" onClick={handleAddBookToLibrary}>
          Add Book To Library
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
      <div className="testingCombo">
        <Button variant="outline" onClick={handleRemoveBookFromLibrary}>
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
