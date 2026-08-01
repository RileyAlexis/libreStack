import type { BookType } from "@/types/BookType";

import { DialogContent, DialogTitle, Typography, Box } from "@mui/material";

interface DescriptionProps {
  book: BookType;
}

export const DescriptionDialog: React.FC<DescriptionProps> = ({ book }) => {
  return (
    <Box className="grid gap-1.5">
      <DialogTitle>
        <div className="descriptionDialogHeaderInfo">
          <Typography variant="h5">{book.title}</Typography>
          <Typography variant="h6">{book.author}</Typography>
          {book.series && (
            <Typography variant="body1">
              {book.series.seriesTitle} - #{book.seriesOrder}
            </Typography>
          )}
        </div>
      </DialogTitle>

      <DialogContent className="bookCardDialogContent">
        <Typography variant="body2">{book.description}</Typography>
      </DialogContent>
    </Box>
  );
};
