const fetch = require('node-fetch');

async function testEmployeeAPI() {
    try {
        console.log('Testing employee API...');
        const response = await fetch('http://localhost:5000/api/employees');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const employees = await response.json();
        console.log('Employees fetched successfully:');
        console.log(JSON.stringify(employees, null, 2));
        
    } catch (error) {
        console.error('Error testing employee API:', error);
    }
}

testEmployeeAPI(); 