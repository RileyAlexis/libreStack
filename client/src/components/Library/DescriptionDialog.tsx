import type { BookType } from "@/types/BookType";

import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

interface DescriptionProps {
  book: BookType;
}

export const DescriptionDialog: React.FC<DescriptionProps> = ({ book }) => {
  return (
    <div className="grid gap-1.5">
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{book.title}</DialogTitle>
        </DialogHeader>
        {book.description}
      </DialogContent>

      {book.description}
    </div>
  );
};
