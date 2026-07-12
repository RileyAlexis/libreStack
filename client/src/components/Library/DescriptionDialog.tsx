import type { BookType } from "@/types/BookType";

import { DialogContent, DialogTitle, Typography, Box } from "@mui/material";

interface DescriptionProps {
  book: BookType;
}

export const DescriptionDialog: React.FC<DescriptionProps> = ({ book }) => {
  return (
    <Box className="grid gap-1.5">
      <DialogTitle>{book.title}</DialogTitle>
      <DialogContent className="bookCardDialogContent">
        <Typography variant="body2">{book.description}</Typography>
      </DialogContent>
    </Box>
  );
};
