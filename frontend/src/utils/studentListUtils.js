export const downloadPDF = (students) => {
  const doc = new jsPDF();
  doc.text('Student List', 14, 15);
  
  const tableData = students.map(student => [
    student.student_id,
    `${student.firstName} ${student.lastName}`,
    student.motherName,
    student.amount,
    student.subjects,
    student.batchYear
  ]);

  doc.autoTable({
    head: [['ID', 'Name', "Mother's Name", 'Status', 'Subject', 'Batch Year']],
    body: tableData,
    startY: 20,
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 15 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30 }
    }
  });

  doc.save('student_list.pdf');
};

export const downloadExcel = (students) => {
  const worksheet = XLSX.utils.json_to_sheet(students);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, "student_list.xlsx");
};

export const filterStudents = (students, searchTerm, statusFilter) => {
  return students.filter(student => {
    const matchesSearch = Object.values(student).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === 'all' || student.amount === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

export const paginateStudents = (students, currentPage, rowsPerPage) => {
  return students.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
};