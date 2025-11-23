# Design Document: Fix Database Connection Leaks

## Overview

This design addresses critical database connection management issues causing high CPU usage in the Node.js backend application. The solution involves fixing connection pool configuration, implementing proper connection lifecycle management, and refactoring transaction handling across all database operations.

### Current Issues Identified

1. **Incorrect Pool Configuration**: `backend/config/db.js` uses `createConnection` instead of `createPool`, making pool options ineffective
2. **Unrealistic Connection Limits**: `backend/config/db1.js` has `connectionLimit: 1000000` which is excessive
3. **Missing Connection Release**: Direct use of `connection.query()` in transactions without proper connection management
4. **Transaction Mismanagement**: `/verifyPayment1` route uses transactions but doesn't acquire/release connections properly
5. **No Error Handling**: Missing connection pool event listeners and graceful shutdown

## Architecture

### Connection Pool Strategy

The application will use a single, properly configured connection pool that:
- Uses `mysql2/promise` with `createPool()`
- Sets reasonable connection limits (10-50 connections)
- Implements proper error handling and monitoring
- Provides helper functions for common patterns (simple queries, transactions)

### Connection Lifecycle Patterns

**Pattern 1: Simple Queries (Recommended)**
```javascript
// Pool automatically manages connection
const [results] = await pool.query('SELECT * FROM table WHERE id = ?', [id]);
```

**Pattern 2: Explicit Connection (When Needed)**
```javascript
const connection = await pool.getConnection();
try {
  const [results] = await connection.query('SELECT ...');
  return results;
} finally {
  connection.release(); // Always release
}
```

**Pattern 3: Transactions (Proper Management)**
```javascript
const connection = await pool.getConnection();
try {
  await connection.beginTransaction();
  await connection.query('INSERT ...');
  await connection.query('UPDATE ...');
  await connection.commit();
} catch (error) {
  await connection.rollback();
  throw error;
} finally {
  connection.release(); // Critical!
}
```

## Components and Interfaces

### 1. Database Configuration Module (`backend/config/db.js`)

**Purpose**: Provide a single, properly configured connection pool

**Interface**:
```javascript
// backend/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '103.17.193.168',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'tanuj1221',
  database: process.env.DB_NAME || 'sh_demo',
  waitForConnections: true,
  connectionLimit: 20, // Reasonable limit
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Event listeners for monitoring
pool.on('connection', (connection) => {
  console.log('[DB] New connection established:', connection.threadId);
});

pool.on('error', (err) => {
  console.error('[DB] Pool error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('[DB] Closing connection pool...');
  await pool.end();
  process.exit(0);
});

module.exports = pool;
```

**Changes**:
- Replace `createConnection` with `createPool`
- Reduce `connectionLimit` from 1000000 to 20
- Add connection pool event listeners
- Add graceful shutdown handler
- Remove `backend/config/db1.js` (consolidate to single config)

### 2. Database Helper Utilities (`backend/utils/dbHelpers.js`)

**Purpose**: Provide reusable patterns for common database operations

**Interface**:
```javascript
// backend/utils/dbHelpers.js
const pool = require('../config/db');

/**
 * Execute a transaction with automatic connection management
 * @param {Function} callback - Async function that receives connection
 * @returns {Promise<any>} Result from callback
 */
async function withTransaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Execute query with automatic connection management (for complex scenarios)
 * @param {Function} callback - Async function that receives connection
 * @returns {Promise<any>} Result from callback
 */
async function withConnection(callback) {
  const connection = await pool.getConnection();
  try {
    return await callback(connection);
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  withTransaction,
  withConnection
};
```

### 3. Application Entry Point Updates (`backend/app.js`)

**Changes Required**:
- Update import from `require('./config/db1')` to `require('./config/db')`
- Remove direct transaction handling in payment routes
- Use helper functions for transaction management

### 4. Route and Controller Updates

**Files Requiring Updates**:

**High Priority (Transaction Issues)**:
- `backend/app.js` - `/verifyPayment1` route (lines 115-180)
- Any controller using `connection.query('START TRANSACTION')`

**Medium Priority (Direct Query Usage)**:
- `backend/controllers/Institute.js` - All query operations
- `backend/routes/noticeRoutes.js` - CRUD operations
- `backend/routes/contactRoutes.js` - CRUD operations
- `backend/routes/storageRoutes.js` - File operations
- `backend/services/resetTimerService.js` - Timer reset

**Low Priority (Scripts - Run Once)**:
- `backend/scripts/*.js` - Migration and utility scripts

## Data Models

No changes to data models required. This is purely an infrastructure fix.

## Error Handling

### Connection Pool Errors

```javascript
// In routes/controllers
try {
  const [results] = await pool.query('SELECT ...');
  res.json(results);
} catch (error) {
  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('[DB] Connection lost:', error);
    return res.status(503).json({ 
      success: false, 
      message: 'Database connection lost' 
    });
  }
  
  if (error.code === 'ER_CON_COUNT_ERROR') {
    console.error('[DB] Too many connections:', error);
    return res.status(503).json({ 
      success: false, 
      message: 'Service temporarily unavailable' 
    });
  }
  
  console.error('[DB] Query error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Database error' 
  });
}
```

### Transaction Error Handling

All transactions will use the `withTransaction` helper which automatically:
1. Begins transaction
2. Commits on success
3. Rolls back on error
4. Releases connection in all cases

## Testing Strategy

### Manual Testing

1. **Connection Pool Monitoring**
   - Add logging to track active connections
   - Monitor connection count during load
   - Verify connections are released after requests

2. **Load Testing**
   - Use tools like Apache Bench or Artillery
   - Test concurrent requests (50-100 simultaneous)
   - Monitor CPU usage and connection pool stats

3. **Transaction Testing**
   - Test payment routes with multiple concurrent requests
   - Verify rollback on errors
   - Confirm no connection leaks after failures

### Verification Steps

1. **Before Fix**: Run `SHOW PROCESSLIST;` in MySQL to see connection count
2. **After Fix**: Verify connection count stays stable under load
3. **CPU Monitoring**: Use `top` or Task Manager to verify CPU usage drops
4. **Application Logs**: Check for connection pool events and errors

### Test Scenarios

1. **Normal Operation**: 100 sequential requests should maintain stable connection count
2. **Error Conditions**: Failed transactions should release connections
3. **High Load**: 50 concurrent requests should not exceed connection limit
4. **Graceful Shutdown**: SIGINT should close all connections cleanly

## Implementation Phases

### Phase 1: Fix Configuration (Critical)
- Update `backend/config/db.js` with proper pool configuration
- Remove `backend/config/db1.js`
- Update all imports to use new config

### Phase 2: Create Helper Utilities
- Implement `backend/utils/dbHelpers.js`
- Add transaction and connection helpers

### Phase 3: Fix Critical Routes (High Priority)
- Fix `/verifyPayment1` transaction handling in `app.js`
- Fix `/verifyPayment` in `app.js`
- Update any other routes with explicit transactions

### Phase 4: Refactor Controllers (Medium Priority)
- Update `backend/controllers/Institute.js`
- Update route files in `backend/routes/`
- Update `backend/services/resetTimerService.js`

### Phase 5: Testing and Monitoring
- Add connection pool monitoring
- Perform load testing
- Verify CPU usage improvement

## Monitoring and Maintenance

### Connection Pool Metrics

Add endpoint for monitoring (admin only):
```javascript
router.get('/api/admin/db-stats', isAuthenticatedAdmin, async (req, res) => {
  const stats = {
    totalConnections: pool.pool._allConnections.length,
    freeConnections: pool.pool._freeConnections.length,
    activeConnections: pool.pool._allConnections.length - pool.pool._freeConnections.length,
    queuedRequests: pool.pool._connectionQueue.length
  };
  res.json(stats);
});
```

### Logging Strategy

- Log connection acquisition/release in development
- Log pool errors in production
- Monitor connection count trends
- Alert on connection pool exhaustion

## Performance Expectations

**Before Fix**:
- High CPU usage (60-100%)
- Growing connection count
- Potential connection timeout errors
- Degraded performance over time

**After Fix**:
- Normal CPU usage (10-30%)
- Stable connection count (< 20 active)
- No connection timeout errors
- Consistent performance

## Security Considerations

1. **Environment Variables**: Move database credentials to `.env` file
2. **Connection Limits**: Prevent DoS by limiting connection pool size
3. **Error Messages**: Don't expose database details in error responses
4. **Graceful Degradation**: Return 503 when pool is exhausted instead of crashing
