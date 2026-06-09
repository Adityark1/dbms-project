const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all projects
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                p.project_id,
                p.project_name,
                p.budget,
                p.start_date,
                p.end_date,
                p.department_id,
                d.department_name
            FROM projects p
            LEFT JOIN departments d
                ON p.department_id = d.department_id
            ORDER BY p.project_id
        `);

        res.json(rows);
    } catch (err) {
        console.error('Error fetching projects:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET one project by ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM projects WHERE project_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching project:', err);
        res.status(500).json({ error: err.message });
    }
});

// ADD project
router.post('/', async (req, res) => {
    try {
        const {
            project_name,
            budget,
            start_date,
            end_date,
            department_id
        } = req.body;

        const [result] = await db.query(
            `
            INSERT INTO projects (
                project_name,
                budget,
                start_date,
                end_date,
                department_id
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                project_name,
                budget || null,
                start_date || null,
                end_date || null,
                department_id || null
            ]
        );

        res.json({
            message: 'Project added successfully',
            project_id: result.insertId
        });
    } catch (err) {
        console.error('Error adding project:', err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE project
router.put('/:id', async (req, res) => {
    try {
        const {
            project_name,
            budget,
            start_date,
            end_date,
            department_id
        } = req.body;

        await db.query(
            `
            UPDATE projects
            SET
                project_name = ?,
                budget = ?,
                start_date = ?,
                end_date = ?,
                department_id = ?
            WHERE project_id = ?
            `,
            [
                project_name,
                budget || null,
                start_date || null,
                end_date || null,
                department_id || null,
                req.params.id
            ]
        );

        res.json({ message: 'Project updated successfully' });
    } catch (err) {
        console.error('Error updating project:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE project
router.delete('/:id', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM projects WHERE project_id = ?',
            [req.params.id]
        );

        res.json({ message: 'Project deleted successfully' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;