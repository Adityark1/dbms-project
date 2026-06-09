const form = document.getElementById('leaveForm');
const tableBody = document.querySelector('#leaveTable tbody');
const searchInput = document.getElementById('searchInput');
const submitBtn = document.getElementById('submitBtn');

let leaveRecords = [];
let editingLeaveId = null;

// Initialize
document.addEventListener('DOMContentLoaded', loadLeaveRecords);

// Search
searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();

    const filtered = leaveRecords.filter(record =>
        String(record.leave_id).includes(term) ||
        String(record.employee_id).includes(term) ||
        (record.employee_name || '').toLowerCase().includes(term) ||
        (record.leave_type || '').toLowerCase().includes(term) ||
        (record.status || '').toLowerCase().includes(term)
    );

    renderLeaveRecords(filtered);
});

// Load leave records
async function loadLeaveRecords() {
    try {
        const response = await fetch('/api/leave-records');

        if (!response.ok) {
            throw new Error('Failed to fetch leave records');
        }

        leaveRecords = await response.json();
        renderLeaveRecords(leaveRecords);
    } catch (error) {
        console.error('Error loading leave records:', error);
        alert('Failed to load leave records.');
    }
}

// Render table
function renderLeaveRecords(data) {
    tableBody.innerHTML = '';

    data.forEach(record => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${record.leave_id}</td>
            <td>${record.employee_name || record.employee_id}</td>
            <td>${record.leave_type || ''}</td>
            <td>${formatDate(record.start_date)}</td>
            <td>${formatDate(record.end_date)}</td>
            <td>${record.status || ''}</td>
            <td class="actions">
                <button class="btn-edit"
                        onclick="editLeave(${record.leave_id})">
                    Edit
                </button>
                <button class="btn-delete"
                        onclick="deleteLeave(${record.leave_id})">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Add or update leave record
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const leaveData = {
        employee_id: document.getElementById('employee_id').value,
        leave_type: document.getElementById('leave_type').value,
        start_date: document.getElementById('start_date').value || null,
        end_date: document.getElementById('end_date').value || null,
        status: document.getElementById('status').value
    };

    try {
        let response;

        if (editingLeaveId) {
            response = await fetch(`/api/leave-records/${editingLeaveId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(leaveData)
            });
        } else {
            response = await fetch('/api/leave-records', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(leaveData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Operation failed');
        }

        alert(result.message);

        form.reset();
        editingLeaveId = null;
        submitBtn.textContent = 'Add Leave Record';

        loadLeaveRecords();
    } catch (error) {
        console.error('Error saving leave record:', error);
        alert(error.message);
    }
});

// Edit leave record
async function editLeave(id) {
    try {
        const response = await fetch(`/api/leave-records/${id}`);
        const record = await response.json();

        document.getElementById('employee_id').value =
            record.employee_id || '';
        document.getElementById('leave_type').value =
            record.leave_type || '';
        document.getElementById('start_date').value =
            formatDateForInput(record.start_date);
        document.getElementById('end_date').value =
            formatDateForInput(record.end_date);
        document.getElementById('status').value =
            record.status || 'Pending';

        editingLeaveId = id;
        submitBtn.textContent = 'Update Leave Record';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Error loading leave record:', error);
        alert('Failed to load leave record details.');
    }
}

// Delete leave record
async function deleteLeave(id) {
    if (!confirm('Are you sure you want to delete this leave record?')) {
        return;
    }

    try {
        const response = await fetch(`/api/leave-records/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Delete failed');
        }

        alert(result.message);
        loadLeaveRecords();
    } catch (error) {
        console.error('Error deleting leave record:', error);
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