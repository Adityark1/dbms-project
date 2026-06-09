const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Import routes
const employeeRoutes = require('./routes/employees');
const dashboardRoutes = require('./routes/dashboard');
const departmentRoutes = require('./routes/departments');
const projectRoutes = require('./routes/projects');
const attendanceRoutes = require('./routes/attendance');
const leaveRoutes = require('./routes/leave-records');
const payrollRoutes = require('./routes/payroll');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Test route
app.get('/api/test', (req, res) => {
    res.json({
        message: 'HRMS Server is running successfully!'
    });
});

// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave-records', leaveRoutes);
app.use('/api/payroll', payrollRoutes);

// Root route -> Dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});