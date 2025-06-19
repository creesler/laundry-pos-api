import { EmployeeTimeEntry } from './timesheet'

export interface DBData {
  employeeTimeData: EmployeeTimeEntry[];
  data: any[];
  employeeList: string[];
  lastSynced?: string;
}

export interface DBRecord {
  id: string;
  data: DBData;
  timestamp: string;
} 