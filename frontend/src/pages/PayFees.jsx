// // //ShorthandDemo2025\frontend\src\pages\PayFees.jsx  
// // import React, { useEffect, useState } from "react";
// // import { Paper, Divider, Box, CircularProgress, Button } from "@mui/material";
// // import axios from "axios";
// // import { Header } from "../components/PayFeesComponents/Header";
// // import { WarningsBanner } from "../components/PayFeesComponents/WarningsBanner";
// // import { SearchBar } from "../components/PayFeesComponents/SearchBar";
// // import { BulkActionsToolbar } from "../components/PayFeesComponents/BulkActionsToolbar";
// // import { StudentsTable } from "../components/PayFeesComponents/StudentsTable";
// // import { PaginationControls } from "../components/PayFeesComponents/PaginationControls";
// // import { EmptyState } from "../components/PayFeesComponents/EmptyState";
// // import { SubscriptionSelector } from "../components/PayFeesComponents/SubscriptionSelector";
// // import { PaymentsSummary } from "../components/PayFeesComponents/PaymentsSummary";
// // import { DeleteConfirmationDialog } from "../components/PayFeesComponents/DeleteConfirmationDialog";
// // import { NotificationSnackbar } from "../components/PayFeesComponents/NotificationSnackbar";
// // import { EditStudentDialog } from "../components/PayFeesComponents/EditStudentDialog";
// // import { QRPaymentModal } from "../components/PayFeesComponents/QRPaymentModal";
// // import { HybridPaymentModal } from "../components/PayFeesComponents/HybridPaymentModal";

// // const FeesPayment = () => {
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [selected, setSelected] = useState([]);
// //   const [subscriptionMode, setSubscriptionMode] = useState("2months");
// //   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
// //   const [editDialogOpen, setEditDialogOpen] = useState(false);
// //   const [currentStudent, setCurrentStudent] = useState(null);
// //   const [snackbar, setSnackbar] = useState({
// //     open: false,
// //     message: "",
// //     severity: "success",
// //   });
// //   const [currentPage, setCurrentPage] = useState(1);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [students, setStudents] = useState([]);
// //   const [qrModalOpen, setQrModalOpen] = useState(false);
// //   const [hybridModalOpen, setHybridModalOpen] = useState(false);
// //   const [rowsPerPage, setRowsPerPage] = useState(5);

// //   // Fetch students from backend
// //   useEffect(() => {
// //     const fetchStudents = async () => {
// //       try {
// //         setIsLoading(true);
// //         const response = await axios.get("https://www.shorthandexam.in/students", {
// //           withCredentials: true,
// //         });

// //         if (response.status === 404) {
// //           setStudents([]);
// //           showSnackbar("No students found", "info");
// //           return;
// //         }

// //         const transformedStudents = response.data.map((student) => ({
// //           id: student.student_id,
// //           instituteId: student.instituteId,
// //           firstName: student.firstName,
// //           lastName: student.lastName,
// //           middleName: student.middleName || "",
// //           motherName: student.motherName || "",
// //           amount: student.amount || "pending",
// //           batchYear: student.batch_year,
// //           sem: student.sem || "",
// //           mobileNo: student.mobile_no || "",
// //           email: student.email || "",
// //           subjects: student.subjectsId || "",
// //           image: student.image || "",
// //         }));

// //         setStudents(transformedStudents);
// //       } catch (error) {
// //         console.error("Error fetching students:", error);
// //         showSnackbar(
// //           error.response?.data?.message || "Failed to load students",
// //           "error"
// //         );
// //         setStudents([]);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchStudents();
// //   }, []);

// //   const filteredStudents = students.filter((student) =>
// //     Object.values(student).some(
// //       (value) =>
// //         value &&
// //         value.toString().toLowerCase().includes(searchTerm.toLowerCase())
// //     )
// //   );

// //   const paginatedStudents = filteredStudents.slice(
// //     (currentPage - 1) * rowsPerPage,
// //     currentPage * rowsPerPage
// //   );

// //   const handleSelectAll = (event) => {
// //     if (event.target.checked) {
// //       setSelected(paginatedStudents.map((student) => student.id));
// //     } else {
// //       setSelected([]);
// //     }
// //   };

// //   const handleSelect = (id) => {
// //     if (selected.includes(id)) {
// //       setSelected(selected.filter((item) => item !== id));
// //     } else {
// //       setSelected([...selected, id]);
// //     }
// //   };

// //   const handleEdit = (id) => {
// //     const studentToEdit = students.find((student) => student.id === id);
// //     setCurrentStudent(studentToEdit);
// //     setEditDialogOpen(true);
// //   };

// //   const handleSaveStudent = async (updatedData) => {
// //     try {
// //       const backendData = {
// //         firstName: updatedData.firstName,
// //         lastName: updatedData.lastName,
// //         middleName: updatedData.middleName || null,
// //         motherName: updatedData.motherName || null,
// //         batch_year: updatedData.batchYear,
// //         sem: updatedData.sem || 1,
// //         mobile_no: updatedData.mobileNo || '',
// //         email: updatedData.email || '',
// //         image: updatedData.image || null
// //       };

