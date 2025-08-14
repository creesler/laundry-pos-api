import { create } from 'zustand'

interface EmployeeState {
  employees: string[]
  selectedEmployee: string | null
  loading: boolean
  fetchEmployees: () => Promise<void>
  setSelectedEmployee: (name: string | null) => void
}

export const useEmployeeStore = create<EmployeeState>((set) => ({
  employees: [],
  selectedEmployee: null,
  loading: false,

  fetchEmployees: async () => {
    set({ loading: true })
    try {
      // Initialize Google Identity Services
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        callback: async (response) => {
          if (response.access_token) {
            try {
              // Load the Google Sheets API
              await new Promise((resolve, reject) => {
                const script = document.createElement('script')
                script.src = 'https://apis.google.com/js/api.js'
                script.onload = () => {
                  window.gapi.load('client', async () => {
                    try {
                      await window.gapi.client.init({
                        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
                        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                      })
                      resolve(null)
                    } catch (error) {
                      reject(error)
                    }
                  })
                }
                script.onerror = () => reject(new Error('Failed to load Google API'))
                document.body.appendChild(script)
              })

              // Set the access token
              window.gapi.client.setToken({
                access_token: response.access_token
              })

              // Fetch employee names from all sheet tabs
              const spreadsheetId = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID
              const response = await window.gapi.client.sheets.spreadsheets.get({
                spreadsheetId
              })

              // Get all sheet names except "Employees" tab
              const employeeNames = response.result.sheets
                ?.map(sheet => sheet.properties?.title)
                .filter(title => title && title !== 'Employees') || []

              set({ employees: employeeNames, loading: false })
            } catch (error) {
              console.error('Error fetching employees:', error)
              set({ loading: false })
            }
          }
        }
      })

      tokenClient.requestAccessToken()
    } catch (error) {
      console.error('Error initializing Google API:', error)
      set({ loading: false })
    }
  },

  setSelectedEmployee: (name) => set({ selectedEmployee: name })
})) 