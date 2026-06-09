const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all employees
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM employees ORDER BY employee_id'
        );
        res.json(rows);
    } catch (error) {
        console.error('GET employees error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET single employee
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM employees WHERE employee_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({
                error: 'Employee not found'
            });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ADD employee
router.post('/', async (req, res) => {
    try {
        const {
            name,
            gender,
            date_of_birth,
            email,
            phone_no,
            hire_date,
            salary,
            department_id
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO employees
            (name, gender, date_of_birth, email, phone_no, hire_date, salary, department_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                gender,
                date_of_birth,
                email,
                phone_no,
                hire_date,
                salary,
                department_id
            ]
        );

        res.json({
            message: 'Employee added successfully',
            employee_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE employee
router.put('/:id', async (req, res) => {
    try {
        const {
            name,
            gender,
            date_of_birth,
            email,
            phone_no,
            hire_date,
            salary,
            department_id
        } = req.body;

        const [result] = await db.query(
            `UPDATE employees
             SET name = ?,
                 gender = ?,
                 date_of_birth = ?,
                 email = ?,
                 phone_no = ?,
                 hire_date = ?,
                 salary = ?,
                 department_id = ?
             WHERE employee_id = ?`,
            [
                name,
                gender,
                date_of_birth,
                email,
                phone_no,
                hire_date,
                salary,
                department_id,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Employee not found'
            });
        }

        res.json({
            message: 'Employee updated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE employee and related records
router.delete('/:id', async (req, res) => {
    const employeeId = req.params.id;

    try {
        // Delete dependent records first
        await db.query(
            'DELETE FROM attendance WHERE employee_id = ?',
            [employeeId]
        );

        await db.query(
            'DELETE FROM leave_records WHERE employee_id = ?',
            [employeeId]
        );

        await db.query(
            'DELETE FROM payroll WHERE employee_id = ?',
            [employeeId]
        );

        // Delete employee
        const [result] = await db.query(
            'DELETE FROM employees WHERE employee_id = ?',
            [employeeId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Employee not found'
            });
        }

        res.json({
            message: 'Employee and related records deleted successfully'
        });
    } catch (error) {
        console.error('DELETE employee error:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

module.exports = router;