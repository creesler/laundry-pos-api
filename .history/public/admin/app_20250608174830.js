// Create a global namespace for our app
window.LaundryAdmin = {};

// API URL constant
const API_URL = 'http://localhost:5000';  // Updated API URL

// Wait for all functions to be defined before initializing
(function(app) {
    // Global state
    let chart = null;
    let allSalesData = null;  // Store all sales data
    let currentData = null;  // Initialize as null instead of with default values

    // Employee Management
    let employees = [];

    // DOM Elements
    const messageBox = document.getElementById('messageBox');
    const form = document.getElementById('employeeForm');
    const employeeTable = document.getElementById('employeeTable').getElementsByTagName('tbody')[0];
    const submitBtn = document.getElementById('submitBtn');
    const clearBtn = document.getElementById('clearBtn');
    const employeeTabs = document.getElementById('employeeTabs');
    const timesheetStartDate = document.getElementById('timesheetStartDate');
    const timesheetEndDate = document.getElementById('timesheetEndDate');
    const timesheetTable = document.querySelector('.timesheet-table tbody');
    const totalHoursSpan = document.getElementById('totalHours');

    // Timesheet functionality
    let timesheetData = {};
    let selectedEmployee = null;

    // Utility functions
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    }

    // Get date range based on period
    function getDateRange(period, baseDate = new Date()) {
        const now = new Date(baseDate);
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (period) {
            case 'day':
                return {
                    start: new Date(startOfDay),
                    end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1)
                };
            case 'week':
                const startOfWeek = new Date(startOfDay);
                startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay()); // Start of week (Sunday)
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);
                return {
                    start: startOfWeek,
                    end: endOfWeek
                };
            case 'month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                return {
                    start: startOfMonth,
                    end: endOfMonth
                };
            case 'year':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                return {
                    start: startOfYear,
                    end: endOfYear
                };
            case 'all':
                return {
                    start: new Date(0),
                    end: new Date()
                };
            default:
                return null;
        }
    }

    // Filter data based on date range
    function filterData(data, startDate, endDate) {
        if (!data) return null;
        
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        
        // Set time to start of day for start date and end of day for end date
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        console.log('Filtering data:', {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            totalRecords: data.length
        });

        const filtered = data.filter(sale => {
            const saleDate = new Date(sale.Date);
            saleDate.setHours(0, 0, 0, 0); // Normalize sale date to start of day
            
            const isInRange = saleDate >= start && saleDate <= end;
            if (isInRange) {
                console.log('Including sale:', {
                    date: saleDate.toISOString(),
                    coin: sale.Coin,
                    hopper: sale.Hopper,
                    soap: sale.Soap,
                    vending: sale.Vending,
                    dropOff1: sale['Drop Off Amount 1'],
                    dropOff2: sale['Drop Off Amount 2']
                });
            }
            return isInRange;
        });

        console.log('Filtered results:', {
            filteredCount: filtered.length,
            firstDate: filtered[0]?.Date,
            lastDate: filtered[filtered.length - 1]?.Date
        });

        return filtered;
    }

    // Calculate totals from sales data
    function calculateTotals(salesData) {
        if (!salesData || !salesData.length) {
            console.log('No sales data to calculate totals');
            return {
                coin: 0,
                hopper: 0,
                soap: 0,
                vending: 0,
                dropOff1: 0,
                dropOff2: 0
            };
        }

        const totals = {
            coin: salesData.reduce((sum, sale) => sum + (parseFloat(sale.Coin) || 0), 0),
            hopper: salesData.reduce((sum, sale) => sum + (parseFloat(sale.Hopper) || 0), 0),
            soap: salesData.reduce((sum, sale) => sum + (parseFloat(sale.Soap) || 0), 0),
            vending: salesData.reduce((sum, sale) => sum + (parseFloat(sale.Vending) || 0), 0),
            dropOff1: salesData.reduce((sum, sale) => sum + (parseFloat(sale['Drop Off Amount 1']) || 0), 0),
            dropOff2: salesData.reduce((sum, sale) => sum + (parseFloat(sale['Drop Off Amount 2']) || 0), 0)
        };

        console.log('Calculated totals:', totals);
        return totals;
    }

    // Chart functions
    function initializeChart(data = null) {
        const defaultData = {
            labels: ['Coin', 'Hopper', 'Soap', 'Vending', 'Drop Off 1', 'Drop Off 2'],
            values: [436, 170, 367, 299, 771, 690]
        };

        const chartData = data || defaultData;
        const ctx = document.getElementById('totalSalesChart').getContext('2d');
        
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.values,
                    backgroundColor: [
                        '#3b82f6',
                        '#60a5fa',
                        '#93c5fd',
                        '#bfdbfe',
                        '#dbeafe',
                        '#eff6ff'
                    ],
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    datalabels: {
                        color: '#1e293b',
                        anchor: 'end',
                        align: 'top',
                        offset: 4,
                        font: {
                            weight: '600',
                            size: 12
                        },
                        formatter: (value) => formatCurrency(value)
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                }
            }
        });
    }

    function updateChart(totals) {
        console.log('Updating chart with totals:', totals);

        // Always destroy the existing chart before creating a new one
        if (chart) {
            console.log('Destroying existing chart');
            chart.destroy();
            chart = null;
        }

        const chartData = {
            labels: ['Coin', 'Hopper', 'Soap', 'Vending', 'Drop Off 1', 'Drop Off 2'],
            values: [
                totals.coin || 0,
                totals.hopper || 0,
                totals.soap || 0,
                totals.vending || 0,
                totals.dropOff1 || 0,
                totals.dropOff2 || 0
            ]
        };

        console.log('New chart data:', chartData);

        const ctx = document.getElementById('totalSalesChart').getContext('2d');
        
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.values,
                    backgroundColor: [
                        '#3b82f6',
                        '#60a5fa',
                        '#93c5fd',
                        '#bfdbfe',
                        '#dbeafe',
                        '#eff6ff'
                    ],
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    datalabels: {
                        color: '#1e293b',
                        anchor: 'end',
                        align: 'top',
                        offset: 4,
                        font: {
                            weight: '600',
                            size: 12
                        },
                        formatter: (value) => formatCurrency(value)
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatCurrency(value)
                        }
                    }
                }
            }
        });

        console.log('Chart created with new data');
    }

    function updateDateRangeDisplay(startDate, endDate, period) {
        const dateRangeDisplay = document.getElementById('dateRangeDisplay');
        
        if (period === 'custom' && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const formattedStart = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const formattedEnd = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            dateRangeDisplay.textContent = `${formattedStart} to ${formattedEnd}`;
        } else if (period === 'all') {
            dateRangeDisplay.textContent = 'All Time';
        } else if (period) {
            const periodDisplay = {
                day: 'Today',
                week: 'This Week',
                month: 'This Month',
                year: 'This Year'
            };
            dateRangeDisplay.textContent = periodDisplay[period] || period;
        }
    }

    function updateTable(data) {
        console.log('Updating table with data:', data);

        const tableBody = document.getElementById('salesTableBody');
        tableBody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${new Date(row.Date).toLocaleString()}</td>
                <td>${formatCurrency(parseFloat(row.Coin) || 0)}</td>
                <td>${formatCurrency(parseFloat(row.Hopper) || 0)}</td>
                <td>${formatCurrency(parseFloat(row.Soap) || 0)}</td>
                <td>${formatCurrency(parseFloat(row.Vending) || 0)}</td>
                <td>${formatCurrency(parseFloat(row['Drop Off Amount 1']) || 0)}</td>
                <td>${formatCurrency(parseFloat(row['Drop Off Amount 2']) || 0)}</td>
            `;
            tableBody.appendChild(tr);
        });

        // Update total amount
        const totals = calculateTotals(data);
        if (totals) {
            const total = Object.values(totals).reduce((sum, val) => sum + val, 0);
            document.getElementById('totalAmount').textContent = formatCurrency(total);
        }

        console.log('Table updated');
    }

    async function fetchAllData() {
        try {
            const response = await fetch('/api/sales');
            
            if (!response.ok) {
                throw new Error('Failed to fetch sales data');
            }

            const data = await response.json();
            
            // Sort data by date
            data.sort((a, b) => new Date(a.Date) - new Date(b.Date));
            
            console.log('Fetched and sorted data:', {
                totalRecords: data.length,
                firstDate: data[0]?.Date,
                lastDate: data[data.length - 1]?.Date
            });
            
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    async function refreshData() {
        const periodFilter = document.getElementById('periodFilter');
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        let filteredStartDate, filteredEndDate;
        
        if (periodFilter.value === 'custom') {
            if (startDate && endDate) {
                filteredStartDate = new Date(startDate);
                filteredEndDate = new Date(endDate);
                console.log('Using custom date range:', {
                    start: filteredStartDate.toISOString(),
                    end: filteredEndDate.toISOString()
                });
            }
        } else {
            const dateRange = getDateRange(periodFilter.value);
            if (dateRange) {
                filteredStartDate = dateRange.start;
                filteredEndDate = dateRange.end;
                console.log('Using period date range:', {
                    period: periodFilter.value,
                    start: filteredStartDate.toISOString(),
                    end: filteredEndDate.toISOString()
                });
            }
        }

        // If we don't have data yet, fetch it
        if (!allSalesData) {
            console.log('Fetching all sales data...');
            allSalesData = await fetchAllData();
            if (allSalesData) {
                console.log(`Fetched ${allSalesData.length} sales records`);
            }
        }

        if (allSalesData) {
            console.log('Starting data refresh...');
            const filteredData = filterData(allSalesData, filteredStartDate, filteredEndDate);
            console.log('Filtered data:', filteredData);
            
            const totals = calculateTotals(filteredData);
            console.log('Calculated totals:', totals);

            // Always create a new chart
            updateChart(totals);
            updateTable(filteredData || []);
            updateDateRangeDisplay(filteredStartDate, filteredEndDate, periodFilter.value);
            
            console.log('Data refresh complete');
        }
    }

    // Navigate to next/previous period
    function navigatePeriod(direction) {
        const periodFilter = document.getElementById('periodFilter');
        const currentPeriod = periodFilter.value;
        
        if (currentPeriod === 'all' || currentPeriod === 'custom') {
            return; // No navigation for these periods
        }

        // Get current date range
        const currentRange = getDateRange(currentPeriod);
        if (!currentRange) return;

        let newBaseDate;
        switch (currentPeriod) {
            case 'day':
                newBaseDate = new Date(currentRange.start);
                newBaseDate.setDate(newBaseDate.getDate() + (direction === 'next' ? 1 : -1));
                break;
            case 'week':
                newBaseDate = new Date(currentRange.start);
                newBaseDate.setDate(newBaseDate.getDate() + (direction === 'next' ? 7 : -7));
                break;
            case 'month':
                newBaseDate = new Date(currentRange.start);
                newBaseDate.setMonth(newBaseDate.getMonth() + (direction === 'next' ? 1 : -1));
                break;
            case 'year':
                newBaseDate = new Date(currentRange.start);
                newBaseDate.setFullYear(newBaseDate.getFullYear() + (direction === 'next' ? 1 : -1));
                break;
        }

        // Get new date range and update the display
        const newRange = getDateRange(currentPeriod, newBaseDate);
        if (newRange) {
            const filteredData = filterData(allSalesData, newRange.start, newRange.end);
            const totals = calculateTotals(filteredData);
            
            if (totals) {
                updateChart(totals);
                updateTable(filteredData);
                updateDateRangeDisplay(newRange.start, newRange.end, currentPeriod);
            } else {
                // If no data for the period, show empty state
                updateChart({
                    coin: 0,
                    hopper: 0,
                    soap: 0,
                    vending: 0,
                    dropOff1: 0,
                    dropOff2: 0
                });
                updateTable([]);
                updateDateRangeDisplay(newRange.start, newRange.end, currentPeriod);
            }
        }
    }

    function initializePeriodFilter() {
        const periodFilter = document.getElementById('periodFilter');
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const dateControls = document.getElementById('dateControls');
        const prevPeriodBtn = document.getElementById('prevPeriod');
        const nextPeriodBtn = document.getElementById('nextPeriod');

        // Set up navigation buttons
        prevPeriodBtn.addEventListener('click', () => navigatePeriod('prev'));
        nextPeriodBtn.addEventListener('click', () => navigatePeriod('next'));

        // Update navigation button state
        function updateNavigationState() {
            const isNavigable = !['all', 'custom'].includes(periodFilter.value);
            prevPeriodBtn.disabled = !isNavigable;
            nextPeriodBtn.disabled = !isNavigable;
        }

        // Set up period filter change handler
        periodFilter.addEventListener('change', (e) => {
            const selectedPeriod = e.target.value;
            
            // Show/hide date inputs based on selection
            if (selectedPeriod === 'custom') {
                dateControls.style.display = 'flex';
                startDateInput.required = true;
                endDateInput.required = true;
            } else {
                dateControls.style.display = 'none';
                startDateInput.required = false;
                endDateInput.required = false;
                startDateInput.value = '';
                endDateInput.value = '';
            }

            updateNavigationState();
            refreshData(); // This will use the new period
        });

        // Set up date input handlers
        startDateInput.addEventListener('change', () => {
            if (startDateInput.value && endDateInput.value) {
                periodFilter.value = 'custom';
                updateNavigationState();
                refreshData();
            }
        });

        endDateInput.addEventListener('change', () => {
            if (startDateInput.value && endDateInput.value) {
                periodFilter.value = 'custom';
                updateNavigationState();
                refreshData();
            }
        });

        // Initialize navigation state
        updateNavigationState();
    }

    function initializeNavigation() {
        console.log('Initializing navigation...');
        
        // Add Bootstrap's navbar toggle functionality
        const navbarToggler = document.querySelector('.navbar-toggler');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        
        if (navbarToggler && navbarCollapse) {
            navbarToggler.addEventListener('click', () => {
                navbarCollapse.classList.toggle('show');
            });
        }

        // Set up section navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                document.getElementById(section === 'timesheets' ? 'timesheet' : section).classList.add('active');
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        console.log('Navigation initialized');
    }

    // Show message function
    function showMessage(message, isError = false) {
        if (messageBox) {
            messageBox.textContent = message;
            messageBox.className = `message-box ${isError ? 'error' : 'success'}`;
            messageBox.style.display = 'block';
            setTimeout(() => messageBox.style.display = 'none', 3000);
        } else {
            console.log(`Message: ${message} (${isError ? 'error' : 'success'})`);
        }
    }

    // Clear form function
    function clearForm() {
        if (form) {
            form.reset();
            const employeeIdInput = document.getElementById('employeeId');
            if (employeeIdInput) {
                employeeIdInput.value = '';
            }
            if (submitBtn) {
                submitBtn.textContent = 'Add Employee';
            }
        }
    }

    // Remove employee function
    async function removeEmployee(id) {
        if (!confirm('Are you sure you want to remove this employee? This will set their status to inactive.')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/employees/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'inactive'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to remove employee');
            }

            showMessage('Employee removed successfully');
            await fetchEmployees(); // Refresh the employee list
        } catch (error) {
            showMessage('Error removing employee', true);
            console.error('Error:', error);
        }
    }

    // Add test timesheet data
    async function addTestTimesheetData(employeeName) {
        console.log('📅 ADMIN: Adding test timesheet data for', employeeName);
        
        const today = new Date();
        const entries = [];
        
        // Create entries for the last 7 days
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Random duration between 6 and 9 hours
            const hours = Math.floor(Math.random() * 3) + 6;
            const minutes = Math.floor(Math.random() * 60);
            const duration = `${hours}h ${minutes}m`;
            
            entries.push({
                date: date.toISOString().split('T')[0],
                duration: duration
            });
        }
        
        try {
            const response = await fetch('/api/timesheets/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employeeName,
                    entries,
                    totalHours: entries.length * 8 // Approximate
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add test timesheet data');
            }
            
            console.log('✅ ADMIN: Test timesheet data added successfully');
            return true;
        } catch (error) {
            console.error('❌ ADMIN: Error adding test timesheet data:', error);
            return false;
        }
    }

    // Fetch all employees
    async function fetchEmployees() {
        console.log('Fetching employees...');
        try {
            const response = await fetch(`${API_URL}/employees`);
            console.log('Employee API response:', response);
            const data = await response.json();
            console.log('Fetched employees:', data);
            
            // Filter only active employees
            const activeEmployees = data.filter(emp => emp.status === 'active');
            console.log('Active employees:', activeEmployees);
            
            // Update global employees array
            employees = activeEmployees;
            
            // Render the employee table
            renderEmployees();
            
            // Update employee tabs
            renderEmployeeTabs();
            
            // If current selected employee was deleted/inactive, select the first available
            if (!activeEmployees.find(emp => emp.name === selectedEmployee)) {
                if (activeEmployees.length > 0) {
                    console.log('Selected employee not found in active list. New selection:', activeEmployees[0].name);
                    selectEmployee(activeEmployees[0].name);
                } else {
                    console.log('No active employees available');
                    selectedEmployee = null;
                }
            }
            
            // Store in localStorage for offline access
            localStorage.setItem('employees', JSON.stringify(activeEmployees));
            localStorage.setItem('selectedEmployee', selectedEmployee || '');
            
        } catch (error) {
            console.error('Error fetching employees:', error);
            showMessage('Error fetching employees', true);
            
            // Try to load from localStorage if offline
            const cachedEmployees = localStorage.getItem('employees');
            if (cachedEmployees) {
                employees = JSON.parse(cachedEmployees);
                selectedEmployee = localStorage.getItem('selectedEmployee') || null;
                renderEmployees();
                renderEmployeeTabs();
            }
        }
    }

    // Render employees table
    function renderEmployees() {
        console.log('🔄 ADMIN: Rendering employee table');
        employeeTable.innerHTML = '';
        if (!employees || employees.length === 0) {
            console.log('⚠️ ADMIN: No employees to display');
            employeeTable.innerHTML = '<tr><td colspan="5">No employees found</td></tr>';
            return;
        }
        
        console.log(`✨ ADMIN: Rendering ${employees.length} employees`);
        employees.forEach(employee => {
            const row = employeeTable.insertRow();
            row.innerHTML = `
                <td>${employee.name || 'N/A'}</td>
                <td>${employee.contactNumber || '-'}</td>
                <td>${employee.role || 'N/A'}</td>
                <td>${employee.status || 'N/A'}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="LaundryAdmin.editEmployee('${employee._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="LaundryAdmin.deleteEmployee('${employee._id}')">Delete</button>
                    <button class="btn btn-secondary btn-sm" onclick="LaundryAdmin.removeEmployee('${employee._id}')">Remove</button>
                </td>
            `;
        });
        console.log('✅ ADMIN: Employee table rendered successfully');
    }

    // Edit employee
    function editEmployee(id) {
        const employee = employees.find(emp => emp._id === id);
        if (employee) {
            document.getElementById('employeeId').value = employee._id;
            document.getElementById('name').value = employee.name;
            document.getElementById('contactNumber').value = employee.contactNumber || '';
            document.getElementById('address').value = employee.address || '';
            document.getElementById('role').value = employee.role;
            document.getElementById('status').value = employee.status;
            submitBtn.textContent = 'Update Employee';
        }
    }

    // Delete employee
    async function deleteEmployee(id) {
        if (confirm('Are you sure you want to delete this employee?')) {
            try {
                const response = await fetch(`${API_URL}/api/employees/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    showMessage('Employee deleted successfully');
                    await fetchEmployees();
                } else {
                    throw new Error('Failed to delete employee');
                }
            } catch (error) {
                showMessage('Error deleting employee', true);
                console.error('Error:', error);
            }
        }
    }

    // Form submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const employeeId = document.getElementById('employeeId').value;
        const employeeData = {
            name: document.getElementById('name').value,
            contactNumber: document.getElementById('contactNumber').value,
            address: document.getElementById('address').value,
            role: document.getElementById('role').value,
            status: document.getElementById('status').value
        };

        try {
            const url = employeeId 
                ? `/api/employees/${employeeId}`
                : '/api/employees';
            const method = employeeId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employeeData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.msg || 'Failed to save employee');
            }

            showMessage(`Employee ${employeeId ? 'updated' : 'added'} successfully`);
            clearForm();
            await fetchEmployees();
        } catch (error) {
            console.error('❌ ADMIN: Error saving employee:', error);
            showMessage(error.message || 'Error saving employee', true);
        }
    });

    // Clear button handler
    clearBtn.addEventListener('click', clearForm);

    // Initialize everything when the page loads
    function initialize() {
        console.log('Initializing dashboard...');
        
        // Register Chart.js plugins
        if (window.Chart) {
            Chart.register(ChartDataLabels);
            console.log('Chart.js plugins registered');
        }

        // Set default date range to current month
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        document.getElementById('startDate').value = firstDayOfMonth.toISOString().split('T')[0];
        document.getElementById('endDate').value = today.toISOString().split('T')[0];
        
        // Set up refresh button click handler
        document.getElementById('refreshButton').addEventListener('click', refreshData);
        
        // Initialize all components
        initializeChart();
        initializePeriodFilter();
        initializeNavigation();
        refreshData();
        
        // Initialize employee list
        fetchEmployees();
        
        console.log('Dashboard initialization complete');
    }

    // Expose necessary functions to the global scope
    app.refreshData = refreshData;
    app.updateChart = updateChart;
    app.initializePeriodFilter = initializePeriodFilter;
    app.deleteEmployee = deleteEmployee;  // Expose employee management functions
    app.editEmployee = editEmployee;
    app.removeEmployee = removeEmployee;

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Initialize date inputs with current month
    function initializeTimesheetDates() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        timesheetStartDate.value = firstDay.toISOString().split('T')[0];
        timesheetEndDate.value = lastDay.toISOString().split('T')[0];
    }

    // Format duration to hours and minutes
    function formatDuration(minutes) {
        if (!minutes) return '--';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    // Format date and time
    function formatDateTime(dateString, format = 'date') {
        if (!dateString) return '--';
        const date = new Date(dateString);
        if (format === 'date') {
            return date.toLocaleDateString();
        } else if (format === 'time') {
            return date.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        }
        return '--';
    }

    // Fetch timesheet data from server
    async function fetchTimesheetData() {
        console.log('📅 ADMIN: Fetching timesheet data...');
        if (!selectedEmployee) {
            console.log('⚠️ ADMIN: No employee selected');
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
            timesheetTable.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Failed to load timesheet data</td></tr>';
        }
    }

    // Render timesheet table
    function renderTimesheet() {
        console.log('🔄 ADMIN: Rendering timesheet table');
        if (!timesheetTable) {
            console.error('❌ ADMIN: Timesheet table element not found');
            return;
        }

        timesheetTable.innerHTML = '';
        let totalHours = 0;

        if (!Array.isArray(timesheetData) || timesheetData.length === 0) {
            console.log('⚠️ ADMIN: No timesheet data to display');
            timesheetTable.innerHTML = '<tr><td colspan="5" class="text-center">No timesheet entries found for this period</td></tr>';
            totalHoursSpan.textContent = '0';
            return;
        }

        console.log(`📊 ADMIN: Rendering ${timesheetData.length} timesheet entries`);
        timesheetData.forEach(entry => {
            const row = document.createElement('tr');
            
            // Format the date as YYYY-MM-DD
            const date = new Date(entry.date);
            const formattedDate = date.toISOString().split('T')[0];
            
            // Format times as HH:MM
            const clockInTime = entry.clockIn ? new Date(entry.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A';
            const clockOutTime = entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A';
            
            // Calculate hours (duration is in minutes)
            const hours = entry.duration ? (entry.duration / 60).toFixed(2) : '0.00';
            
            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${clockInTime}</td>
                <td>${clockOutTime}</td>
                <td>${hours}</td>
                <td>
                    <span class="badge ${entry.status === 'completed' ? 'bg-success' : 'bg-warning'}">
                        ${entry.status || 'N/A'}
                    </span>
                </td>
            `;
            timesheetTable.appendChild(row);

            if (entry.duration) {
                totalHours += entry.duration / 60;
            }
        });

        console.log(`✨ ADMIN: Total hours calculated: ${totalHours.toFixed(2)}`);
        totalHoursSpan.textContent = totalHours.toFixed(2);
    }

    // Render employee tabs
    function renderEmployeeTabs() {
        employeeTabs.innerHTML = '';
        employees.forEach(employee => {
            const tab = document.createElement('button');
            tab.className = `tab ${employee.name === selectedEmployee ? 'active' : ''}`;
            tab.textContent = employee.name;
            tab.onclick = () => selectEmployee(employee.name);
            employeeTabs.appendChild(tab);
        });
    }

    // Select employee and update timesheet
    function selectEmployee(employeeName) {
        selectedEmployee = employeeName;
        renderEmployeeTabs();
        fetchTimesheetData();
    }

    // Event listeners for date filters
    document.querySelector('.filter-btn').addEventListener('click', () => {
        console.log('🔍 ADMIN: Filter button clicked');
        if (selectedEmployee) {
            fetchTimesheetData();
        }
    });

    // Initialize timesheet and filters
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 ADMIN: Initializing page...');
        initializeTimesheetDates();
        fetchEmployees();
    });
})(window.LaundryAdmin); 