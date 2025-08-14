const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Timesheet = require('./models/Timesheet');

async function checkData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/laundry_app', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // List all employees
    const employees = await Employee.find({});
    console.log('\nAll Employees:');
    for (const emp of employees) {
      console.log(`- ${emp.name} (${emp._id})`);
      
      // Count timesheets for this employee
      const timesheetCount = await Timesheet.countDocuments({ employeeId: emp._id });
      console.log(`  Timesheet entries: ${timesheetCount}`);
      
      // Show some sample timesheet entries
      const timesheets = await Timesheet.find({ employeeId: emp._id }).limit(3);
      if (timesheets.length > 0) {
        console.log('  Sample entries:');
        timesheets.forEach(ts => {
          console.log(`    Date: ${ts.date}, In: ${ts.timeIn}, Out: ${ts.timeOut}`);
        });
      }
    }

    // Create a test employee and timesheet entries if none exist
    if (employees.length === 0) {
      console.log('\nNo employees found. Creating test data...');
      
      const employee = await Employee.create({
        name: 'John Doe',
        contactNumber: '123-456-7890',
        status: 'active',
        role: 'staff'
      });

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
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
checkData(); 