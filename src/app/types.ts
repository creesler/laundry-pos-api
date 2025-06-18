import { AlertColor } from '@mui/material'

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

export interface InputValues {
  Date: string;
  Coin: string;
  Hopper: string;
  Soap: string;
  Vending: string;
  'Drop Off Amount 1': string;
  'Drop Off Code': string;
  'Drop Off Amount 2': string;
  [key: string]: string;
}

export interface TimeEntry {
  _id?: string;
  date: string;
  time: string;
  action: 'in' | 'out';
  employeeName: string;
  isSaved: boolean;
  clockInTime?: string;
  clockOutTime?: string | null;
}

export interface FormattedTimeEntry {
  date: string;
  duration: string;
  employeeName: string;
}

export interface TimesheetRecord {
  date: string;
  timeIn: string;
  timeOut: string;
  duration: string;
  status: 'Completed' | 'Pending';
  employeeName: string;
  isSaved: boolean;
}

export interface Employee {
  _id: string;
  name: string;
  status: string;
  contactNumber?: string;
  address?: string;
  role?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  maxStock: number;
  minStock: number;
  unit: string;
  lastUpdated: string;
  isDeleted: boolean;
  isSaved?: boolean;
}

export interface InventoryUpdateLog {
  id: string;
  itemId: string;
  previousStock: number;
  newStock: number;
  updateType: 'restock' | 'usage' | 'adjustment';
  timestamp: string;
  updatedBy: string;
  notes?: string;
  isSaved: boolean;
}

export interface SalesRecord {
  Date: string;
  Coin: string;
  Hopper: string;
  Soap: string;
  Vending: string;
  'Drop Off Amount 1': string;
  'Drop Off Code': string;
  'Drop Off Amount 2': string;
  isSaved: boolean;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  previousStock: number;
  newStock: number;
  updateType: 'restock' | 'usage' | 'adjustment';
  timestamp: string;
  updatedBy: string;
  notes?: string;
  isSaved: boolean;
}

export interface SheetRow {
  [key: string]: string | number | boolean;
}

export interface TimeEntryPair {
  clockIn: TimeEntry;
  clockOut?: TimeEntry;
  duration?: string;
} 