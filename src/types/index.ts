export interface TimeEntry {
  employeeName: string;
  time: string;
  action: 'in' | 'out';
  isSaved?: boolean;
  _id?: string;
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
  id: string;
  Date: string;
  Coin: string;
  Hopper: string;
  Soap: string;
  Vending: string;
  'Drop Off Amount 1': string;
  'Drop Off Code': string;
  'Drop Off Amount 2': string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total?: number;
  isSaved?: boolean;
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