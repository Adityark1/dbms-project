const form = document.getElementById('payrollForm');
const tableBody = document.querySelector('#payrollTable tbody');
const searchInput = document.getElementById('searchInput');
const submitBtn = document.getElementById('submitBtn');

let payrollRecords = [];
let editingPayrollId = null;

// Initialize
document.addEventListener('DOMContentLoaded', loadPayroll);

// Search
searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();

    const filtered = payrollRecords.filter(record =>
        String(record.payroll_id).includes(term) ||
        String(record.employee_id).includes(term) ||
        (record.employee_name || '').toLowerCase().includes(term)
    );

    renderPayroll(filtered);
});

// Load payroll records
async function loadPayroll() {
    try {
        const response = await fetch('/api/payroll');

        if (!response.ok) {
            throw new Error('Failed to fetch payroll records');
        }

        payrollRecords = await response.json();
        renderPayroll(payrollRecords);
    } catch (error) {
        console.error('Error loading payroll:', error);
        alert('Failed to load payroll records.');
    }
}

// Render payroll table
function renderPayroll(data) {
    tableBody.innerHTML = '';

    data.forEach(record => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${record.payroll_id}</td>
            <td>${record.employee_name || record.employee_id}</td>
            <td>${record.basic_salary || 0}</td>
            <td>${record.bonus || 0}</td>
            <td>${record.deductions || 0}</td>
            <td>${record.loss_of_pay || 0}</td>
            <td>${record.net_salary || 0}</td>
            <td>${formatDate(record.payment_date)}</td>
            <td class="actions">
                <button class="btn-edit"
                        onclick="editPayroll(${record.payroll_id})">
                    Edit
                </button>
                <button class="btn-delete"
                        onclick="deletePayroll(${record.payroll_id})">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Add or update payroll record
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payrollData = {
        employee_id: document.getElementById('employee_id').value,
        basic_salary: document.getElementById('basic_salary').value,
        bonus: document.getElementById('bonus').value || 0,
        deductions: document.getElementById('deductions').value || 0,
        loss_of_pay: document.getElementById('loss_of_pay').value || 0,
        payment_date: document.getElementById('payment_date').value || null
    };

    try {
        let response;

        if (editingPayrollId) {
            response = await fetch(`/api/payroll/${editingPayrollId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payrollData)
            });
        } else {
            response = await fetch('/api/payroll', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payrollData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Operation failed');
        }

        alert(result.message);

        form.reset();
        editingPayrollId = null;
        submitBtn.textContent = 'Add Payroll Record';

        loadPayroll();
    } catch (error) {
        console.error('Error saving payroll:', error);
        alert(error.message);
    }
});

// Edit payroll record
async function editPayroll(id) {
    try {
        const response = await fetch(`/api/payroll/${id}`);
        const record = await response.json();

        document.getElementById('employee_id').value =
            record.employee_id || '';
        document.getElementById('basic_salary').value =
            record.basic_salary || '';
        document.getElementById('bonus').value =
            record.bonus || '';
        document.getElementById('deductions').value =
            record.deductions || '';
        document.getElementById('loss_of_pay').value =
            record.loss_of_pay || '';
        document.getElementById('payment_date').value =
            formatDateForInput(record.payment_date);

        editingPayrollId = id;
        submitBtn.textContent = 'Update Payroll Record';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Error loading payroll record:', error);
        alert('Failed to load payroll record details.');
    }
}

// Delete payroll record
async function deletePayroll(id) {
    if (!confirm('Are you sure you want to delete this payroll record?')) {
        return;
    }

    try {
        const response = await fetch(`/api/payroll/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Delete failed');
        }

        alert(result.message);
        loadPayroll();
    } catch (error) {
        console.error('Error deleting payroll:', error);
        alert(error.message);
    }
}

// Helpers
function formatDate(dateValue) {
    if (!dateValue) return '';

    const date = new Date(dateValue);
    if (isNaN(date)) return '';

    return date.toLocaleDateString();
}

function formatDateForInput(dateValue) {
    if (!dateValue) return '';

    const date = new Date(dateValue);
    if (isNaN(date)) return '';

    return date.toISOString().split('T')[0];
}