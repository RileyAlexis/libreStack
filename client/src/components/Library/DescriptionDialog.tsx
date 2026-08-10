import type { LibreRootState } from "@/types/LibreRootState";
import { DialogContent, DialogTitle, Typography, Box } from "@mui/material";
import { useSelector } from "react-redux";

interface DescriptionProps {
  bookId: number | null;
}

export const DescriptionDialog: React.FC<DescriptionProps> = ({ bookId }) => {
  const book = useSelector((state: LibreRootState) =>
    state.library.books.find((b) => b.id === bookId),
  );

  return (
    <Box className="grid gap-1.5">
      <DialogTitle>
        <div className="descriptionDialogHeaderInfo">
          <Typography variant="h5">{book!.title}</Typography>
          <Typography variant="h6">{book!.author}</Typography>
          <Typography variant="body1">Published {book?.publishDate}</Typography>
          {book!.series && (
            <Typography variant="body1">
              {book!.series.seriesTitle} - #{book!.seriesOrder}
            </Typography>
          )}
        </div>
      </DialogTitle>

      <DialogContent className="bookCardDialogContent">
        <Typography variant="body2">{book!.description}</Typography>
      </DialogContent>
    </Box>
  );
};
