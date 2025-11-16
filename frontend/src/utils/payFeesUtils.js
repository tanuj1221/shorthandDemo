export const filterStudents = (students, searchTerm) => {
  return students.filter(student =>
    Object.values(student).some(
      value => value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
};

export const paginateStudents = (students, currentPage, rowsPerPage) => {
  return students.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
};

export const exportToCSV = (students) => {
  const csvRows = [];
  const headers = ['ID', 'First Name', 'Last Name', 'Amount', 'Subject'];
  csvRows.push(headers.join(','));
  students.forEach(student => {
    csvRows.push([student.id, student.firstName, student.lastName, student.amount, student.subjects].join(','));
  });
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'students.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const calculateTotalAmount = (selectedCount) => selectedCount * 200;