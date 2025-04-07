export interface TimesheetRecord {
  date: string;
  timeIn: string;
  timeOut: string;
  employeeName: string;
  isSaved: boolean;
  duration: string;
  status: 'Completed' | 'Pending';
}

export interface EmployeeTimeEntry {
  date: string;
  time: string;
  action: 'in' | 'out';
  employeeName: string;
  isSaved: boolean;
} 