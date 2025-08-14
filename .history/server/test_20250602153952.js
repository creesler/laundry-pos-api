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

    // Create test employees
    const employees = [
      {
        name: 'Amy Wanders',
        contactNumber: '123-456-7890',
        status: 'active',
        role: 'staff'
      },
      {
        name: 'Rachel Malcolm',
        contactNumber: '098-765-4321',
        status: 'active',
        role: 'staff'
      }
    ];

    for (const employeeData of employees) {
      // Check if employee exists
      let employee = await Employee.findOne({ name: employeeData.name });
      
      if (!employee) {
        console.log(`Creating employee: ${employeeData.name}`);
        employee = await Employee.create(employeeData);
      }

      console.log(`Processing timesheet for: ${employee.name} (${employee._id})`);

      // Create sample timesheet entries for the last 7 days
      const today = new Date();
      const timesheetEntries = [];

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Morning shift
        const morningIn = new Date(date);
        morningIn.setHours(9, 0, 0, 0);
        
        const morningOut = new Date(date);
        morningOut.setHours(13, 0, 0, 0);

        timesheetEntries.push({
          employeeId: employee._id,
          employeeName: employee.name,
          date: morningIn,
          timeIn: morningIn,
          timeOut: morningOut,
          status: 'completed'
        });

        // Afternoon shift
        const afternoonIn = new Date(date);
        afternoonIn.setHours(14, 0, 0, 0);
        
        const afternoonOut = new Date(date);
        afternoonOut.setHours(18, 0, 0, 0);

        timesheetEntries.push({
          employeeId: employee._id,
          employeeName: employee.name,
          date: afternoonIn,
          timeIn: afternoonIn,
          timeOut: afternoonOut,
          status: 'completed'
        });
      }

      // Delete existing entries for this employee
      await Timesheet.deleteMany({ employeeId: employee._id });

      // Save new entries
      await Promise.all(timesheetEntries.map(entry => new Timesheet(entry).save()));

      console.log(`Created ${timesheetEntries.length} timesheet entries for ${employee.name}`);
    }

    console.log('\nAll test data created successfully!');

  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the script
createTestData(); 