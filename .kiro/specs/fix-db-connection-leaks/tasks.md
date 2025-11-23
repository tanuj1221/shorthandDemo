# Implementation Plan: Fix Database Connection Leaks

- [x] 1. Fix database configuration and create helper utilities





  - Replace `createConnection` with `createPool` in `backend/config/db.js`
  - Set reasonable `connectionLimit` (20 instead of 10000/1000000)
  - Add connection pool event listeners for monitoring
  - Add graceful shutdown handler for SIGINT
  - Create `backend/utils/dbHelpers.js` with `withTransaction` and `withConnection` helper functions
  - Remove `backend/config/db1.js` file
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 4.3, 4.4_
-

- [x] 2. Fix critical payment route transaction handling




  - Update `backend/app.js` to import from `backend/config/db` instead of `backend/config/db1`
  - Refactor `/verifyPayment1` route to use `withTransaction` helper for proper connection management
  - Refactor `/verifyPayment` route to use pool.query() for simple queries
  - Add proper error handling for connection pool errors
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2_
-

- [x] 3. Refactor Institute controller database operations



  - Update all `connection.query()` calls in `backend/controllers/Institute.js` to use `pool.query()`
  - Ensure all queries properly handle errors and don't leak connections
  - Update imports to use the new database configuration
  - _Requirements: 2.1, 2.4, 4.1_




- [ ] 4. Refactor route files for proper connection management

  - Update `backend/routes/noticeRoutes.js` to use pool.query() for all database operations
  - Update `backend/routes/contactRoutes.js` to use pool.query() for all database operations
  - Update `backend/routes/storageRoutes.js` to use pool.query() for all database operations
  - Update `backend/services/resetTimerService.js` to use pool.query()




  - Ensure all imports reference the correct database configuration
  - _Requirements: 2.1, 2.4, 4.1_

- [ ] 5. Add database connection monitoring and verification

  - Add admin endpoint `/api/admin/db-stats` to monitor connection pool metrics
  - Add logging for connection pool events in development mode
  - Update error responses to return appropriate HTTP status codes for connection errors
  - _Requirements: 4.1, 4.2, 4.3_
