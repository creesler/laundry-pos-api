// Create a global namespace for our app
window.LaundryAdmin = window.LaundryAdmin || {};

// API URL constant - automatically detect environment
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://laundry-pos-backend.vercel.app/api';

// Debug log to check initialization
console.log('🚀 Initializing LaundryAdmin with API_URL:', API_URL);

// Test function to check all endpoints
async function testAllEndpoints() {
    console.log('🔍 Testing all endpoints...');

    // Test employees endpoint
    try {
        console.log('👥 Testing /employees endpoint...');
        const employeesResponse = await fetch(`${API_URL}/employees`);
        console.log('Response status:', employeesResponse.status);
        if (!employeesResponse.ok) {
            const errorText = await employeesResponse.text();
            console.error('Error response:', errorText);
        } else {
            const employees = await employeesResponse.json();
            console.log('Employees data:', employees);
        }
    } catch (error) {
        console.error('Error fetching employees:', error);
    }

    // Test sales endpoint
    try {
        console.log('💰 Testing /sales endpoint...');
        const salesResponse = await fetch(`${API_URL}/sales`);
        console.log('Response status:', salesResponse.status);
        if (!salesResponse.ok) {
            const errorText = await salesResponse.text();
            console.error('Error response:', errorText);
        } else {
            const sales = await salesResponse.json();
            console.log('Sales data:', sales);
        }
    } catch (error) {
        console.error('Error fetching sales:', error);
    }

    // Test timesheets endpoint
    try {
        console.log('⏰ Testing /timesheets endpoint...');
        const timesheetsResponse = await fetch(`${API_URL}/timesheets`);
        console.log('Response status:', timesheetsResponse.status);
        if (!timesheetsResponse.ok) {
            const errorText = await timesheetsResponse.text();
            console.error('Error response:', errorText);
        } else {
            const timesheets = await timesheetsResponse.json();
            console.log('Timesheets data:', timesheets);
        }
    } catch (error) {
        console.error('Error fetching timesheets:', error);
    }

    // Test inventory endpoint
    try {
        console.log('📦 Testing /inventory endpoint...');
        const inventoryResponse = await fetch(`${API_URL}/inventory`);
        console.log('Response status:', inventoryResponse.status);
        if (!inventoryResponse.ok) {
            const errorText = await inventoryResponse.text();
            console.error('Error response:', errorText);
        } else {
            const inventory = await inventoryResponse.json();
            console.log('Inventory data:', inventory);
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }

    console.log('✅ Endpoint testing complete');
}

// Run the test when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Running endpoint tests...');
    testAllEndpoints();
});