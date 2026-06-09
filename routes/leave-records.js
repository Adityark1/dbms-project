const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all leave records
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                l.leave_id,
                l.employee_id,
                e.name AS employee_name,
                l.leave_type,
                l.start_date,
                l.end_date,
                l.status
            FROM leave_records l
            LEFT JOIN employees e
                ON l.employee_id = e.employee_id
            ORDER BY l.leave_id DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error('Error fetching leave records:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET one leave record
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM leave_records WHERE leave_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Leave record not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching leave record:', err);
        res.status(500).json({ error: err.message });
    }
});

// ADD leave record
router.post('/', async (req, res) => {
    try {
        const {
            employee_id,
            leave_type,
            start_date,
            end_date,
            status
        } = req.body;

        const [result] = await db.query(
            `
            INSERT INTO leave_records (
                employee_id,
                leave_type,
                start_date,
                end_date,
                status
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                employee_id,
                leave_type,
                start_date || null,
                end_date || null,
                status || 'Pending'
            ]
        );

        res.json({
            message: 'Leave record added successfully',
            leave_id: result.insertId
        });
    } catch (err) {
        console.error('Error adding leave record:', err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE leave record
router.put('/:id', async (req, res) => {
    try {
        const {
            employee_id,
            leave_type,
            start_date,
            end_date,
            status
        } = req.body;

        await db.query(
            `
            UPDATE leave_records
            SET
                employee_id = ?,
                leave_type = ?,
                start_date = ?,
                end_date = ?,
                status = ?
            WHERE leave_id = ?
            `,
            [
                employee_id,
                leave_type,
                start_date || null,
                end_date || null,
                status || 'Pending',
                req.params.id
            ]
        );

        res.json({ message: 'Leave record updated successfully' });
    } catch (err) {
        console.error('Error updating leave record:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE leave record
router.delete('/:id', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM leave_records WHERE leave_id = ?',
            [req.params.id]
        );

        res.json({ message: 'Leave record deleted successfully' });
    } catch (err) {
        console.error('Error deleting leave record:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;