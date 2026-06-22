import { useSelector } from "react-redux";

// UI
import { DialogContent, DialogHeader } from "../ui/dialog";
import type { BookType } from "@/types/BookType";

interface BookCardDialogProps {
  book: BookType;
}

export const BookCardDialog: React.FC<BookCardDialogProps> = ({ book }) => {
  return (
    <DialogContent>
      <DialogHeader>{book.title}</DialogHeader>
    </DialogContent>
  );
};
