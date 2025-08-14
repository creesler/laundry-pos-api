import { create } from 'zustand'
import { GOOGLE_SHEETS_CONFIG } from '../app/config'

interface EmployeeStore {
  employees: string[];
  selectedEmployee: string | null;
  loading: boolean;
  fetchEmployees: () => Promise<void>;
  setSelectedEmployee: (name: string | null) => void;
}

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  employees: [],
  selectedEmployee: null,
  loading: false,

  fetchEmployees: async () => {
    set({ loading: true });
    try {
      // Initialize Google API if needed
      if (!window.gapi?.client?.sheets) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://apis.google.com/js/api.js';
          script.onload = () => {
            window.gapi.load('client', async () => {
              try {
                await window.gapi.client.init({
                  apiKey: GOOGLE_SHEETS_CONFIG.API_KEY,
                  discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                });
                resolve();
              } catch (error) {
                reject(error);
              }
            });
          };
          script.onerror = () => reject(new Error('Failed to load Google API'));
          document.body.appendChild(script);
        });
      }

      // Get spreadsheet metadata to find employee sheets
      const spreadsheet = await window.gapi.client.sheets.spreadsheets.get({
        spreadsheetId: GOOGLE_SHEETS_CONFIG.SHEET_ID
      });

      // Filter out non-employee sheets (like the main data sheet)
      const employeeSheets = spreadsheet.result.sheets?.filter(sheet => 
        sheet.properties?.title !== GOOGLE_SHEETS_CONFIG.RANGE.split('!')[0]
      ) || [];

      // Get employee names from sheet titles
      const employeeNames = employeeSheets.map(sheet => sheet.properties?.title || '');

      set({ employees: employeeNames });
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      set({ loading: false });
    }
  },

  setSelectedEmployee: (name) => set({ selectedEmployee: name })
})); 