const form = document.getElementById('projectForm');
const tableBody = document.querySelector('#projectTable tbody');
const searchInput = document.getElementById('searchInput');
const submitBtn = document.getElementById('submitBtn');

let projects = [];
let editingProjectId = null;

// Initialize
document.addEventListener('DOMContentLoaded', loadProjects);

// Search
searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();

    const filtered = projects.filter(project =>
        String(project.project_id).includes(term) ||
        (project.project_name || '').toLowerCase().includes(term) ||
        (project.department_name || '').toLowerCase().includes(term)
    );

    renderProjects(filtered);
});

// Load projects
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        projects = await response.json();
        renderProjects(projects);
    } catch (error) {
        console.error('Error loading projects:', error);
        alert('Failed to load projects.');
    }
}

// Render table
function renderProjects(data) {
    tableBody.innerHTML = '';

    data.forEach(project => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${project.project_id}</td>
            <td>${project.project_name || ''}</td>
            <td>${project.budget || ''}</td>
            <td>${formatDate(project.start_date)}</td>
            <td>${formatDate(project.end_date)}</td>
            <td>${project.department_name || project.department_id || ''}</td>
            <td class="actions">
                <button class="btn-edit"
                        onclick="editProject(${project.project_id})">
                    Edit
                </button>
                <button class="btn-delete"
                        onclick="deleteProject(${project.project_id})">
                    Delete
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// Add or update project
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const projectData = {
        project_name: document.getElementById('project_name').value,
        budget: document.getElementById('budget').value || null,
        start_date: document.getElementById('start_date').value || null,
        end_date: document.getElementById('end_date').value || null,
        department_id: document.getElementById('department_id').value || null
    };

    try {
        let response;

        if (editingProjectId) {
            response = await fetch(`/api/projects/${editingProjectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            });
        } else {
            response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            });
        }

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Operation failed');
        }

        alert(result.message);

        form.reset();
        editingProjectId = null;
        submitBtn.textContent = 'Add Project';

        loadProjects();
    } catch (error) {
        console.error('Error saving project:', error);
        alert(error.message);
    }
});

// Edit project
async function editProject(id) {
    try {
        const response = await fetch(`/api/projects/${id}`);
        const project = await response.json();

        document.getElementById('project_name').value =
            project.project_name || '';
        document.getElementById('budget').value =
            project.budget || '';
        document.getElementById('start_date').value =
            formatDateForInput(project.start_date);
        document.getElementById('end_date').value =
            formatDateForInput(project.end_date);
        document.getElementById('department_id').value =
            project.department_id || '';

        editingProjectId = id;
        submitBtn.textContent = 'Update Project';

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } catch (error) {
        console.error('Error loading project:', error);
        alert('Failed to load project details.');
    }
}

// Delete project
async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) {
        return;
    }

    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Delete failed');
        }

        alert(result.message);
        loadProjects();
    } catch (error) {
        console.error('Error deleting project:', error);
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