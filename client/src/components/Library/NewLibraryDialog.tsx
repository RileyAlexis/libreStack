import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { api } from "@/api";

// Actions
import { fetchLibraryData } from "@/redux/reducers/LibraryReducer";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Field, FieldLabel, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface NewLibraryDialogProps {
  setIsCreateLibraryOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewLibraryDialog: React.FC<NewLibraryDialogProps> = ({
  setIsCreateLibraryOpen,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [libraryName, setLibraryName] = useState<string>("");
  const [libraryPath, setLibraryPath] = useState<string>("");

  const handleReset = () => {
    setLibraryName("");
    setLibraryPath("");
  };

  const handleSubmit = () => {
    console.log("submitting");
    api
      .post("Library/createLibrary", {
        name: libraryName,
        libraryPath: libraryPath,
      })
      .then((response) => {
        console.log(response.data);
        setIsCreateLibraryOpen(false);
        dispatch(fetchLibraryData());
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Library</DialogTitle>
        <DialogDescription>
          Each library requires a folder where it will store the epub files on
          disk
        </DialogDescription>
      </DialogHeader>
      <div className="createLibraryDialogContainer">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="libraryName">Library Name:</FieldLabel>
            <Input
              id="libraryName"
              onChange={(e) => setLibraryName(e.target.value)}
              value={libraryName}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="libraryFolder">
              Full Path to Folder:
            </FieldLabel>
            <Input
              id="libraryFolder"
              onChange={(e) => setLibraryPath(e.target.value)}
              value={libraryPath}
            />
          </Field>
          <Field orientation="horizontal">
            <Button type="reset" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              Submit
            </Button>
          </Field>
        </FieldGroup>
      </div>
    </DialogContent>
  );
};
