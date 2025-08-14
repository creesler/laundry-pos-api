// Global state
let chart = null;
let currentData = {
    labels: ['Coin', 'Hopper', 'Soap', 'Vending', 'Drop Off 1', 'Drop Off 2'],
    values: [436, 170, 367, 299, 771, 690]
};

// Utility functions
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
};

// Chart functions
function initializeChart() {
    const ctx = document.getElementById('totalSalesChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: currentData.labels,
            datasets: [{
                data: currentData.values,
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

function updateChart(data) {
    if (!data) return;

    currentData = {
        labels: ['Coin', 'Hopper', 'Soap', 'Vending', 'Drop Off 1', 'Drop Off 2'],
        values: [
            data.totals?.coin || 0,
            data.totals?.hopper || 0,
            data.totals?.soap || 0,
            data.totals?.vending || 0,
            data.totals?.dropOff1 || 0,
            data.totals?.dropOff2 || 0
        ]
    };

    if (chart) {
        chart.data.labels = currentData.labels;
        chart.data.datasets[0].data = currentData.values;
        chart.update();
    } else {
        initializeChart();
    }
}

// Data display functions
function updateDateRangeDisplay(startDate, endDate) {
    const dateRangeDisplay = document.getElementById('dateRangeDisplay');
    const periodFilter = document.getElementById('periodFilter').value;

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const formattedStart = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const formattedEnd = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        dateRangeDisplay.textContent = `${formattedStart} to ${formattedEnd}`;
    } else if (periodFilter !== 'all') {
        dateRangeDisplay.textContent = `Current ${periodFilter}`;
    } else {
        dateRangeDisplay.textContent = 'All Time';
    }
}

function updateTable(data) {
    const tableBody = document.getElementById('salesTableBody');
    tableBody.innerHTML = '';

    if (!Array.isArray(data)) return;

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(row.date).toLocaleString()}</td>
            <td>${formatCurrency(row.coin || 0)}</td>
            <td>${formatCurrency(row.hopper || 0)}</td>
            <td>${formatCurrency(row.soap || 0)}</td>
            <td>${formatCurrency(row.vending || 0)}</td>
            <td>${formatCurrency(row.dropOff1 || 0)}</td>
            <td>${formatCurrency(row.dropOff2 || 0)}</td>
        `;
        tableBody.appendChild(tr);
    });

    // Update total amount
    const total = data.reduce((sum, row) => 
        sum + (row.coin || 0) + (row.hopper || 0) + (row.soap || 0) + 
        (row.vending || 0) + (row.dropOff1 || 0) + (row.dropOff2 || 0), 0);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

// Data fetching
async function fetchData(params = {}) {
    try {
        const queryParams = new URLSearchParams(params).toString();
        const response = await fetch(`/api/sales${queryParams ? `?${queryParams}` : ''}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

async function refreshData() {
    const periodFilter = document.getElementById('periodFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    const params = {};
    
    if (periodFilter !== 'all') {
        params.period = periodFilter;
    }
    
    if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
    }

    const data = await fetchData(params);
    
    if (data) {
        updateChart(data);
        updateTable(data.sales || []);
        updateDateRangeDisplay(startDate, endDate);
    }
}

// Event handlers
function initializePeriodFilter() {
    const periodFilter = document.getElementById('periodFilter');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Set up period filter change handler
    periodFilter.addEventListener('change', (e) => {
        if (e.target.value !== 'all') {
            startDateInput.value = '';
            endDateInput.value = '';
        }
        refreshData();
    });

    // Set up date input handlers
    startDateInput.addEventListener('change', refreshData);
    endDateInput.addEventListener('change', refreshData);
}

// Navigation
function initializeNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = e.target.getAttribute('data-section');
            
            // Update active states
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            
            e.target.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Register Chart.js plugins
    Chart.register(ChartDataLabels);

    // Set default date range to current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('startDate').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    
    // Initialize all components
    initializeChart();
    initializePeriodFilter();
    initializeNavigation();
    refreshData();
}); 