// Create a global namespace for our app
window.LaundryAdmin = {};

// Wait for all functions to be defined before initializing
(function(app) {
    // Global state
    let chart = null;
    let currentData = null;  // Initialize as null instead of with default values

    // Utility functions
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
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

        // Only update if we have actual data
        const hasData = currentData.values.some(value => value > 0);
        if (!hasData) {
            return; // Keep showing the default data if no actual data
        }

        if (chart) {
            chart.data.labels = currentData.labels;
            chart.data.datasets[0].data = currentData.values;
            chart.update();
        } else {
            initializeChart(currentData);
        }
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
        if (!Array.isArray(data)) return;

        const tableBody = document.getElementById('salesTableBody');
        tableBody.innerHTML = '';

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

    async function fetchData(params = {}) {
        try {
            // Fetch summary data
            const summaryParams = new URLSearchParams(params);
            const summaryResponse = await fetch(`/api/sales/summary?${summaryParams}`);
            
            if (!summaryResponse.ok) {
                throw new Error('Failed to fetch summary data');
            }

            const summaryData = await summaryResponse.json();

            // Check if we have any non-zero values
            const hasData = Object.values(summaryData).some(value => value > 0);
            if (!hasData) {
                console.log('No data found for the selected period');
                return null;
            }

            // Fetch detailed sales data
            const salesParams = new URLSearchParams(params);
            const salesResponse = await fetch(`/api/sales?${salesParams}`);
            
            if (!salesResponse.ok) {
                throw new Error('Failed to fetch sales data');
            }

            const salesData = await salesResponse.json();

            // Return combined data
            return {
                totals: {
                    coin: summaryData.coinTotal,
                    hopper: summaryData.hopperTotal,
                    soap: summaryData.soapTotal,
                    vending: summaryData.vendingTotal,
                    dropOff1: summaryData.dropOffAmount1Total,
                    dropOff2: summaryData.dropOffAmount2Total
                },
                sales: salesData
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            return null;
        }
    }

    async function refreshData() {
        const periodFilter = document.getElementById('periodFilter');
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        const params = {};
        
        if (periodFilter.value === 'custom') {
            if (startDate && endDate) {
                params.startDate = startDate;
                params.endDate = endDate;
            }
        } else if (periodFilter.value !== 'all') {
            params.period = periodFilter.value;
        }

        const data = await fetchData(params);
        
        if (data) {
            updateChart(data);
            updateTable(data.sales || []);
            updateDateRangeDisplay(startDate, endDate, periodFilter.value);
        }
    }

    function initializePeriodFilter() {
        const periodFilter = document.getElementById('periodFilter');
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const dateControls = document.getElementById('dateControls');

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
            
            refreshData();
        });

        // Set up date input handlers
        startDateInput.addEventListener('change', () => {
            if (startDateInput.value && endDateInput.value) {
                periodFilter.value = 'custom';
                refreshData();
            }
        });

        endDateInput.addEventListener('change', () => {
            if (startDateInput.value && endDateInput.value) {
                periodFilter.value = 'custom';
                refreshData();
            }
        });
    }

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
    function initialize() {
        // Register Chart.js plugins
        if (window.Chart) {
            Chart.register(ChartDataLabels);
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
    }

    // Expose necessary functions to the global scope
    app.refreshData = refreshData;
    app.updateChart = updateChart;
    app.initializePeriodFilter = initializePeriodFilter;

    // Start initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})(window.LaundryAdmin); 