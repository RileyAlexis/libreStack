import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import {
  DialogContent,
  DialogTitle,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  IconButton,
  TableContainer,
  Paper,
} from "@mui/material";
import { CircleXIcon } from "lucide-react";

interface ParsingErrorsDialogProps {
  setIsParsingErrorsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ErrorDataType {
  libraryId: number;
  epubPath: string;
  parseError: string;
}

export const ParsingErrorsDialog: React.FC<ParsingErrorsDialogProps> = ({
  setIsParsingErrorsOpen,
}) => {
  const [data, setData] = useState<ErrorDataType[]>([]);

  useEffect(() => {
    api
      .get("LibraryScan/getEpubParseErrors")
      .then((response) => {
        setData(response.data.value);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <DialogTitle sx={{ textAlign: "center" }}>
        Epub Parsing Errors
      </DialogTitle>
      <IconButton
        aria-label="Close"
        onClick={() => setIsParsingErrorsOpen(false)}
        sx={{ position: "absolute", right: 8, top: 8 }}
      >
        <CircleXIcon />
      </IconButton>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Library Id</TableCell>
                <TableCell>Parse Error</TableCell>
                <TableCell>Epub Path</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow>
                  <TableCell>{item.libraryId}</TableCell>
                  <TableCell>{item.parseError}</TableCell>
                  <TableCell>{item.epubPath}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </div>
  );
};
