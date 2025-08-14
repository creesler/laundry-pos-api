const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Timesheet = require('./models/Timesheet');

async function createTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/laundry_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Create a test employee if not exists
    let employee = await Employee.findOne({ name: 'John Doe' });
    if (!employee) {
      employee = await Employee.create({
        name: 'John Doe',
        contactNumber: '123-456-7890',
        status: 'active',
        role: 'staff'
      });
    }

    // Create sample timesheet entries for the last 7 days
    const today = new Date();
    const timesheetEntries = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(9, 0, 0, 0); // 9:00 AM

      // Create timesheet entry
      const timesheet = new Timesheet({
        employeeId: employee._id,
        employeeName: employee.name,
        date: date,
        timeIn: date,
        timeOut: new Date(date.setHours(17, 0, 0, 0)), // 5:00 PM
        status: 'completed'
      });

      timesheetEntries.push(timesheet);
    }

    // Save all entries
    await Promise.all(timesheetEntries.map(entry => entry.save()));

    console.log('Test data created successfully');
    console.log(`Created ${timesheetEntries.length} timesheet entries for employee: ${employee.name}`);

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
createTestData(); 