import { AlertColor } from '@mui/material';

export interface SheetData {
  Date: string;
  Coin: string;
  Hopper: string;
  Soap: string;
  Vending: string;
  'Drop Off Amount 1': string;
  'Drop Off Code': string;
  'Drop Off Amount 2': string;
  [key: string]: string; // Add index signature for dynamic access
}

export interface GoogleSheetResult {
  result: {
    values?: any[][];
    sheets?: Array<{
      properties?: {
        title?: string;
        sheetId?: number;
      };
    }>;
  };
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
  [key: string]: string | boolean;
}

export interface InventoryUpdate {
  id: string;
  itemId: string;
  previousStock: number;
  newStock: number;
  updateType: 'usage' | 'restock' | 'adjustment';
  timestamp: string;
  updatedBy: string;
  notes?: string;
  isSaved: boolean;
}

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: AlertColor;
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