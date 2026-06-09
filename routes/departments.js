const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all departments
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                d.department_id,
                d.department_name,
                d.location,
                d.manager_id,
                e.name AS manager_name
            FROM departments d
            LEFT JOIN employees e
                ON d.manager_id = e.employee_id
            ORDER BY d.department_id
        `);

        res.json(rows);
    } catch (err) {
        console.error('Error fetching departments:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET one department by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            `
            SELECT *
            FROM departments
            WHERE department_id = ?
            `,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Department not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching department:', err);
        res.status(500).json({ error: err.message });
    }
});

// ADD department
router.post('/', async (req, res) => {
    try {
        const {
            department_name,
            location,
            manager_id
        } = req.body;

        const [result] = await db.query(
            `
            INSERT INTO departments (
                department_name,
                location,
                manager_id
            )
            VALUES (?, ?, ?)
            `,
            [
                department_name,
                location,
                manager_id || null
            ]
        );

        res.json({
            message: 'Department added successfully',
            department_id: result.insertId
        });
    } catch (err) {
        console.error('Error adding department:', err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE department
router.put('/:id', async (req, res) => {
    try {
        const {
            department_name,
            location,
            manager_id
        } = req.body;

        await db.query(
            `
            UPDATE departments
            SET
                department_name = ?,
                location = ?,
                manager_id = ?
            WHERE department_id = ?
            `,
            [
                department_name,
                location,
                manager_id || null,
                req.params.id
            ]
        );

        res.json({ message: 'Department updated successfully' });
    } catch (err) {
        console.error('Error updating department:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE department
router.delete('/:id', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM departments WHERE department_id = ?',
            [req.params.id]
        );

        res.json({ message: 'Department deleted successfully' });
    } catch (err) {
        console.error('Error deleting department:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;