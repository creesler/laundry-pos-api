export interface TimeEntry {
  date: string;
  time: string;
  action: 'in' | 'out';
  employeeName: string;
  isSaved: boolean;
  _id?: string;
  clockInTime?: string;
  clockOutTime?: string | undefined;
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
  isSaved?: boolean;
  [key: string]: string | boolean | undefined;
}

export interface GoogleSheetResult {
  result: {
    values: any[][];
  };
}

export type SheetData = SalesRecord; 