// //       const response = await axios.put(
// //         `https://www.shorthandexam.in/students/${updatedData.id}`,
// //         backendData,
// //         { 
// //           withCredentials: true,
// //           headers: { 'Content-Type': 'application/json' }
// //         }
// //       );

// //       setStudents(prevStudents =>
// //         prevStudents.map(student =>
// //           student.id === updatedData.id ? { ...student, ...updatedData } : student
// //         )
// //       );

// //       showSnackbar("Student updated successfully!", "success");
// //     } catch (error) {
// //       const errorMsg = error.response?.data?.message || 
// //                       (error.response?.status === 404 
// //                         ? "Student not found" 
// //                         : "Update failed");
// //       showSnackbar(errorMsg, "error");
// //       console.error("Update error:", error.response || error.message);
// //     } finally {
// //       setEditDialogOpen(false);
// //     }
// //   };

// //   const handleImageChange = (e) => {
// //     const file = e.target.files[0];
// //     if (file) {
// //       if (file.size < 20 * 1024 || file.size > 50 * 1024) {
// //         showSnackbar("Please select an image between 20-50 KB", "warning");
// //         return;
// //       }

// //       const reader = new FileReader();
// //       reader.onloadend = () => {
// //         setCurrentStudent((prev) => ({
// //           ...prev,
// //           image: reader.result,
// //         }));
// //       };
// //       reader.readAsDataURL(file);
// //     }
// //   };

// //   const handleRemoveImage = () => {
// //     setCurrentStudent((prev) => ({
// //       ...prev,
// //       image: "",
// //     }));
// //   };

// //   const openDeleteDialog = () => {
// //     if (selected.length === 0) {
// //       showSnackbar("Please select at least one student.", "warning");
// //       return;
// //     }
// //     setDeleteDialogOpen(true);
// //   };

// //   const confirmDelete = async () => {
// //     try {
// //       setIsLoading(true);
// //       let successCount = 0;

// //       // Delete each student one by one
// //       for (const studentId of selected) {
// //         try {
// //           await axios.delete(
// //             `https://www.shorthandexam.in/studentsdel/${studentId}`,
// //             { withCredentials: true }
// //           );
// //           successCount++;
// //         } catch (error) {
// //           console.error(`Failed to delete student ${studentId}:`, error);
// //         }
// //       }

// //       // Refresh the student list after deletion
// //       const response = await axios.get("https://www.shorthandexam.in/students", {
// //         withCredentials: true,
// //       });
// //       const transformedStudents = response.data.map((student) => ({
// //         id: student.student_id,
// //         instituteId: student.instituteId,
// //         firstName: student.firstName,
// //         lastName: student.lastName,
// //         middleName: student.middleName || "",
// //         motherName: student.motherName || "",
// //         amount: student.amount || "pending",
// //         batchYear: student.batch_year,
// //         sem: student.sem || "",
// //         mobileNo: student.mobile_no || "",
// //         email: student.email || "",
// //         subjects: student.subjectsId || "",
// //         image: student.image || "",
// //       }));
// //       setStudents(transformedStudents);

// //       // Show appropriate notification
// //       if (successCount === selected.length) {
// //         showSnackbar(`Successfully deleted ${successCount} student(s)`, "success");
// //       } else {
// //         showSnackbar(
// //           `Deleted ${successCount} of ${selected.length} student(s)`,
// //           "warning"
// //         );
// //       }
      
// //       setSelected([]);
// //     } catch (error) {
// //       console.error("Error during deletion process:", error);
// //       showSnackbar("An error occurred during deletion", "error");
// //     } finally {
// //       setIsLoading(false);
// //       setDeleteDialogOpen(false);
// //     }
// //   };

// //   const showSnackbar = (message, severity = "success") => {
// //     setSnackbar({ open: true, message, severity });
// //   };

// //   const closeSnackbar = () => {
// //     setSnackbar({ ...snackbar, open: false });
// //   };

// //   const exportToCSV = () => {
// //     showSnackbar("Exported students to CSV", "info");
// //   };

// //   const handleProceedToPayment = async () => {
// //     try {
// //       const prices = { 
// //         '2months': 200, 
// //         '4months': 350, 
// //         '6months': 450 
// //       };
// //       const amount = selected.length * prices[subscriptionMode];

// //       const response = await axios.post(
// //         "https://www.shorthandexam.in/api/payments",
// //         {
// //           studentIds: selected,
// //           amount,
// //           subscriptionMode,
// //         },
// //         {
// //           withCredentials: true,
// //         }
// //       );

// //       if (response.data.paymentUrl) {
// //         window.location.href = response.data.paymentUrl;
// //       } else {
// //         showSnackbar("Payment initiated successfully", "success");
// //       }
// //     } catch (error) {
// //       console.error("Payment error:", error);
// //       showSnackbar(
// //         error.response?.data?.message || "Failed to initiate payment",
// //         "error"
// //       );
// //     }
// //   };

