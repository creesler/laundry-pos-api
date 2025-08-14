import { AlertColor } from '@mui/material'

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

export interface InputValues {
  name: string;
  quantity: number;
  price: number;
  category: string;
  description: string;
}

export interface TimeEntry {
  date: string;
  time: string;
  action: 'in' | 'out';
  employeeName: string;
  isSaved: boolean;
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
  _id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryUpdateLog {
  _id?: string;
  itemId: string;
  itemName: string;
  oldQuantity: number;
  newQuantity: number;
  oldPrice: number;
  newPrice: number;
  updateType: 'add' | 'remove' | 'edit';
  timestamp: string;
  userId?: string;
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

export interface GoogleSheetProperties {
  title?: string;
  sheetId?: number;
}

export interface GoogleSheet {
  properties?: GoogleSheetProperties;
}

export interface SpreadsheetData {
  result: {
    sheets?: GoogleSheet[];
  };
}

export interface SheetRow {
  [key: string]: string | number | boolean;
} 