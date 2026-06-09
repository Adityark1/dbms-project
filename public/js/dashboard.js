document.addEventListener('DOMContentLoaded', loadDashboardStats);

async function loadDashboardStats() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const stats = await response.json();

        document.getElementById('totalEmployees').textContent =
            stats.totalEmployees || 0;

        document.getElementById('totalDepartments').textContent =
            stats.totalDepartments || 0;

        document.getElementById('totalProjects').textContent =
            stats.totalProjects || 0;

        document.getElementById('employeesOnLeave').textContent =
            stats.employeesOnLeave || 0;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}