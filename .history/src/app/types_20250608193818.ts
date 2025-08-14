import { AlertColor } from '@mui/material'

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export interface InputValues {
  amount: string;
  quantity: string;
  service: string;
  notes: string;
}

export interface TimeEntry {
  date: string;
  time: string;
  action: 'in' | 'out';
  employeeName: string;
  isSaved: boolean;
  _id?: string;
}

export interface SalesRecord {
  date: string;
  amount: number;
  quantity: number;
  service: string;
  notes?: string;
  employeeName: string;
  isSaved: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  maxStock: number;
  minStock: number;
  unit: string;
  isDeleted: boolean;
  lastUpdated: string;
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