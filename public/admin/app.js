// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const employeeTableBody = document.getElementById('employeeTableBody');
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const employeeModal = new bootstrap.Modal(document.getElementById('employeeModal'));
const saveEmployeeBtn = document.getElementById('saveEmployeeBtn');
const employeeForm = document.getElementById('employeeForm');
const employeeSelect = document.getElementById('employeeSelect');
const timesheetStartDate = document.getElementById('timesheetStartDate');
const timesheetEndDate = document.getElementById('timesheetEndDate');
const fetchTimesheetBtn = document.getElementById('fetchTimesheetBtn');
const timesheetTableBody = document.getElementById('timesheetTableBody');
const inventoryTableBody = document.getElementById('inventoryTableBody');
const addInventoryBtn = document.getElementById('addInventoryBtn');
const inventoryModal = new bootstrap.Modal(document.getElementById('inventoryModal'));
const saveInventoryBtn = document.getElementById('saveInventoryBtn');
const inventoryForm = document.getElementById('inventoryForm');

// Global Variables
let selectedEmployee = '';
let timesheetData = [];
let salesChart = null;

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetSection = link.getAttribute('data-section');
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${targetSection}-section`) {
                section.classList.add('active');
            }
        });
    });
});

// Utility Functions
function showMessage(message, isError = false) {
    // Implement message display logic
    console.log(`${isError ? 'Error' : 'Success'}: ${message}`);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatTime(timeString) {
    return new Date(timeString).toLocaleTimeString();
}

// Employee Management
async function fetchEmployees() {
    try {
        const response = await fetch('/api/employees');
        if (!response.ok) {
            throw new Error('Failed to fetch employees');
        }
        const employees = await response.json();
        renderEmployees(employees);
        updateEmployeeSelect(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        showMessage('Error loading employees', true);
    }
}

function renderEmployees(employees) {
    employeeTableBody.innerHTML = employees.map(employee => `
        <tr>
            <td>${employee.name}</td>
            <td>${employee.contactNumber}</td>
            <td>${employee.address}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editEmployee('${employee._id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteEmployee('${employee._id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

function updateEmployeeSelect(employees) {
    employeeSelect.innerHTML = `
        <option value="">Select Employee</option>
        ${employees.map(emp => `<option value="${emp.name}">${emp.name}</option>`).join('')}
    `;
}

async function handleEmployeeSubmit(event) {
    event.preventDefault();
    
    const employeeData = {
        name: document.getElementById('employeeName').value,
        contactNumber: document.getElementById('employeeContact').value,
        address: document.getElementById('employeeAddress').value
    };
    
    try {
        const response = await fetch('/api/employees', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add employee');
        }
        
        showMessage('Employee added successfully');
        employeeModal.hide();
        employeeForm.reset();
        fetchEmployees();
    } catch (error) {
        console.error('Error adding employee:', error);
        showMessage('Error adding employee', true);
    }
}

// Timesheet Management
async function fetchTimesheetData() {
    if (!selectedEmployee || !timesheetStartDate.value || !timesheetEndDate.value) {
        showMessage('Please select an employee and date range', true);
        return;
    }

    try {
        console.log(`🔍 ADMIN: Fetching timesheets for ${selectedEmployee} from ${timesheetStartDate.value} to ${timesheetEndDate.value}`);
        const response = await fetch(
            `/api/timesheets?employeeName=${encodeURIComponent(selectedEmployee)}&startDate=${timesheetStartDate.value}&endDate=${timesheetEndDate.value}`
        );
        
        console.log('📥 ADMIN: Timesheet API response status:', response.status);
        if (!response.ok) {
            throw new Error(`Failed to fetch timesheet data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📋 ADMIN: Received timesheet data:', data);
        timesheetData = data;
        renderTimesheet();
    } catch (error) {
        console.error('❌ ADMIN: Error fetching timesheet data:', error);
        showMessage('Error loading timesheet data', true);
        timesheetTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load timesheet data</td></tr>';
    }
}

function renderTimesheet() {
    if (!timesheetData.length) {
        timesheetTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No timesheet data available</td></tr>';
        return;
    }

    timesheetTableBody.innerHTML = timesheetData.map(entry => `
        <tr>
            <td>${formatDate(entry.date)}</td>
            <td>${formatTime(entry.timeIn)}</td>
            <td>${formatTime(entry.timeOut)}</td>
            <td>${entry.hoursWorked.toFixed(2)}</td>
            <td><span class="badge ${entry.status === 'completed' ? 'badge-success' : 'badge-warning'}">${entry.status}</span></td>
        </tr>
    `).join('');
}

// Sales Chart
async function initializeSalesChart() {
    try {
        const response = await fetch('/api/sales/summary');
        if (!response.ok) {
            throw new Error('Failed to fetch sales data');
        }
        const data = await response.json();
        
        const ctx = document.getElementById('salesChart').getContext('2d');
        if (salesChart) {
            salesChart.destroy();
        }
        
        salesChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Daily Sales',
                    data: data.values,
                    borderColor: '#0d6efd',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } catch (error) {
        console.error('Error initializing sales chart:', error);
        showMessage('Error loading sales data', true);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchEmployees();
    initializeSalesChart();
    
    // Set default dates for timesheet
    const today = new Date();
    const lastWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    timesheetStartDate.value = lastWeek.toISOString().split('T')[0];
    timesheetEndDate.value = today.toISOString().split('T')[0];
});

employeeSelect.addEventListener('change', (e) => {
    selectedEmployee = e.target.value;
});

fetchTimesheetBtn.addEventListener('click', fetchTimesheetData);

addEmployeeBtn.addEventListener('click', () => {
    document.getElementById('employeeForm').reset();
    employeeModal.show();
});

saveEmployeeBtn.addEventListener('click', handleEmployeeSubmit);

// Initialize tooltips
var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
}); 