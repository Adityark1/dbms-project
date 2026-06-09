const form = document.getElementById('employeeForm');
const tableBody = document.querySelector('#employeeTable tbody');
const searchInput = document.getElementById('searchInput');
const submitBtn = document.getElementById('submitBtn');

let employees = [];
let editingEmployeeId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
});

// Search functionality
searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();

    const filtered = employees.filter(emp =>
        String(emp.employee_id).includes(term) ||
        (emp.name || '').toLowerCase().includes(term) ||
        (emp.email || '').toLowerCase().includes(term)
    );

    renderEmployees(filtered);
});

// Load employees from backend
async function loadEmployees() {
    try {
        const response = await fetch('/api/employees');
        employees = await response.json();
        renderEmployees(employees);
    } catch (error) {
        console.error('Error loading employees:', error);
        alert('Failed to load employees.');
    }
}

// Render employee table
function renderEmployees(data) {
    tableBody.innerHTML = '';

    data.forEach(emp => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${emp.employee_id}</td>
            <td>${emp.name || ''}</td>
            <td>${emp.gender || ''}</td>
            <td>${emp.email || ''}</td>
            <td>${emp.phone_no || ''}</td>
            <td>${emp.salary || ''}</td>
            <td>${emp.department_name || emp.department_id || ''}</td>
            <td class="actions">
                <button class="btn-edit" onclick="editEmployee(${emp.employee_id})">
                    Edit
                </button>
                <button class="btn-delete" onclick="deleteEmployee(${emp.employee_id})">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Add or update employee
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const employeeData = {
        name: document.getElementById('name').value,
        gender: document.getElementById('gender').value,
        date_of_birth: document.getElementById('date_of_birth').value || null,
        email: document.getElementById('email').value,
        phone_no: document.getElementById('phone_no').value,
        hire_date: document.getElementById('hire_date').value || null,
        salary: document.getElementById('salary').value || null,
        department_id: document.getElementById('department_id').value || null
    };

    try {
        let response;

        if (editingEmployeeId) {
            response = await fetch(`/api/employees/${editingEmployeeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeeData)
            });
        } else {
            response = await fetch('/api/employees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeeData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Operation failed');
        }

        alert(result.message);

        form.reset();
        editingEmployeeId = null;
        submitBtn.textContent = 'Add Employee';

        loadEmployees();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
});

// Edit employee
async function editEmployee(id) {
    try {
        const response = await fetch(`/api/employees/${id}`);
        const emp = await response.json();

        document.getElementById('name').value = emp.name || '';
        document.getElementById('gender').value = emp.gender || '';
        document.getElementById('date_of_birth').value =
            emp.date_of_birth ? emp.date_of_birth.split('T')[0] : '';
        document.getElementById('email').value = emp.email || '';
        document.getElementById('phone_no').value = emp.phone_no || '';
        document.getElementById('hire_date').value =
            emp.hire_date ? emp.hire_date.split('T')[0] : '';
        document.getElementById('salary').value = emp.salary || '';
        document.getElementById('department_id').value =
            emp.department_id || '';

        editingEmployeeId = id;
        submitBtn.textContent = 'Update Employee';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Error loading employee:', error);
        alert('Failed to load employee details.');
    }
}

// Delete employee
async function deleteEmployee(id) {
    const confirmed = confirm(
        'Are you sure you want to delete this employee?'
    );

    if (!confirmed) return;

    try {
        const response = await fetch(`/api/employees/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Delete failed');
        }

        alert(result.message);
        loadEmployees();
    } catch (error) {
        console.error('Error deleting employee:', error);
        alert(error.message);
    }
}