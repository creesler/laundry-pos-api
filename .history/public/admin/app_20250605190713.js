// Create a global namespace for our app
window.LaundryAdmin = {};

// Wait for all functions to be defined before initializing
(function(app) {
    // Global state
    let chart = null;
    let allSalesData = null;  // Store all sales data
    let currentData = null;  // Initialize as null instead of with default values

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
        
        return data.filter(sale => {
            const saleDate = new Date(sale.Date);
            return saleDate >= start && saleDate <= end;
        });
    }

    // Calculate totals from sales data
    function calculateTotals(salesData) {
        if (!salesData || !salesData.length) return null;

        return {
            coin: salesData.reduce((sum, sale) => sum + (parseFloat(sale.Coin) || 0), 0),
            hopper: salesData.reduce((sum, sale) => sum + (parseFloat(sale.Hopper) || 0), 0),
            soap: salesData.reduce((sum, sale) => sum + (parseFloat(sale.Soap) || 0), 0),
            vending: salesData.reduce((sum, sale) => sum + (parseFloat(sale.Vending) || 0), 0),
            dropOff1: salesData.reduce((sum, sale) => sum + (parseFloat(sale['Drop Off Amount 1']) || 0), 0),
            dropOff2: salesData.reduce((sum, sale) => sum + (parseFloat(sale['Drop Off Amount 2']) || 0), 0)
        };
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
        if (!totals) return;

        currentData = {
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
    }

    async function fetchAllData() {
        try {
            const response = await fetch('/api/sales');
            
            if (!response.ok) {
                throw new Error('Failed to fetch sales data');
            }

            allSalesData = await response.json();
            return allSalesData;
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
            }
        } else {
            const dateRange = getDateRange(periodFilter.value);
            if (dateRange) {
                filteredStartDate = dateRange.start;
                filteredEndDate = dateRange.end;
            }
        }

        // If we don't have data yet, fetch it
        if (!allSalesData) {
            allSalesData = await fetchAllData();
        }

        if (allSalesData) {
            const filteredData = filterData(allSalesData, filteredStartDate, filteredEndDate);
            const totals = calculateTotals(filteredData);
            
            if (totals) {
                updateChart(totals);
                updateTable(filteredData);
                updateDateRangeDisplay(filteredStartDate, filteredEndDate, periodFilter.value);
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
                updateDateRangeDisplay(filteredStartDate, filteredEndDate, periodFilter.value);
            }
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