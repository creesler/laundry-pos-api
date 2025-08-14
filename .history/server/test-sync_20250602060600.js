const axios = require('axios');

async function testSync() {
  try {
    console.log('\nTesting sync endpoint...');
    
    // Test data matching our frontend structure
    const testData = {
      sales: [{
        Date: new Date().toISOString(),
        Coin: '50',
        Hopper: '20',
        Soap: '10',
        Vending: '15',
        'Drop Off Amount 1': '25',
        'Drop Off Code': 'TEST123',
        'Drop Off Amount 2': '30'
      }],
      timesheet: [{
        employeeName: 'Test Employee',
        date: '2024-03-14',
        time: '9:00 AM',
        action: 'in'
      }],
      inventory: [{
        name: 'Test Item',
        currentStock: 50,
        maxStock: 100,
        minStock: 10,
        unit: 'pieces'
      }],
      inventoryLogs: [{
        itemId: 'test-item-1',
        previousStock: 40,
        newStock: 50,
        updateType: 'restock',
        timestamp: new Date().toISOString(),
        updatedBy: 'Test Employee',
        notes: 'Test restock'
      }]
    };

    console.log('Sending test data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:5000/api/sync', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\nResponse:', response.data);
    console.log('\nSync test completed successfully!');

  } catch (error) {
    console.error('\nError testing sync:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

// Run the test
testSync(); 