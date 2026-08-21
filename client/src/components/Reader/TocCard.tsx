import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/redux/store";
import { addLocationStack } from "@/redux/reducers/LocationStackReducer";

import type { Book, NavItem } from "@likecoin/epub-ts";

interface TocCardProps {
  toc: NavItem;
  handleNavigate: (href: string) => void;
}

export const TocCard: React.FC<TocCardProps> = ({ toc, handleNavigate }) => {
  const dispatch = useDispatch<AppDispatch>();

  const handleSelectToc = () => {
    dispatch(
      addLocationStack({
        title: toc.label,
        cfiLocation: toc.href,
      }),
    );
    handleNavigate(toc.href);
  };

  return (
    <div className="tocCard" onClick={handleSelectToc}>
      {toc.label}
    </div>
  );
};
