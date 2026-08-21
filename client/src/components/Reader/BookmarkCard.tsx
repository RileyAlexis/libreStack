// Redux
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { addLocationStack } from "@/redux/reducers/LocationStackReducer";

import type { BookmarkType } from "@/types/BookType";
import type { Book } from "@likecoin/epub-ts";

interface BookmarkCardProps {
  bookmark: BookmarkType;
  bookInstance: Book | null;
  handleNavigate: (href: string) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  bookInstance,
  handleNavigate,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSelectBookmark = () => {
    dispatch(
      addLocationStack({
        title: bookmark.name,
        cfiLocation: bookmark.cfiLocation,
      }),
    );
    handleNavigate(bookmark.cfiLocation);
  };

  return (
    <div className="bookmarkCard" onClick={handleSelectBookmark}>
      {bookmark.name} - Page{" "}
      {bookInstance?.locations.locationFromCfi(bookmark.cfiLocation)} - of{" "}
      {bookInstance?.locations.total}{" "}
      {(
        bookInstance?.locations.percentageFromCfi(bookmark.cfiLocation)! * 100
      ).toFixed(0)}
      %
    </div>
  );
};
