// Chart.js setup
Chart.register(ChartDataLabels);

// Global state
let chart = null;
let currentData = {
    labels: ['Coin', 'Hopper', 'Soap', 'Vending', 'Drop Off 1', 'Drop Off 2'],
    values: [436, 170, 367, 299, 771, 690]
};

// Format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
};

// Initialize chart
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

// Initialize period filter
function initializePeriodFilter() {
    const periodFilter = document.getElementById('periodFilter');
    const specificPeriodControl = document.getElementById('specificPeriodControl');
    const specificPeriod = document.getElementById('specificPeriod');

    // Hide specific period control initially
    specificPeriodControl.style.display = 'none';

    // Set up period options based on filter
    periodFilter.addEventListener('change', (e) => {
        specificPeriodControl.style.display = e.target.value === 'all' ? 'none' : 'block';
        specificPeriod.innerHTML = ''; // Clear existing options

        if (e.target.value !== 'all') {
            const today = new Date();
            const options = [];

            switch (e.target.value) {
                case 'day':
                    // Last 7 days
                    for (let i = 0; i < 7; i++) {
                        const date = new Date(today);
                        date.setDate(date.getDate() - i);
                        options.push({
                            value: date.toISOString().split('T')[0],
                            label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                        });
                    }
                    break;
                case 'week':
                    // Last 4 weeks
                    for (let i = 0; i < 4; i++) {
                        const date = new Date(today);
                        date.setDate(date.getDate() - (i * 7));
                        const endDate = new Date(date);
                        const startDate = new Date(date.setDate(date.getDate() - 6));
                        options.push({
                            value: `${startDate.toISOString().split('T')[0]},${endDate.toISOString().split('T')[0]}`,
                            label: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        });
                    }
                    break;
                case 'month':
                    // Last 6 months
                    for (let i = 0; i < 6; i++) {
                        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
                        options.push({
                            value: date.toISOString().split('T')[0],
                            label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        });
                    }
                    break;
                case 'year':
                    // Last 3 years
                    for (let i = 0; i < 3; i++) {
                        const year = today.getFullYear() - i;
                        options.push({
                            value: `${year}-01-01`,
                            label: year.toString()
                        });
                    }
                    break;
            }

            // Add options to select
            options.forEach(option => {
                const el = document.createElement('option');
                el.value = option.value;
                el.textContent = option.label;
                specificPeriod.appendChild(el);
            });
        }

        // Clear custom date inputs when switching to a preset period
        if (e.target.value !== 'all') {
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
        }

        refreshData();
    });

    // Handle specific period changes
    specificPeriod.addEventListener('change', refreshData);
}

// Update chart with new data
function updateChart(data) {
    if (!data) return;

    currentData = {
        labels: ['Coin', 'Hopper', 'Soap', 'Vending', 'Drop Off 1', 'Drop Off 2'],
        values: [
            data.totals.coin || 0,
            data.totals.hopper || 0,
            data.totals.soap || 0,
            data.totals.vending || 0,
            data.totals.dropOff1 || 0,
            data.totals.dropOff2 || 0
        ]
    };

    if (chart) {
        chart.data.labels = currentData.labels;
        chart.data.datasets[0].data = currentData.values;
        chart.update();
    } else {
        initializeChart();
    }

    // Update table if data includes sales records
    if (data.sales) {
        updateTable(data.sales);
    }
}

// Update date range display
function updateDateRangeDisplay(startDate, endDate) {
    const dateRangeDisplay = document.getElementById('dateRangeDisplay');
    const periodFilter = document.getElementById('periodFilter').value;

    if (startDate && endDate) {
        // Format dates properly
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

// Fetch and update data
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

// Update table
function updateTable(data) {
    const tableBody = document.getElementById('salesTableBody');
    tableBody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${new Date(row.date).toLocaleString()}</td>
            <td>${formatCurrency(row.coin)}</td>
            <td>${formatCurrency(row.hopper)}</td>
            <td>${formatCurrency(row.soap)}</td>
            <td>${formatCurrency(row.vending)}</td>
            <td>${formatCurrency(row.dropOff1)}</td>
            <td>${formatCurrency(row.dropOff2)}</td>
        `;
        tableBody.appendChild(tr);
    });

    // Update total amount
    const total = data.reduce((sum, row) => 
        sum + row.coin + row.hopper + row.soap + row.vending + row.dropOff1 + row.dropOff2, 0);
    document.getElementById('totalAmount').textContent = formatCurrency(total);
}

// Refresh data
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
        currentData = {
            labels: ['Coin', 'Hopper', 'Soap', 'Vending', 'Drop Off 1', 'Drop Off 2'],
            values: [
                data.totals.coin,
                data.totals.hopper,
                data.totals.soap,
                data.totals.vending,
                data.totals.dropOff1,
                data.totals.dropOff2
            ]
        };
        
        initializeChart();
        updateTable(data.sales);
        updateDateRangeDisplay(startDate, endDate);
    }
}

// Navigation
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

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Set default date range to current month
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('startDate').value = firstDayOfMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    
    initializeChart();
    initializePeriodFilter();
    refreshData();
}); 