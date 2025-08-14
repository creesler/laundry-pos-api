import { AlertColor } from '@mui/material'

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

export interface InventoryItem {
  id: string;
  _id?: string;  // MongoDB ID
  name: string;
  currentStock: number;
  maxStock: number;
  minStock: number;
  unit: string;
  lastUpdated: string;
  isSynced?: boolean;  // Track if item is synced with server
}

export interface InventoryUpdateLog {
  id: string;
  itemId: string;
  previousStock: number;
  newStock: number;
  updateType: 'restock' | 'sale' | 'adjustment' | 'damage' | 'other';
  timestamp: string;
  updatedBy: string;
  notes?: string;
  isSaved: boolean;
} 