// //   const handleQrPaymentClick = () => {
// //     if (selected.length === 0) {
// //       showSnackbar("Please select at least one student", "warning");
// //       return;
// //     }
// //     setQrModalOpen(true);
// //   };

// //   const handleHybridPaymentClick = () => {
// //     if (selected.length === 0) {
// //       showSnackbar("Please select at least one student", "warning");
// //       return;
// //     }
// //     setHybridModalOpen(true);
// //   };

// //   const handleQrPaymentSubmit = async (utrNumber) => {
// //     try {
// //       setIsLoading(true);
// //       const prices = { 
// //         '2months': 200, 
// //         '4months': 350, 
// //         '6months': 450 
// //       };
// //       const amount = selected.length * prices[subscriptionMode];

// //       const response = await axios.post(
// //         "https://www.shorthandexam.in/api/payments/qr",
// //         {
// //           studentIds: selected,
// //           amount,
// //           subscriptionMode,
// //           utrNumber,
// //           paymentMethod: 'qr'
// //         },
// //         { withCredentials: true }
// //       );

// //       showSnackbar("QR payment submitted successfully!", "success");
// //       setQrModalOpen(false);
// //     } catch (error) {
// //       console.error("QR payment error:", error);
// //       showSnackbar(
// //         error.response?.data?.message || "Failed to submit QR payment",
// //         "error"
// //       );
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   if (isLoading) {
// //     return (
// //       <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
// //         <CircularProgress />
// //       </Box>
// //     );
// //   }

// //   return (
// //     <Paper
// //       elevation={3}
// //       sx={{ margin: "auto", maxWidth: "95%", padding: 3, marginTop: 5 }}
// //     >
// //       <Header />
// //       <WarningsBanner />

// //       <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

// //       <BulkActionsToolbar
// //         selected={selected}
// //         openDeleteDialog={openDeleteDialog}
// //         exportToCSV={exportToCSV}
// //       />

// //       {filteredStudents.length > 0 ? (
// //         <>
// //           <StudentsTable
// //             students={paginatedStudents}
// //             selected={selected}
// //             handleSelectAll={handleSelectAll}
// //             handleSelect={handleSelect}
// //             handleEdit={handleEdit}
// //             setSelected={setSelected}
// //             openDeleteDialog={openDeleteDialog}
// //             showSnackbar={showSnackbar}
// //           />
// //           <PaginationControls
// //             currentPage={currentPage}
// //             setCurrentPage={setCurrentPage}
// //             rowsPerPage={rowsPerPage}
// //             setRowsPerPage={setRowsPerPage}
// //             totalItems={filteredStudents.length}
// //           />
// //         </>
// //       ) : (
// //         <EmptyState />
// //       )}

// //       <Divider sx={{ my: 3 }} />

// //       <SubscriptionSelector
// //         subscriptionMode={subscriptionMode}
// //         setSubscriptionMode={setSubscriptionMode}
// //         onQrPaymentClick={handleQrPaymentClick}
// //         onHybridPaymentClick={handleHybridPaymentClick}
// //       />

// //       <PaymentsSummary 
// //         selected={selected} 
// //         onProceed={handleProceedToPayment}
// //         subscriptionMode={subscriptionMode} 
// //       />

// //       {/* Dialog Components */}
// //       <DeleteConfirmationDialog
// //         open={deleteDialogOpen}
// //         onClose={() => setDeleteDialogOpen(false)}
// //         onConfirm={confirmDelete}
// //         selectedCount={selected.length}
// //       />

// //       <EditStudentDialog
// //         open={editDialogOpen}
// //         onClose={() => setEditDialogOpen(false)}
// //         student={currentStudent}
// //         onSave={handleSaveStudent}
// //         onImageChange={handleImageChange}
// //         onRemoveImage={handleRemoveImage}
// //       />

// //       <QRPaymentModal
// //         open={qrModalOpen}
// //         onClose={(success) => {
// //           setQrModalOpen(false);
// //           if (success) {
// //             setSelected([]);
// //             showSnackbar("QR Payment successful! Students have been processed.", "success");
// //           }
// //         }}
// //         selectedStudents={selected}
// //         subscriptionMode={subscriptionMode}
// //         studentsData={students}
// //       />

// //       <HybridPaymentModal
// //         open={hybridModalOpen}
// //         onClose={(success) => {
// //           setHybridModalOpen(false);
// //           if (success) {
// //             setSelected([]);
// //             showSnackbar("Smart Payment successful! Students have been processed.", "success");
// //           }
// //         }}
// //         selectedStudents={selected}
// //         subscriptionMode={subscriptionMode}
// //         studentsData={students}
// //       />

// //       <NotificationSnackbar
// //         open={snackbar.open}
// //         message={snackbar.message}
// //         severity={snackbar.severity}
// //         onClose={closeSnackbar}
// //       />
// //     </Paper>
// //   );
// // };

// // export default FeesPayment;


// //ShorthandDemo2025\frontend\src\pages\PayFees.jsx  
// import React, { useEffect, useState } from "react";
// import { Paper, Divider, Box, CircularProgress, Button } from "@mui/material";
// import axios from "axios";
// import { Header } from "../components/PayFeesComponents/Header";
// import { WarningsBanner } from "../components/PayFeesComponents/WarningsBanner";
// import { SearchBar } from "../components/PayFeesComponents/SearchBar";
// import { BulkActionsToolbar } from "../components/PayFeesComponents/BulkActionsToolbar";
// import { StudentsTable } from "../components/PayFeesComponents/StudentsTable";
// import { PaginationControls } from "../components/PayFeesComponents/PaginationControls";
// import { EmptyState } from "../components/PayFeesComponents/EmptyState";
// import { SubscriptionSelector } from "../components/PayFeesComponents/SubscriptionSelector";
// import { PaymentsSummary } from "../components/PayFeesComponents/PaymentsSummary";
// import { DeleteConfirmationDialog } from "../components/PayFeesComponents/DeleteConfirmationDialog";
// import { NotificationSnackbar } from "../components/PayFeesComponents/NotificationSnackbar";
// import { EditStudentDialog } from "../components/PayFeesComponents/EditStudentDialog";
// import { QRPaymentModal } from "../components/PayFeesComponents/QRPaymentModal";
// import { HybridPaymentModal } from "../components/PayFeesComponents/HybridPaymentModal";

// const FeesPayment = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selected, setSelected] = useState([]);
//   const [subscriptionMode, setSubscriptionMode] = useState("2months");
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [currentStudent, setCurrentStudent] = useState(null);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "success",
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const [students, setStudents] = useState([]);
//   const [qrModalOpen, setQrModalOpen] = useState(false);
//   const [hybridModalOpen, setHybridModalOpen] = useState(false);
//   const [rowsPerPage, setRowsPerPage] = useState(5);

//   // Fetch students from backend
//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         setIsLoading(true);
//         const response = await axios.get("https://www.shorthandexam.in/students", {
//           withCredentials: true,
//         });

//         if (response.status === 404) {
//           setStudents([]);
//           showSnackbar("No students found", "info");
//           return;
//         }

//         const transformedStudents = response.data.map((student) => ({
//           id: student.student_id,
//           instituteId: student.instituteId,
//           firstName: student.firstName,
//           lastName: student.lastName,
//           middleName: student.middleName || "",
//           motherName: student.motherName || "",
//           amount: student.amount || "pending",
//           batchYear: student.batch_year,
//           sem: student.sem || "",
//           mobileNo: student.mobile_no || "",
//           email: student.email || "",
//           subjects: student.subjectsId || "",
//           image: student.image || "",
//         }));

//         setStudents(transformedStudents);
//       } catch (error) {
//         console.error("Error fetching students:", error);
//         showSnackbar(
//           error.response?.data?.message || "Failed to load students",
//           "error"
//         );
//         setStudents([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchStudents();
//   }, []);

//   // **MAIN CHANGE: Filter to show only pending students**
//   const unpaidStudents = students.filter((student) => 
//     student.amount !== 'paid' && student.amount !== 'Paid'
//   );

//   const filteredStudents = unpaidStudents.filter((student) =>
//     Object.values(student).some(
//       (value) =>
//         value &&
//         value.toString().toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   );

//   const paginatedStudents = filteredStudents.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   const handleSelectAll = (event) => {
//     if (event.target.checked) {
//       setSelected(paginatedStudents.map((student) => student.id));
//     } else {
//       setSelected([]);
//     }
//   };

//   const handleSelect = (id) => {
//     if (selected.includes(id)) {
//       setSelected(selected.filter((item) => item !== id));
//     } else {
//       setSelected([...selected, id]);
//     }
//   };

//   const handleEdit = (id) => {
//     const studentToEdit = unpaidStudents.find((student) => student.id === id);
//     setCurrentStudent(studentToEdit);
//     setEditDialogOpen(true);
//   };

//   const handleSaveStudent = async (updatedData) => {
//     try {
//       const backendData = {
//         firstName: updatedData.firstName,
//         lastName: updatedData.lastName,
//         middleName: updatedData.middleName || null,
//         motherName: updatedData.motherName || null,
//         batch_year: updatedData.batchYear,
//         sem: updatedData.sem || 1,
//         mobile_no: updatedData.mobileNo || '',
//         email: updatedData.email || '',
//         image: updatedData.image || null
//       };

//       const response = await axios.put(
//         `https://www.shorthandexam.in/students/${updatedData.id}`,
//         backendData,
//         { 
//           withCredentials: true,
//           headers: { 'Content-Type': 'application/json' }
//         }
//       );

//       setStudents(prevStudents =>
//         prevStudents.map(student =>
//           student.id === updatedData.id ? { ...student, ...updatedData } : student
//         )
//       );

//       showSnackbar("Student updated successfully!", "success");
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || 
//                       (error.response?.status === 404 
//                         ? "Student not found" 
//                         : "Update failed");
//       showSnackbar(errorMsg, "error");
//       console.error("Update error:", error.response || error.message);
//     } finally {
//       setEditDialogOpen(false);
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size < 20 * 1024 || file.size > 50 * 1024) {
//         showSnackbar("Please select an image between 20-50 KB", "warning");
//         return;
//       }

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setCurrentStudent((prev) => ({
//           ...prev,
//           image: reader.result,
//         }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleRemoveImage = () => {
//     setCurrentStudent((prev) => ({
//       ...prev,
//       image: "",
//     }));
//   };

//   const openDeleteDialog = () => {
//     if (selected.length === 0) {
//       showSnackbar("Please select at least one student.", "warning");
//       return;
//     }
//     setDeleteDialogOpen(true);
//   };

//   const confirmDelete = async () => {
//     try {
//       setIsLoading(true);
//       let successCount = 0;

//       // Delete each student one by one
//       for (const studentId of selected) {
//         try {
//           await axios.delete(
//             `https://www.shorthandexam.in/studentsdel/${studentId}`,
//             { withCredentials: true }
//           );
//           successCount++;
//         } catch (error) {
//           console.error(`Failed to delete student ${studentId}:`, error);
//         }
//       }

//       // Refresh the student list after deletion
//       const response = await axios.get("https://www.shorthandexam.in/students", {
//         withCredentials: true,
//       });
//       const transformedStudents = response.data.map((student) => ({
//         id: student.student_id,
//         instituteId: student.instituteId,
//         firstName: student.firstName,
//         lastName: student.lastName,
//         middleName: student.middleName || "",
//         motherName: student.motherName || "",
//         amount: student.amount || "pending",
//         batchYear: student.batch_year,
//         sem: student.sem || "",
//         mobileNo: student.mobile_no || "",
//         email: student.email || "",
//         subjects: student.subjectsId || "",
//         image: student.image || "",
//       }));
//       setStudents(transformedStudents);

//       // Show appropriate notification
//       if (successCount === selected.length) {
//         showSnackbar(`Successfully deleted ${successCount} student(s)`, "success");
//       } else {
//         showSnackbar(
//           `Deleted ${successCount} of ${selected.length} student(s)`,
//           "warning"
//         );
//       }
      
//       setSelected([]);
//     } catch (error) {
//       console.error("Error during deletion process:", error);
//       showSnackbar("An error occurred during deletion", "error");
//     } finally {
//       setIsLoading(false);
//       setDeleteDialogOpen(false);
//     }
//   };

//   const showSnackbar = (message, severity = "success") => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const closeSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   const exportToCSV = () => {
//     showSnackbar("Exported students to CSV", "info");
//   };

//   const handleProceedToPayment = async () => {
//     try {
//       const prices = { 
//         '2months': 200, 
//         '4months': 350, 
//         '6months': 450 
//       };
//       const amount = selected.length * prices[subscriptionMode];

//       const response = await axios.post(
//         "https://www.shorthandexam.in/api/payments",
//         {
//           studentIds: selected,
//           amount,
//           subscriptionMode,
//         },
//         {
//           withCredentials: true,
//         }
//       );

//       if (response.data.paymentUrl) {
//         window.location.href = response.data.paymentUrl;
//       } else {
//         showSnackbar("Payment initiated successfully", "success");
//       }
//     } catch (error) {
//       console.error("Payment error:", error);
//       showSnackbar(
//         error.response?.data?.message || "Failed to initiate payment",
//         "error"
//       );
//     }
//   };

//   const handleQrPaymentClick = () => {
//     if (selected.length === 0) {
//       showSnackbar("Please select at least one student", "warning");
//       return;
//     }
//     setQrModalOpen(true);
//   };

//   const handleHybridPaymentClick = () => {
//     if (selected.length === 0) {
//       showSnackbar("Please select at least one student", "warning");
//       return;
//     }
//     setHybridModalOpen(true);
//   };

//   // **UPDATED: Refresh students after successful payment**
//   const refreshStudentsAfterPayment = async () => {
//     try {
//       const response = await axios.get("https://www.shorthandexam.in/students", {
//         withCredentials: true,
//       });
//       const transformedStudents = response.data.map((student) => ({
//         id: student.student_id,
//         instituteId: student.instituteId,
//         firstName: student.firstName,
//         lastName: student.lastName,
//         middleName: student.middleName || "",
//         motherName: student.motherName || "",
//         amount: student.amount || "pending",
//         batchYear: student.batch_year,
//         sem: student.sem || "",
//         mobileNo: student.mobile_no || "",
//         email: student.email || "",
//         subjects: student.subjectsId || "",
//         image: student.image || "",
//       }));
//       setStudents(transformedStudents);
//     } catch (error) {
//       console.error("Error refreshing students:", error);
//     }
//   };

//   if (isLoading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Paper
//       elevation={3}
//       sx={{ margin: "auto", maxWidth: "95%", padding: 3, marginTop: 5 }}
//     >
//       <Header />
//       <WarningsBanner />

//       <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

//       <BulkActionsToolbar
//         selected={selected}
//         openDeleteDialog={openDeleteDialog}
//         exportToCSV={exportToCSV}
//       />

//       {filteredStudents.length > 0 ? (
//         <>
//           <StudentsTable
//             students={paginatedStudents}
//             selected={selected}
//             handleSelectAll={handleSelectAll}
//             handleSelect={handleSelect}
//             handleEdit={handleEdit}
//             setSelected={setSelected}
//             openDeleteDialog={openDeleteDialog}
//             showSnackbar={showSnackbar}
//           />
//           <PaginationControls
//             currentPage={currentPage}
//             setCurrentPage={setCurrentPage}
//             rowsPerPage={rowsPerPage}
//             setRowsPerPage={setRowsPerPage}
//             totalItems={filteredStudents.length}
//           />
//         </>
//       ) : (
//         <EmptyState />
//       )}

//       <Divider sx={{ my: 3 }} />

//       <SubscriptionSelector
//         subscriptionMode={subscriptionMode}
//         setSubscriptionMode={setSubscriptionMode}
//         onQrPaymentClick={handleQrPaymentClick}
//         onHybridPaymentClick={handleHybridPaymentClick}
//       />

//       <PaymentsSummary 
//         selected={selected} 
//         onProceed={handleProceedToPayment}
//         subscriptionMode={subscriptionMode} 
//       />

//       {/* Dialog Components */}
//       <DeleteConfirmationDialog
//         open={deleteDialogOpen}
//         onClose={() => setDeleteDialogOpen(false)}
//         onConfirm={confirmDelete}
//         selectedCount={selected.length}
//       />

//       <EditStudentDialog
//         open={editDialogOpen}
//         onClose={() => setEditDialogOpen(false)}
//         student={currentStudent}
//         onSave={handleSaveStudent}
//         onImageChange={handleImageChange}
//         onRemoveImage={handleRemoveImage}
//       />

//       <QRPaymentModal
//         open={qrModalOpen}
//         onClose={(success) => {
//           setQrModalOpen(false);
//           if (success) {
//             setSelected([]);
//             refreshStudentsAfterPayment(); // Refresh to hide paid students
//             showSnackbar("QR Payment successful! Students have been processed.", "success");
//           }
//         }}
//         selectedStudents={selected}
//         subscriptionMode={subscriptionMode}
//         studentsData={unpaidStudents} // Pass only unpaid students
//       />

//       <HybridPaymentModal
//         open={hybridModalOpen}
//         onClose={(success) => {
//           setHybridModalOpen(false);
//           if (success) {
//             setSelected([]);
//             refreshStudentsAfterPayment(); // Refresh to hide paid students
//             showSnackbar("Smart Payment successful! Students have been processed.", "success");
//           }
//         }}
//         selectedStudents={selected}
//         subscriptionMode={subscriptionMode}
//         studentsData={unpaidStudents} // Pass only unpaid students
//       />

//       <NotificationSnackbar
//         open={snackbar.open}
//         message={snackbar.message}
//         severity={snackbar.severity}
//         onClose={closeSnackbar}
//       />
//     </Paper>
//   );
// };

// export default FeesPayment;


//ShorthandDemo2025\frontend\src\pages\PayFees.jsx  
import React, { useEffect, useState } from "react";
import { Paper, Divider, Box, CircularProgress, Button } from "@mui/material";
import axios from "axios";

// Subject ID to Name mapping (reverse of backend SUBJECT_MAP)
const ID_TO_SUBJECT_MAP = {
  101: "Shorthand Dummy Subject",
  50: "English Shorthand 60 wpm",
  51: "English Shorthand 80 wpm",
  52: "English Shorthand 100 wpm",
  53: "English Shorthand 120 wpm",
  54: "English Shorthand 130 wpm",
  55: "English Shorthand 140 wpm",
  56: "English Shorthand 150 wpm",
  57: "English Shorthand 160 wpm",
  60: "Marathi Shorthand 60 wpm",
  61: "Marathi Shorthand 80 wpm",
  62: "Marathi Shorthand 100 wpm",
  63: "Marathi Shorthand 120 wpm",
  70: "Hindi Shorthand 60 wpm",
  71: "Hindi Shorthand 80 wpm",
  72: "Hindi Shorthand 100 wpm",
  73: "Hindi Shorthand 120 wpm"
};

// Function to convert subject IDs to names
import { Header } from "../components/PayFeesComponents/Header";
import { WarningsBanner } from "../components/PayFeesComponents/WarningsBanner";
import { SearchBar } from "../components/PayFeesComponents/SearchBar";
import { BulkActionsToolbar } from "../components/PayFeesComponents/BulkActionsToolbar";
import { StudentsTable } from "../components/PayFeesComponents/StudentsTable";
import { PaginationControls } from "../components/PayFeesComponents/PaginationControls";
import { EmptyState } from "../components/PayFeesComponents/EmptyState";
import { SubscriptionSelector } from "../components/PayFeesComponents/SubscriptionSelector";
import { PaymentsSummary } from "../components/PayFeesComponents/PaymentsSummary";
import { DeleteConfirmationDialog } from "../components/PayFeesComponents/DeleteConfirmationDialog";
import { NotificationSnackbar } from "../components/PayFeesComponents/NotificationSnackbar";
import { EditStudentDialog } from "../components/PayFeesComponents/EditStudentDialog";
import { QRPaymentModal } from "../components/PayFeesComponents/QRPaymentModal";
import { HybridPaymentModal } from "../components/PayFeesComponents/HybridPaymentModal";

const convertSubjectIdsToNames = (subjectsData) => {
  if (!subjectsData) return "No Subjects";
  
  try {
    let subjectIds = [];
    
    // Handle different formats
    if (typeof subjectsData === 'string') {
      // Check if it's already text (contains letters)
      if (/[a-zA-Z]/.test(subjectsData)) {
        return subjectsData; // Already contains text, keep as is
      }
      
      // Parse as JSON array or comma-separated IDs
      try {
        const parsed = JSON.parse(subjectsData);
        subjectIds = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If JSON parse fails, try splitting by comma
        subjectIds = subjectsData.split(',').map(id => id.trim()).filter(id => id !== '');
      }
    } else if (Array.isArray(subjectsData)) {
      subjectIds = subjectsData;
    } else {
      return "Invalid Subject Format";
    }
    
    // Convert IDs to names
    const subjectNames = subjectIds
      .map(id => ID_TO_SUBJECT_MAP[parseInt(id)] || `Unknown Subject (${id})`)
      .filter(name => !name.includes('Unknown Subject ()'));
    
    return subjectNames.length > 0 ? subjectNames.join(", ") : "No Subjects";
  } catch (error) {
    console.error("Error converting subject IDs:", error);
    return "Error parsing subjects";
  }
};

const FeesPayment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState([]);
  const [subscriptionMode, setSubscriptionMode] = useState("2months");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [hybridModalOpen, setHybridModalOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch students from backend
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("https://www.shorthandexam.in/students", {
          withCredentials: true,
        });

        if (response.status === 404) {
          setStudents([]);
          showSnackbar("No students found", "info");
          return;
        }

        const transformedStudents = response.data.map((student) => ({
          id: student.student_id,
          instituteId: student.instituteId,
          firstName: student.firstName,
          lastName: student.lastName,
          middleName: student.middleName || "",
          motherName: student.motherName || "",
          amount: student.amount || "pending",
          batchYear: student.batch_year,
          sem: student.sem || "",
          mobileNo: student.mobile_no || "",
          email: student.email || "",
          subjects: convertSubjectIdsToNames(student.subjectsId),
          image: student.image || "",
        }));

        setStudents(transformedStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
        showSnackbar(
          error.response?.data?.message || "Failed to load students",
          "error"
        );
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter to show students with 'pending' and 'waiting' status (not 'paid')
  const unpaidStudents = students.filter((student) => 
    student.amount !== 'paid' && student.amount !== 'Paid'
  );

  const filteredStudents = unpaidStudents.filter((student) =>
    Object.values(student).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelected(paginatedStudents.map((student) => student.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleEdit = (id) => {
    const studentToEdit = unpaidStudents.find((student) => student.id === id);
    setCurrentStudent(studentToEdit);
    setEditDialogOpen(true);
  };

  const handleSaveStudent = async (updatedData) => {
    try {
      const backendData = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        middleName: updatedData.middleName || null,
        motherName: updatedData.motherName || null,
        batch_year: updatedData.batchYear,
        sem: updatedData.sem || 1,
        mobile_no: updatedData.mobileNo || '',
        email: updatedData.email || '',
        image: updatedData.image || null
      };

      const response = await axios.put(
        `https://www.shorthandexam.in/students/${updatedData.id}`,
        backendData,
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      setStudents(prevStudents =>
        prevStudents.map(student =>
          student.id === updatedData.id ? { ...student, ...updatedData } : student
        )
      );

      showSnackbar("Student updated successfully!", "success");
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                      (error.response?.status === 404 
                        ? "Student not found" 
                        : "Update failed");
      showSnackbar(errorMsg, "error");
      console.error("Update error:", error.response || error.message);
    } finally {
      setEditDialogOpen(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size < 20 * 1024 || file.size > 50 * 1024) {
        showSnackbar("Please select an image between 20-50 KB", "warning");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentStudent((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCurrentStudent((prev) => ({
      ...prev,
      image: "",
    }));
  };

  const openDeleteDialog = () => {
    if (selected.length === 0) {
      showSnackbar("Please select at least one student.", "warning");
      return;
    }
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setIsLoading(true);
      let successCount = 0;

      // Delete each student one by one
      for (const studentId of selected) {
        try {
          await axios.delete(
            `https://www.shorthandexam.in/studentsdel/${studentId}`,
            { withCredentials: true }
          );
          successCount++;
        } catch (error) {
          console.error(`Failed to delete student ${studentId}:`, error);
        }
      }

      // Refresh the student list after deletion
      const response = await axios.get("https://www.shorthandexam.in/students", {
        withCredentials: true,
      });
      const transformedStudents = response.data.map((student) => ({
        id: student.student_id,
        instituteId: student.instituteId,
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName || "",
        motherName: student.motherName || "",
        amount: student.amount || "pending",
        batchYear: student.batch_year,
        sem: student.sem || "",
        mobileNo: student.mobile_no || "",
        email: student.email || "",
        subjects: convertSubjectIdsToNames(student.subjectsId),
        image: student.image || "",
      }));
      setStudents(transformedStudents);

      // Show appropriate notification
      if (successCount === selected.length) {
        showSnackbar(`Successfully deleted ${successCount} student(s)`, "success");
      } else {
        showSnackbar(
          `Deleted ${successCount} of ${selected.length} student(s)`,
          "warning"
        );
      }
      
      setSelected([]);
    } catch (error) {
      console.error("Error during deletion process:", error);
      showSnackbar("An error occurred during deletion", "error");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const exportToCSV = () => {
    showSnackbar("Exported students to CSV", "info");
  };

  const handleProceedToPayment = async () => {
    try {
      const prices = { 
        '2months': 200, 
        '4months': 350, 
        '6months': 450 
      };
      
      // Each student_id represents one subject, so multiply by number of selected IDs
      const amount = selected.length * prices[subscriptionMode];

      const response = await axios.post(
        "https://www.shorthandexam.in/api/payments",
        {
          studentIds: selected,
          amount,
          subscriptionMode,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        showSnackbar("Payment initiated successfully", "success");
      }
    } catch (error) {
      console.error("Payment error:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to initiate payment",
        "error"
      );
    }
  };

  const handleQrPaymentClick = () => {
    if (selected.length === 0) {
      showSnackbar("Please select at least one student", "warning");
      return;
    }
    setQrModalOpen(true);
  };

  const handleHybridPaymentClick = () => {
    if (selected.length === 0) {
      showSnackbar("Please select at least one student", "warning");
      return;
    }
    setHybridModalOpen(true);
  };

  // Refresh students after successful payment
  const refreshStudentsAfterPayment = async () => {
    try {
      const response = await axios.get("https://www.shorthandexam.in/students", {
        withCredentials: true,
      });
      const transformedStudents = response.data.map((student) => ({
        id: student.student_id,
        instituteId: student.instituteId,
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName || "",
        motherName: student.motherName || "",
        amount: student.amount || "pending",
        batchYear: student.batch_year,
        sem: student.sem || "",
        mobileNo: student.mobile_no || "",
        email: student.email || "",
        subjects: student.subjectsId || "",
        image: student.image || "",
      }));
      setStudents(transformedStudents);
    } catch (error) {
      console.error("Error refreshing students:", error);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{ margin: "auto", maxWidth: "95%", padding: 3, marginTop: 5 }}
    >
      <Header />
      <WarningsBanner />

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <BulkActionsToolbar
        selected={selected}
        openDeleteDialog={openDeleteDialog}
        exportToCSV={exportToCSV}
      />

      {filteredStudents.length > 0 ? (
        <>
          <StudentsTable
            students={paginatedStudents}
            selected={selected}
            handleSelectAll={handleSelectAll}
            handleSelect={handleSelect}
            handleEdit={handleEdit}
            setSelected={setSelected}
            openDeleteDialog={openDeleteDialog}
            showSnackbar={showSnackbar}
          />
          <PaginationControls
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalItems={filteredStudents.length}
          />
        </>
      ) : (
        <EmptyState />
      )}

      <Divider sx={{ my: 3 }} />

      <SubscriptionSelector
        subscriptionMode={subscriptionMode}
        setSubscriptionMode={setSubscriptionMode}
        onQrPaymentClick={handleQrPaymentClick}
        onHybridPaymentClick={handleHybridPaymentClick}
      />

      <PaymentsSummary 
        selected={selected} 
        onProceed={handleProceedToPayment}
        subscriptionMode={subscriptionMode}
        studentsData={students}
      />

      {/* Dialog Components */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        selectedCount={selected.length}
      />

      <EditStudentDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        student={currentStudent}
        onSave={handleSaveStudent}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
      />

      <QRPaymentModal
        open={qrModalOpen}
        onClose={(success) => {
          setQrModalOpen(false);
          if (success) {
            setSelected([]);
            refreshStudentsAfterPayment(); // Refresh to update student status
            showSnackbar("QR Payment successful! Students have been processed.", "success");
          }
        }}
        selectedStudents={selected}
        subscriptionMode={subscriptionMode}
        studentsData={unpaidStudents} // Pass only unpaid students
      />

      <HybridPaymentModal
        open={hybridModalOpen}
        onClose={(success) => {
          setHybridModalOpen(false);
          if (success) {
            setSelected([]);
            refreshStudentsAfterPayment(); // Refresh to update student status
            showSnackbar("Smart Payment successful! Students have been processed.", "success");
          }
        }}
        selectedStudents={selected}
        subscriptionMode={subscriptionMode}
        studentsData={unpaidStudents} // Pass only unpaid students
      />

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </Paper>
  );
};

export default FeesPayment;