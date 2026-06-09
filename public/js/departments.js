const form = document.getElementById('departmentForm');
const tableBody = document.querySelector('#departmentTable tbody');
const searchInput = document.getElementById('searchInput');
const submitBtn = document.getElementById('submitBtn');

let departments = [];
let editingDepartmentId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadDepartments();
});

searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();

    const filtered = departments.filter(dept =>
        String(dept.department_id).includes(term) ||
        (dept.department_name || '').toLowerCase().includes(term) ||
        (dept.location || '').toLowerCase().includes(term) ||
        (dept.manager_name || '').toLowerCase().includes(term)
    );

    renderDepartments(filtered);
});

async function loadDepartments() {
    try {
        const response = await fetch('/api/departments');

        if (!response.ok) {
            throw new Error('Failed to fetch departments');
        }

        departments = await response.json();
        renderDepartments(departments);
    } catch (error) {
        console.error('Error loading departments:', error);
        alert('Failed to load departments.');
    }
}

function renderDepartments(data) {
    tableBody.innerHTML = '';

    data.forEach(dept => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${dept.department_id}</td>
            <td>${dept.department_name || ''}</td>
            <td>${dept.location || ''}</td>
            <td>${dept.manager_name || dept.manager_id || ''}</td>
            <td class="actions">
                <button class="btn-edit"
                        onclick="editDepartment(${dept.department_id})">
                    Edit
                </button>
                <button class="btn-delete"
                        onclick="deleteDepartment(${dept.department_id})">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const departmentData = {
        department_name: document.getElementById('department_name').value,
        location: document.getElementById('location').value,
        manager_id: document.getElementById('manager_id').value || null
    };

    try {
        let response;

        if (editingDepartmentId) {
            response = await fetch(`/api/departments/${editingDepartmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(departmentData)
            });
        } else {
            response = await fetch('/api/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(departmentData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Operation failed');
        }

        alert(result.message);

        form.reset();
        editingDepartmentId = null;
        submitBtn.textContent = 'Add Department';

        loadDepartments();
    } catch (error) {
        console.error('Error saving department:', error);
        alert(error.message);
    }
});

async function editDepartment(id) {
    try {
        const response = await fetch(`/api/departments/${id}`);
        const dept = await response.json();

        document.getElementById('department_name').value =
            dept.department_name || '';
        document.getElementById('location').value =
            dept.location || '';
        document.getElementById('manager_id').value =
            dept.manager_id || '';

        editingDepartmentId = id;
        submitBtn.textContent = 'Update Department';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Error loading department:', error);
        alert('Failed to load department details.');
    }
}

async function deleteDepartment(id) {
    if (!confirm('Are you sure you want to delete this department?')) {
        return;
    }

    try {
        const response = await fetch(`/api/departments/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Delete failed');
        }

        alert(result.message);
        loadDepartments();
    } catch (error) {
        console.error('Error deleting department:', error);
        alert(error.message);
    }
}