const express = require('express');
const router = express.Router();
const db = require('../db');

// GET dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const [empCount] = await db.query(
            'SELECT COUNT(*) AS count FROM employees'
        );

        const [deptCount] = await db.query(
            'SELECT COUNT(*) AS count FROM departments'
        );

        const [projectCount] = await db.query(
            'SELECT COUNT(*) AS count FROM projects'
        );

        const [onLeaveCount] = await db.query(
            "SELECT COUNT(*) AS count FROM leave_records WHERE status = 'Approved'"
        );

        res.json({
            totalEmployees: empCount[0].count,
            totalDepartments: deptCount[0].count,
            totalProjects: projectCount[0].count,
            employeesOnLeave: onLeaveCount[0].count
        });
    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;