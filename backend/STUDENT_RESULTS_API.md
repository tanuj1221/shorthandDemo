# Student Results API Documentation

## Overview
This API handles storing and retrieving student test results with automatic institute ID lookup and Asia/Kolkata timezone support.

## Database Table: `student_results`

```sql
- id (INT, AUTO_INCREMENT, PRIMARY KEY)
- student_id (INT, NOT NULL)
- institute_id (INT, NOT NULL)
- passage_name (VARCHAR 255)
- marks (DECIMAL 5,2)
- total_mistakes (INT)
- grammar_mistakes (INT)
- spelling_mistakes (INT)
- added_words (INT)
- missed_words (INT)
- test_date (DATE) - Stored in YYYY-MM-DD format
- test_time (TIME) - Stored in HH:MM:SS format
- created_at (TIMESTAMP)
```

## Setup

Run the setup script to create the table:

```bash
node backend/scripts/setupStudentResultsTable.js
```

## API Endpoints

### 1. Submit Test Results

**POST** `/api/submit-results`

Submits a student's test result. Automatically fetches institute_id from student_id and records date/time in Asia/Kolkata timezone.

**Request Body:**
```json
{
  "student_id": "2520001",
  "passage_name": "Passage 1",
  "marks": 45.67,
  "total_mistakes": 13,
  "grammar_mistakes": 2,
  "spelling_mistakes": 5,
  "added_words": 3,
  "missed_words": 3
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Results submitted successfully",
  "data": {
    "result_id": 1,
    "student_id": "2520001",
    "institute_id": 123,
    "passage_name": "Passage 1",
    "marks": 45.67,
    "date": "27/11/2024",
    "time": "18:30:45"
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `404` - Student not found
- `500` - Server error

---

### 2. Get Student Results

**GET** `/api/student-results/:student_id`

Retrieves all test results for a specific student.

**Example:**
```
GET /api/student-results/2520001
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "student_id": "2520001",
      "institute_id": 123,
      "passage_name": "Passage 1",
      "marks": 45.67,
      "total_mistakes": 13,
      "grammar_mistakes": 2,
      "spelling_mistakes": 5,
      "added_words": 3,
      "missed_words": 3,
      "test_date": "27/11/2024",
      "test_time": "18:30:45",
      "created_at": "2024-11-27T13:00:45.000Z"
    }
  ]
}
```

---

### 3. Get Institute Results

**GET** `/api/institute-results/:institute_id`

Retrieves all test results for all students in an institute.

**Example:**
```
GET /api/institute-results/123
```

**Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "id": 1,
      "student_id": "2520001",
      "institute_id": 123,
      "student_name": "John Doe",
      "passage_name": "Passage 1",
      "marks": 45.67,
      "total_mistakes": 13,
      "grammar_mistakes": 2,
      "spelling_mistakes": 5,
      "added_words": 3,
      "missed_words": 3,
      "test_date": "27/11/2024",
      "test_time": "18:30:45",
      "created_at": "2024-11-27T13:00:45.000Z"
    }
  ]
}
```

---

## Testing with cURL

### Submit Results
```bash
curl -X POST http://localhost:3001/api/submit-results \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "2520001",
    "passage_name": "Passage 1",
    "marks": 45.67,
    "total_mistakes": 13,
    "grammar_mistakes": 2,
    "spelling_mistakes": 5,
    "added_words": 3,
    "missed_words": 3
  }'
```

### Get Student Results
```bash
curl http://localhost:3001/api/student-results/2520001
```

### Get Institute Results
```bash
curl http://localhost:3001/api/institute-results/123
```

---

## Notes

- **Timezone**: All dates and times are automatically converted to Asia/Kolkata timezone
- **Date Format**: Dates are displayed as DD/MM/YYYY but stored as YYYY-MM-DD in MySQL
- **Institute ID**: Automatically fetched from student14 table using student_id
- **Foreign Key**: student_id has a foreign key constraint with CASCADE delete
- **Indexes**: Added on student_id, institute_id, and test_date for better query performance
