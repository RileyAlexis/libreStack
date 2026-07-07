import { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import type { AppDispatch } from "@/redux/store";
import type { SeriesType } from "@/types/BookType";
// import type { LibreRootState } from "@/types/LibreRootState";
import { api } from "@/utils/api";

// UI
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableCaption,
  TableRow,
  TableCell,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Components
import { BottomControls } from "../BottomControls/BottomControls";

import "./SeriesManager.css";
import { ButtonGroup, ButtonGroupSeparator } from "../ui/button-group";
import { Delete, TextCursor } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export const SeriesManager: React.FC = () => {
  // const dispatch = useDispatch<AppDispatch>();
  const [series, setSeries] = useState<SeriesType[] | null>(null);
  const [selectedSeries, setSelectedSeries] = useState<SeriesType | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
  const [isAddingSeries, setIsAddingSeries] = useState<boolean>(false);
  const [newSeries, setNewSeries] = useState<string>("");
  // const appSettings = useSelector((state: LibreRootState) => state.appSettings);

  useEffect(() => {
    api
      .get("series")
      .then((response) => {
        setSeries(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const handleRenameTitle = () => {
    api
      .patch("series", {
        seriesId: selectedSeries?.id,
        seriesTitle: selectedSeries?.seriesTitle,
        seriesTotal: selectedSeries?.seriesTotal,
      })
      .then((_) => {
        api
          .get("series")
          .then((response) => {
            setSeries(response.data);
          })
          .catch((error) => {
            console.error(error);
          });
        setSelectedSeries(null);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleAddSeries = (seriesTitle: string) => {
    api
      .post("series", {
        seriesTitle: seriesTitle,
        seriesTotal: 0,
      })
      .then((response) => {
        console.log(response.data);
        setIsAddingSeries(false);
        api
          .get("series")
          .then((response) => {
            setSeries(response.data);
          })
          .catch((error) => {
            console.error(error);
          });
        setSelectedSeries(null);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDeleteSeries = (item: SeriesType) => {
    console.log(item);
    console.log(selectedSeries);
    api
      .delete(`series?seriesId=${item.id}`)
      .then((response) => {
        console.log(response.data);
        setSelectedSeries(null);
        api
          .get("series")
          .then((response) => setSeries(response.data))
          .catch((error) => console.error(error));
      })
      .catch((error) => console.error(error));

    setIsDeleteAlertOpen(false);
  };

  return (
    <div className="seriesManagerContainer">
      <div className="seriesListContainer">
        <Table>
          <TableCaption>List of All Series</TableCaption>
          <TableHeader className="seriesHeader">
            <TableRow>
              <TableHead>Series Title</TableHead>
              <TableHead>Count of Books</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {series &&
              series.map((item) => (
                <TableRow key={item.id} style={{ cursor: "pointer" }}>
                  {selectedSeries?.id === item.id ? (
                    <TableCell>
                      <Input
                        onBlur={handleRenameTitle}
                        value={selectedSeries.seriesTitle}
                        onChange={(e) =>
                          setSelectedSeries({
                            ...selectedSeries,
                            seriesTitle: e.target.value,
                          })
                        }
                      />
                    </TableCell>
                  ) : (
                    <TableCell onClick={() => setSelectedSeries(item)}>
                      {item.seriesTitle}
                    </TableCell>
                  )}
                  <TableCell>{item.bookCount}</TableCell>
                  <TableCell>
                    <div className="seriesActionsContainer">
                      <ButtonGroup>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                variant="outline"
                                size="xs"
                                aria-description="Edit"
                                onClick={() => setSelectedSeries(item)}
                              >
                                <TextCursor />
                              </Button>
                            }
                          />
                          <TooltipContent>
                            <p>Edit</p>
                          </TooltipContent>
                        </Tooltip>

                        <ButtonGroupSeparator>
                          <AlertDialog
                            open={
                              isDeleteAlertOpen &&
                              selectedSeries?.id === item.id
                            }
                            onOpenChange={(open) => {
                              setIsDeleteAlertOpen(open);
                              if (!open) setSelectedSeries(null);
                            }}
                          >
                            <AlertDialogTrigger
                              render={
                                <Tooltip>
                                  <TooltipTrigger
                                    render={
                                      <Button
                                        variant="destructive"
                                        size="xs"
                                        aria-description="Delete"
                                        onClick={() => {
                                          setIsDeleteAlertOpen(true);
                                          setSelectedSeries(item);
                                        }}
                                      >
                                        <Delete />
                                      </Button>
                                    }
                                  />
                                  <TooltipContent>
                                    <p>Delete</p>
                                  </TooltipContent>
                                </Tooltip>
                              }
                            />
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                Are you sure?
                              </AlertDialogHeader>
                              <AlertDialogDescription>
                                This will delete the series {item.seriesTitle}{" "}
                                and remove the assocication from{" "}
                                {item.bookCount} books.
                              </AlertDialogDescription>
                              <AlertDialogCancel variant="outline">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDeleteSeries(item)}
                              >
                                Delete!
                              </AlertDialogAction>
                            </AlertDialogContent>
                          </AlertDialog>
                        </ButtonGroupSeparator>
                      </ButtonGroup>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {isAddingSeries && (
              <TableRow style={{ border: "none" }}>
                <TableCell colSpan={3}>
                  <div className="addSeriesRow">
                    <Input
                      placeholder="New Series Title"
                      value={newSeries}
                      onChange={(e) => setNewSeries(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => handleAddSeries(newSeries)}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingSeries(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
            <TableRow>
              <TableCell colSpan={3}>
                <div className="addSeriesRow">
                  <Button
                    variant="default"
                    onClick={() => setIsAddingSeries(true)}
                  >
                    Add Series
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <AlertDialog></AlertDialog>
      <BottomControls />
    </div>
  );
};
