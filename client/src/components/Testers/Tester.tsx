// import { useState, useRef, useEffect } from "react";
// import { api } from "../../utils/api";

// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Upload } from "lucide-react";
// import { LibraryTester } from "./LibraryTester";

// export const Tester: React.FC = () => {
//   const [data, setData] = useState<any>([]);
//   const [bookId, setBookId] = useState<number>(0);
//   const [libraryId, setLibraryId] = useState<number>();
//   const [tagId, setTagId] = useState<number>(0);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [newTag, setNewTag] = useState<string>();

//   const handleGetBook = () => {
//     api
//       .get("/Book/getBooks")
//       .then((response) => {
//         console.log(response.data);
//         setData(response.data);
//       })
//       .catch((error) => console.log(error.response.data));
//   };

//   const handleGetBookEntry = () => {
//     api
//       .get("/Book/getBookEntry", { params: { id: bookId } })
//       .then((response) => {
//         console.log(response.data);
//         setData(response.data);
//       })
//       .catch((error) => console.error(error.response.data));
//   };

//   const handleDownloadEntry = () => {
//     api
//       .get("/Book/downloadBookEntry", {
//         params: { id: bookId },
//         responseType: "blob",
//       })
//       .then((response) => {
//         const url = window.URL.createObjectURL(new Blob([response.data]));
//         const link = document.createElement("a");
//         link.href = url;
//         const disposition = response.headers["content-disposition"];
//         const filename = disposition?.split("filename=")[1] ?? "book.epub";
//         link.setAttribute("download", filename);
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
//         window.URL.revokeObjectURL(url);
//       })
//       .catch((error) => {
//         console.error(error.response.data);
//       });
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
//   };

//   const handleUpload = () => {
//     if (!selectedFile) return;
//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     api
//       .post("/Book/addBookEntry", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//         params: { libraryId: libraryId },
//       })
//       .then((response) => console.log(response.data))
//       .catch((error) => console.error(error.response.data));
//   };

//   const handleGetAllTags = () => {
//     api
//       .get("/BookTag/getAllTags")
//       .then((response) => {
//         console.log(response.data);
//         setData(response.data);
//       })
//       .catch((error) => {
//         console.error(error.response.data);
//       });
//   };

//   const handleCreateUserTag = () => {
//     api
//       .post("/BookTag/createUserTag", { tag: newTag })
//       .then((response) => {
//         console.log(response.data);
//       })
//       .catch((error) => {
//         console.error(error.response.data);
//       });
//   };

//   const handleGetUserTag = () => {
//     api
//       .get("BookTag/getUserTag", { params: { id: tagId } })
//       .then((response) => {
//         console.log(response.data);
//         setData(response.data);
//       })
//       .catch((error) => {
//         console.error(error.response.data);
//       });
//   };

//   const handleUpdateTag = () => {
//     api
//       .post("/bookTag/updateUserTag", { id: tagId, tag: newTag })
//       .then((response) => {
//         console.log(response.data);
//       })
//       .catch((error) => {
//         console.error(error.response.data);
//       });
//   };

//   const handleApplyTag = () => {
//     api
//       .post("/bookTag/applyTag", { bookId: bookId, tagId: tagId })
//       .then((response) => {
//         console.log(response.data);
//       })
//       .catch((error) => {
//         console.error(error.response.data);
//       });
//   };

//   useEffect(() => {
//     console.log("useEffect data");
//     console.log(data);
//   }, [data]);

//   useEffect(() => {
//     console.log(`BookId ${bookId}`);
//     console.log(`TagId ${tagId}`);
//   }, [bookId, tagId]);

//   return (
//     <div className="testerContainer">
//       <div>
//         <LibraryTester />
//         <div className="testingButtonContainer">
//           <h2>Book</h2>
//           <Button onClick={handleGetBook}>Get Books</Button>
//           <div className="testingCombo">
//             <Button onClick={handleGetBookEntry}>Get Book Entry</Button>
//             <Input
//               placeholder="id"
//               type="number"
//               value={bookId}
//               onChange={(e) => setBookId(Number(e.target.value))}
//             />
//           </div>

//           <div className="testingCombo">
//             <Button onClick={handleDownloadEntry}>Download Entry</Button>

//             <Input
//               placeholder="id"
//               type="number"
//               value={bookId}
//               onChange={(e) => setBookId(Number(e.target.value))}
//             />
//           </div>

//           <div className="testingCombo">
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               style={{ display: "none" }}
//             />
//             <Button onClick={() => fileInputRef.current?.click()}>
//               <Upload />
//               Add Book
//             </Button>
//             <Button onClick={handleUpload} disabled={!selectedFile}>
//               Upload
//             </Button>
//             <Input
//               placeholder="libraryId"
//               type="number"
//               value={libraryId}
//               onChange={(e) => setLibraryId(Number(e.target.value))}
//             />
//           </div>
//         </div>

//         <div className="testingButtonContainer">
//           <h2>Tags</h2>
//           <Button onClick={handleGetAllTags}>Get All Tags</Button>

//           <div className="testingCombo">
//             <Button onClick={handleCreateUserTag}>Create Tag</Button>
//             <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} />
//           </div>
//         </div>

//         <div className="testingCombo">
//           <Button onClick={handleGetUserTag}>Get User Tag</Button>
//           <Input
//             type="number"
//             value={tagId}
//             onChange={(e) => setTagId(Number(e.target.value))}
//           />
//         </div>

//         <div className="testingCombo">
//           <Button onClick={handleUpdateTag}>Update Tag</Button>
//           <Input
//             type="number"
//             value={tagId}
//             onChange={(e) => setTagId(Number(e.target.value))}
//           />
//           <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} />
//         </div>

//         <div className="testingCombo">
//           <Button onClick={handleApplyTag}>Apply Tag</Button>
//           <Input
//             type="number"
//             value={bookId}
//             onChange={(e) => setBookId(Number(e.target.value))}
//           />
//           <Input
//             type="number"
//             value={tagId}
//             onChange={(e) => setTagId(Number(e.target.value))}
//           />
//         </div>
//       </div>
//       <div className="responseContainer">
//         {data.length > 0 &&
//           data.map((item: any, index: number) => (
//             <div key={index}>
//               <img
//                 style={{ maxWidth: "160px" }}
//                 src={`data:${item.contentType};base64,${item.coverImage}`}
//               />
//               <div>
//                 {item.id} - {item.title}
//                 {JSON.stringify(item.bookTags)}
//                 {item.tag}
//               </div>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };
