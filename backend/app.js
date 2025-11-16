const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/studentRoutes');
const datainput = require('./routes/inputDataRoutes');
const subjectRoutes = require('./routes/subjectsroutes');
const instituteRoutes = require('./routes/instituteRoutes');
const adminView = require('./routes/adminViewRoutes');
const mockroute = require('./routes/mockRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const contactRoutes = require('./routes/contactRoutes');
const crypto = require('crypto');
const connection = require('./config/db1');
const auth1 = require('./routes/isauthsti');
const path = require('path');
const Razorpay = require('razorpay');

const app = express();
const PORT = 3001;

// CORS Configuration - SINGLE configuration only
app.use(cors({
  origin: ['http://localhost:5173', 'http://45.119.47.81:8080', 'http://localhost:3000'],
  credentials: true
}));

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Session Configuration
app.use(session({
  secret: 'divis@GeYT',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Razorpay Configuration
const razorpay = new Razorpay({
  key_id: 'rzp_live_d4DgqU3P4V8cqL',
  key_secret: 'CdzEa5TlmdsPYD5arKVsrFkt'
});

// Payment Routes
app.post('/createOrder', async (req, res) => {
  try {
    const payment_capture = true;
    const amount = req.body.amount;
    const currency = 'INR';

    const options = {
      amount: amount * 100, // Razorpay expects the amount in paise
      currency,
      receipt: 'rcptid_' + new Date().getTime(),
      payment_capture
    };

    const response = await razorpay.orders.create(options);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).send(error);
  }
});


app.post('/verifyPayment', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentIds // Expect an array of studentIds from the frontend
    } = req.body;

    // Create a hash using the order ID, payment ID, and Razorpay key secret
    const shasum = crypto.createHmac('sha256', razorpay.key_secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    // Check if the created hash matches the razorpay_signature
    if (digest !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature. Payment not verified.' });
    }

    // If the payment is verified, update the payment status for all selected students
    const updateQuery = "UPDATE student14 SET amount = 'paid' WHERE student_id IN (?)";
    await connection.query(updateQuery, [studentIds]);

    res.json({ success: true, message: 'Payment verified and student records updated.' });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/verifyPayment1', async (req, res) => {
  // Validate request format
  if (!req.body?.payments || !Array.isArray(req.body.payments)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Invalid request format",
        details: ["Request must contain a 'payments' array"]
      }
    });
  }

  const { payments } = req.body;

  // Validate each payment
  const validationErrors = [];
  payments.forEach((payment, index) => {
    if (!payment.studentId) validationErrors.push(`Payment ${index + 1}: Missing studentId`);
    if (!payment.utr || payment.utr.trim() === '') validationErrors.push(`Payment ${index + 1}: Invalid UTR`);
    if (typeof payment.amount !== 'number' || isNaN(payment.amount)) {
      validationErrors.push(`Payment ${index + 1}: Amount must be a valid number`);
    }
    if (payment.amount <= 0) validationErrors.push(`Payment ${index + 1}: Amount must be positive`);
  });

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Payment validation failed",
        details: validationErrors
      }
    });
  }

  try {
    // Start transaction directly with the pool
    await connection.query('START TRANSACTION');

    // Get subscription mode from request or default to 2 months
    const subscriptionMode = req.body.subscriptionMode || '2months';

    // Calculate batch dates
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset
    const istDate = new Date(now.getTime() + istOffset);

    // Format dates as DD/MM/YYYY for batch dates
    const batchStartDate = istDate.toLocaleDateString('en-GB'); // DD/MM/YYYY

    // Calculate end date based on subscription
    const monthsToAdd = {
      '2months': 2,
      '4months': 4,
      '6months': 6
    };

    const endDate = new Date(istDate);
    endDate.setMonth(endDate.getMonth() + monthsToAdd[subscriptionMode]);
    const batchEndDate = endDate.toLocaleDateString('en-GB'); // DD/MM/YYYY

    // Current datetime for payment record
    const currentDateTime = istDate.toISOString().slice(0, 19).replace('T', ' ');

    // 1. Update student records with batch information - keep status as 'waiting'
    const studentIds = payments.map(p => p.studentId);
    const updateQuery = `UPDATE student14 SET 
                        amount = 'waiting',
                        batchStartDate = ?,
                        batchEndDate = ?
                        WHERE student_id IN (?)`;

    await connection.query(updateQuery, [batchStartDate, batchEndDate, studentIds]);

    // 2. Prepare payment records
    const values = payments.map(payment => [
      payment.studentId,
      payment.name || 'N/A',
      payment.contact || 'N/A',
      payment.email || 'N/A',
      payment.utr,
      currentDateTime,
      payment.amount
    ]);

    // 3. Insert payments
    const insertQuery = `INSERT INTO qrpay (student_id, user, mobile, email, utr, date, amount) VALUES ?`;
    await connection.query(insertQuery, [values]);

    // Commit transaction
    await connection.query('COMMIT');

    return res.json({
      success: true,
      message: `Successfully processed ${payments.length} payment(s)`,
      paymentCount: payments.length,
      batchStartDate: batchStartDate,
      batchEndDate: batchEndDate,
      subscriptionMode: subscriptionMode,
      utr: payments[0]?.utr
    });

  } catch (error) {
    // Rollback transaction on error
    await connection.query('ROLLBACK');

    console.error('Payment Processing Error:', {
      message: error.message,
      sqlMessage: error.sqlMessage,
      sql: error.sql,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    return res.status(500).json({
      success: false,
      error: {
        message: "Payment processing failed",
        details: [error.sqlMessage || error.message],
        code: error.code
      }
    });
  }
});

// Session check endpoint
app.get('/check-session', (req, res) => {
  if (req.session && req.session.instituteId) {
    res.json({ 
      authenticated: true, 
      instituteId: req.session.instituteId,
      instituteName: req.session.instituteName 
    });
  } else if (req.session && req.session.isAdmin) {
    res.json({ 
      authenticated: true, 
      isAdmin: true 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// API Routes
app.use(authRoutes);
app.use(studentRoutes);
app.use(datainput);
app.use(subjectRoutes);
app.use(instituteRoutes);
app.use(adminView);
app.use(mockroute);
app.use(auth1);
app.use(noticeRoutes);
app.use(contactRoutes);

// Serve Static Frontend (Production)
app.use(express.static(path.join(__dirname, 'dist')));
app.get(/^\/(?!api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

