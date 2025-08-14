export interface TimeLogEntry {
  employeeName: string;
  date: string;
  time: string;
  action: 'in' | 'out';
}

export interface TimeEntryPair {
  employeeName: string;
  clockIn: Date;
  clockOut: Date;
} 