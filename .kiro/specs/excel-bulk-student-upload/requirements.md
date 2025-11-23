# Requirements Document

## Introduction

This feature enables institutes to upload multiple student records simultaneously using Excel files (.xlsx, .xls) to streamline the student registration process. Currently, students can only be registered individually through a form. This bulk upload capability will significantly reduce the time and effort required to onboard large batches of students.

## Glossary

- **System**: The student management application backend and frontend
- **Institute**: An authenticated educational institution user with an active session
- **Excel File**: A spreadsheet file in .xlsx or .xls format containing student data
- **Student Record**: A single row in the Excel file representing one student's information
- **Bulk Upload**: The process of importing multiple student records from an Excel file in a single operation
- **Validation**: The process of checking student data for completeness, format correctness, and business rule compliance
- **Subject Mapping**: The conversion of subject names to their corresponding subject IDs using the SUBJECT_MAP

## Requirements

### Requirement 1

**User Story:** As an institute administrator, I want to upload student data using an Excel file, so that I can register multiple students quickly without entering each one manually.

#### Acceptance Criteria

1. WHEN the Institute navigates to the student registration page, THE System SHALL display a bulk upload option alongside the individual registration form
2. WHEN the Institute selects an Excel file for upload, THE System SHALL accept files with .xlsx and .xls extensions only
3. IF the Institute attempts to upload a file with an unsupported format, THEN THE System SHALL display an error message indicating only Excel files are accepted
4. WHEN the Institute uploads a valid Excel file, THE System SHALL parse all rows and extract student data from each row
5. WHEN the System processes the Excel file, THE System SHALL generate unique sequential student IDs for each student record starting from the next available ID for that institute

### Requirement 2

**User Story:** As an institute administrator, I want the system to validate uploaded student data, so that I can identify and correct errors before students are registered in the database.

#### Acceptance Criteria

1. WHEN the System parses the Excel file, THE System SHALL validate that all required fields (firstName, lastName, email, subjects) are present for each student record
2. IF any student record contains missing required fields, THEN THE System SHALL mark that record as invalid and include it in an error report
3. WHEN the System validates email addresses, THE System SHALL verify each email follows a valid email format pattern
4. WHEN the System validates subject names, THE System SHALL verify each subject name exists in the SUBJECT_MAP
5. IF validation errors are detected, THEN THE System SHALL return a detailed error report listing the row number and specific validation issues for each invalid record

### Requirement 3

**User Story:** As an institute administrator, I want the system to automatically generate passwords for bulk-uploaded students, so that each student receives secure login credentials without manual password creation.

#### Acceptance Criteria

1. WHEN the System processes a valid student record from the Excel file, THE System SHALL generate a unique 4-digit numeric password for that student
2. WHEN the System creates multiple entries for a student with multiple subjects, THE System SHALL use the same password across all subject entries for that student
3. WHEN the bulk upload completes successfully, THE System SHALL return a list of all registered students with their generated student IDs and passwords
4. THE System SHALL store the generated password in the database in the same format as manually registered students

### Requirement 4

**User Story:** As an institute administrator, I want the system to handle students with multiple subjects correctly during bulk upload, so that the data structure matches the existing single-registration behavior.

#### Acceptance Criteria

1. WHEN a student record contains multiple subjects, THE System SHALL create separate database entries for each subject with sequential student IDs
2. WHEN the System creates multiple entries for one student, THE System SHALL increment the student ID by 1 for each additional subject
3. WHEN the System stores subject data, THE System SHALL convert subject names to subject IDs using the SUBJECT_MAP
4. WHEN the System creates each subject entry, THE System SHALL store the subject ID as a JSON array containing a single subject ID
5. THE System SHALL maintain consistency with the existing registerStudent controller logic for subject handling

### Requirement 5

**User Story:** As an institute administrator, I want to receive clear feedback after uploading an Excel file, so that I know which students were successfully registered and which had errors.

#### Acceptance Criteria

1. WHEN the bulk upload completes, THE System SHALL return a success response containing the count of successfully registered students
2. WHEN the bulk upload completes, THE System SHALL include a list of all registered student IDs and their temporary passwords in the response
3. IF any records fail validation, THEN THE System SHALL return a partial success response with both successful registrations and a detailed error list
4. WHEN errors occur during upload, THE System SHALL provide the Excel row number for each failed record to help the Institute locate and fix issues
5. THE System SHALL display the upload results in a user-friendly format on the frontend with clear success and error sections

### Requirement 6

**User Story:** As an institute administrator, I want to download a template Excel file, so that I know the correct format and required columns for bulk student upload.

#### Acceptance Criteria

1. WHEN the Institute views the bulk upload interface, THE System SHALL provide a download link for an Excel template file
2. WHEN the Institute downloads the template, THE System SHALL provide an Excel file with pre-defined column headers matching the required student fields
3. THE template file SHALL include columns for firstName, lastName, motherName, middleName, email, mobile_no, batch_year, sem, batchStartDate, batchEndDate, and subjects
4. THE template file SHALL include example rows demonstrating the correct data format for each field
5. THE template file SHALL include instructions or comments explaining how to format the subjects column for students with multiple subjects
