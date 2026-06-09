const form = document.getElementById('attendanceForm');
const tableBody = document.querySelector('#attendanceTable tbody');
const searchInput = document.getElementById('searchInput');
const submitBtn = document.getElementById('submitBtn');

let attendanceRecords = [];
let editingAttendanceId = null;

// Initialize
document.addEventListener('DOMContentLoaded', loadAttendance);

// Search
searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();

    const filtered = attendanceRecords.filter(record =>
        String(record.attendance_id).includes(term) ||
        String(record.employee_id).includes(term) ||
        (record.employee_name || '').toLowerCase().includes(term) ||
        (record.status || '').toLowerCase().includes(term)
    );

    renderAttendance(filtered);
});

// Load attendance
async function loadAttendance() {
    try {
        const response = await fetch('/api/attendance');

        if (!response.ok) {
            throw new Error('Failed to fetch attendance');
        }

        attendanceRecords = await response.json();
        renderAttendance(attendanceRecords);
    } catch (error) {
        console.error('Error loading attendance:', error);
        alert('Failed to load attendance records.');
    }
}

// Render table
function renderAttendance(data) {
    tableBody.innerHTML = '';

    data.forEach(record => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${record.attendance_id}</td>
            <td>${record.employee_name || record.employee_id}</td>
            <td>${formatDate(record.date)}</td>
            <td>${record.check_in_time || ''}</td>
            <td>${record.check_out_time || ''}</td>
            <td>${record.status || ''}</td>
            <td class="actions">
                <button class="btn-edit"
                        onclick="editAttendance(${record.attendance_id})">
                    Edit
                </button>
                <button class="btn-delete"
                        onclick="deleteAttendance(${record.attendance_id})">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Add or update attendance
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const attendanceData = {
        employee_id: document.getElementById('employee_id').value,
        date: document.getElementById('date').value || null,
        check_in_time:
            document.getElementById('check_in_time').value || null,
        check_out_time:
            document.getElementById('check_out_time').value || null,
        status: document.getElementById('status').value
    };

    try {
        let response;

        if (editingAttendanceId) {
            response = await fetch(
                `/api/attendance/${editingAttendanceId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(attendanceData)
                }
            );
        } else {
            response = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(attendanceData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Operation failed');
        }

        alert(result.message);

        form.reset();
        editingAttendanceId = null;
        submitBtn.textContent = 'Add Attendance';

        loadAttendance();
    } catch (error) {
        console.error('Error saving attendance:', error);
        alert(error.message);
    }
});

// Edit attendance
async function editAttendance(id) {
    try {
        const response = await fetch(`/api/attendance/${id}`);
        const record = await response.json();

        document.getElementById('employee_id').value =
            record.employee_id || '';
        document.getElementById('date').value =
            formatDateForInput(record.date);
        document.getElementById('check_in_time').value =
            record.check_in_time || '';
        document.getElementById('check_out_time').value =
            record.check_out_time || '';
        document.getElementById('status').value =
            record.status || 'Present';

        editingAttendanceId = id;
        submitBtn.textContent = 'Update Attendance';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Error loading attendance:', error);
        alert('Failed to load attendance details.');
    }
}

// Delete attendance
async function deleteAttendance(id) {
    if (!confirm('Are you sure you want to delete this attendance record?')) {
        return;
    }

    try {
        const response = await fetch(`/api/attendance/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Delete failed');
        }

        alert(result.message);
        loadAttendance();
    } catch (error) {
        console.error('Error deleting attendance:', error);
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