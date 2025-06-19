export interface TimeEntry {
  _id?: string;
  date: string;
  time: string;
  action: 'in' | 'out';
  employeeName: string;
  isSaved: boolean;
  clockInTime?: string;
  clockOutTime?: string;
}

export interface InventoryUpdate {
  id: string;
  itemId: string;
  previousStock: number;
  newStock: number;
  updateType: 'restock' | 'usage' | 'adjustment';
  timestamp: string;
  updatedBy: string;
  notes?: string;
  isSaved?: boolean;
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

export interface SheetData {
  Date: string;
  Coin: string;
  Hopper: string;
  Soap: string;
  Vending: string;
  'Drop Off Amount 1': string;
  'Drop Off Code': string;
  'Drop Off Amount 2': string;
  [key: string]: string; // Add index signature for dynamic keys
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