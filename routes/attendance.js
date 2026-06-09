const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all attendance records
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                a.attendance_id,
                a.employee_id,
                e.name AS employee_name,
                a.date,
                a.check_in_time,
                a.check_out_time,
                a.status
            FROM attendance a
            LEFT JOIN employees e
                ON a.employee_id = e.employee_id
            ORDER BY a.date DESC, a.attendance_id DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET one attendance record
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM attendance WHERE attendance_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching attendance record:', err);
        res.status(500).json({ error: err.message });
    }
});

// ADD attendance record
router.post('/', async (req, res) => {
    try {
        const {
            employee_id,
            date,
            check_in_time,
            check_out_time,
            status
        } = req.body;

        const [result] = await db.query(
            `
            INSERT INTO attendance (
                employee_id,
                date,
                check_in_time,
                check_out_time,
                status
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                employee_id,
                date || null,
                check_in_time || null,
                check_out_time || null,
                status || 'Present'
            ]
        );

        res.json({
            message: 'Attendance record added successfully',
            attendance_id: result.insertId
        });
    } catch (err) {
        console.error('Error adding attendance record:', err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE attendance record
router.put('/:id', async (req, res) => {
    try {
        const {
            employee_id,
            date,
            check_in_time,
            check_out_time,
            status
        } = req.body;

        await db.query(
            `
            UPDATE attendance
            SET
                employee_id = ?,
                date = ?,
                check_in_time = ?,
                check_out_time = ?,
                status = ?
            WHERE attendance_id = ?
            `,
            [
                employee_id,
                date || null,
                check_in_time || null,
                check_out_time || null,
                status || 'Present',
                req.params.id
            ]
        );

        res.json({ message: 'Attendance record updated successfully' });
    } catch (err) {
        console.error('Error updating attendance record:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE attendance record
router.delete('/:id', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM attendance WHERE attendance_id = ?',
            [req.params.id]
        );

        res.json({ message: 'Attendance record deleted successfully' });
    } catch (err) {
        console.error('Error deleting attendance record:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;