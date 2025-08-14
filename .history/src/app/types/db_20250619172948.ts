import { TimeEntry, SalesRecord, InventoryItem, InventoryUpdate } from '@/types'

export interface DBData {
  employeeTimeData: TimeEntry[];
  savedData: SalesRecord[];
  inventoryItems: InventoryItem[];
  inventoryLogs: InventoryUpdate[];
  data: any[];
  employeeList: string[];
  lastSynced?: string;
}

export interface DBRecord {
  id: string;
  data: DBData;
  timestamp: string;
} 