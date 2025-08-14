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