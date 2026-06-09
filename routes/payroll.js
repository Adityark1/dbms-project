const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all payroll records
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                p.payroll_id,
                p.employee_id,
                e.name AS employee_name,
                p.basic_salary,
                p.bonus,
                p.deductions,
                p.loss_of_pay,
                p.payment_date,
                (p.basic_salary + p.bonus - p.deductions - p.loss_of_pay) AS net_salary
            FROM payroll p
            LEFT JOIN employees e
                ON p.employee_id = e.employee_id
            ORDER BY p.payroll_id DESC
        `);

        res.json(rows);
    } catch (err) {
        console.error('Error fetching payroll:', err);
        res.status(500).json({ error: err.message });
    }
});

// GET one payroll record
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM payroll WHERE payroll_id = ?',
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Payroll record not found' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Error fetching payroll record:', err);
        res.status(500).json({ error: err.message });
    }
});

// ADD payroll record
router.post('/', async (req, res) => {
    try {
        const {
            employee_id,
            basic_salary,
            bonus,
            deductions,
            loss_of_pay,
            payment_date
        } = req.body;

        const [result] = await db.query(
            `
            INSERT INTO payroll (
                employee_id,
                basic_salary,
                bonus,
                deductions,
                loss_of_pay,
                payment_date
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                employee_id,
                basic_salary,
                bonus || 0,
                deductions || 0,
                loss_of_pay || 0,
                payment_date || null
            ]
        );

        res.json({
            message: 'Payroll record added successfully',
            payroll_id: result.insertId
        });
    } catch (err) {
        console.error('Error adding payroll record:', err);
        res.status(500).json({ error: err.message });
    }
});

// UPDATE payroll record
router.put('/:id', async (req, res) => {
    try {
        const {
            employee_id,
            basic_salary,
            bonus,
            deductions,
            loss_of_pay,
            payment_date
        } = req.body;

        await db.query(
            `
            UPDATE payroll
            SET
                employee_id = ?,
                basic_salary = ?,
                bonus = ?,
                deductions = ?,
                loss_of_pay = ?,
                payment_date = ?
            WHERE payroll_id = ?
            `,
            [
                employee_id,
                basic_salary,
                bonus || 0,
                deductions || 0,
                loss_of_pay || 0,
                payment_date || null,
                req.params.id
            ]
        );

        res.json({ message: 'Payroll record updated successfully' });
    } catch (err) {
        console.error('Error updating payroll record:', err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE payroll record
router.delete('/:id', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM payroll WHERE payroll_id = ?',
            [req.params.id]
        );

        res.json({ message: 'Payroll record deleted successfully' });
    } catch (err) {
        console.error('Error deleting payroll record:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;