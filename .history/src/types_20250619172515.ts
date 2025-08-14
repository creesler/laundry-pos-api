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
  Date: string;
  TimeIn: string;
  TimeOut: string;
  Duration: string;
  Status: string;
  EmpName: string;
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
  [key: string]: string;
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