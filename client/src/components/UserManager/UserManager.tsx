import { api } from "@/utils/api";
import { useEffect, useState, useMemo } from "react";
import { formatStorageSize } from "@/utils/formatter";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import type { UserManagerLibraryType, UserManagerType } from "@/types/UserType";

type SortKey =
  | "userName"
  | "id"
  | "email"
  | "spaceUsed"
  | "libraryCount"
  | "resetCode"
  | "expiresIn";

const headerCells: readonly { id: SortKey; label: string }[] = [
  { id: "userName", label: "User Name" },
  { id: "id", label: "User Id" },
  { id: "email", label: "Email" },
  { id: "spaceUsed", label: "Space Used" },
  { id: "libraryCount", label: "Library Count" },
  { id: "resetCode", label: "Active Reset Code" },
  { id: "expiresIn", label: "Expires In:" },
];

export const UserManager: React.FC = () => {
  const [users, setUsers] = useState<UserManagerType[]>();
  // State to hold the current timestamp for countdowns
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    api
      .get("UserManager/GetAllUsers")
      .then((response) => {
        setUsers(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  }, []);

  const [orderBy, setOrderBy] = useState<SortKey | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (key: SortKey) => {
    if (orderBy === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(key);
      setOrder("asc");
    }
  };

  const getSortValue = (
    user: UserManagerType,
    key: SortKey,
  ): string | number | null => {
    switch (key) {
      case "userName":
        return user.userName;
      case "id":
        return user.id;
      case "email":
        return user.email;
      case "spaceUsed":
        return (
          user.libraries?.reduce(
            (acc: number, lib: UserManagerLibraryType) =>
              acc + (lib.storageSizeKb || 0),
            0,
          ) || 0
        );
      case "libraryCount":
        return user.libraries?.length || 0;
      case "resetCode":
        return user.resetCode?.code ?? null;
      case "expiresIn":
        // Sort on the timestamp itself so order doesn't shift as the countdown ticks
        return user.resetCode?.expiresAt
          ? new Date(user.resetCode.expiresAt).getTime()
          : null;
    }
  };

  const sortedUsers = useMemo(() => {
    if (!users || !orderBy) return users;
    return [...users].sort((a, b) => {
      const av = getSortValue(a, orderBy);
      const bv = getSortValue(b, orderBy);
      // Empty values always go last, regardless of direction
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      const result =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return order === "asc" ? result : -result;
    });
  }, [users, orderBy, order]);

  // Update the 'now' state every second to keep countdowns live
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (expiryDate: string | Date) => {
    if (!expiryDate) return "";
    const expiry = new Date(expiryDate);
    // Use the 'now' state instead of a fresh new Date()
    const diffInMs = expiry.getTime() - now.getTime();

    if (diffInMs <= 0) {
      return "Expired";
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInSeconds = Math.floor((diffInMs % (1000 * 60)) / 1000);

    return `${diffInMinutes}m ${diffInSeconds}s`;
  };

  return (
    <div className="userManagerContainer">
      <div className="userManagerInnerContainer">
        <Table size="small">
          <TableHead>
            <TableRow>
              {headerCells.map((item) => (
                <TableCell
                  key={item.id}
                  sortDirection={orderBy === item.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === item.id}
                    direction={orderBy === item.id ? order : "asc"}
                    onClick={() => handleSort(item.id)}
                  >
                    {item.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers?.map((item) => {
              const totalSize =
                item.libraries?.reduce(
                  (acc: number, lib: UserManagerLibraryType) =>
                    acc + (lib.storageSizeKb || 0),
                  0,
                ) || 0;

              const libraryCount = item.libraries?.length || 0;

              let resetCodeDisplay = "None";
              if (item.resetCode && item.resetCode.code) {
                const timeRemaining = item.resetCode.expiresAt
                  ? ` (${getTimeRemaining(item.resetCode.expiresAt)})`
                  : "";
                resetCodeDisplay = `${timeRemaining}`;
              }

              return (
                <TableRow key={item.id}>
                  <TableCell>{item.userName}</TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>{formatStorageSize(totalSize)}</TableCell>
                  <TableCell>{libraryCount}</TableCell>
                  <TableCell>
                    {item.resetCode === null ? "None" : item.resetCode.code}
                  </TableCell>
                  <TableCell>{resetCodeDisplay}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
