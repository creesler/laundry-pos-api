// IndexedDB configuration
const DB_NAME = 'LaundryKingDB'
const DB_VERSION = 2  // Increment version number
const STORE_NAME = 'laundryData'

// Open IndexedDB connection
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result
      const oldVersion = event.oldVersion
      
      // Handle version upgrades
      if (oldVersion < 1) {
        // First time setup
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          // Initialize with empty data structure
          store.put({
            id: 'current',
            data: {
              employeeTimeData: [],
              data: [],
              employeeList: []
            },
            timestamp: new Date().toISOString()
          })
        }
      }
      
      if (oldVersion < 2) {
        // Version 2 upgrade - preserve existing data
        if (db.objectStoreNames.contains(STORE_NAME)) {
          const transaction = event.target?.transaction
          if (transaction) {
            const store = transaction.objectStore(STORE_NAME)
            const request = store.get('current')
            
            request.onsuccess = () => {
              if (request.result) {
                // Keep existing data and update the structure if needed
                store.put({
                  ...request.result,
                  timestamp: new Date().toISOString()
                })
              }
            }
          }
        }
      }
    }
  })
}

// Save data to IndexedDB
export const saveToIndexedDB = async (data: any) => {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    // Get current data first
    const currentData = await new Promise((resolve, reject) => {
      const request = store.get('current')
      request.onsuccess = () => resolve(request.result?.data || { employeeTimeData: [], data: [], employeeList: [] })
      request.onerror = () => reject(request.error)
    })

    // Process data array to ensure isSaved is boolean
    const processedData = data.data ? data.data.map((item: any) => ({
      ...item,
      isSaved: item.isSaved === true || item.isSaved === 'true'
    })) : currentData.data

    // Merge current data with new data, ensuring we preserve arrays
    const mergedData = {
      id: 'current',
      data: {
        employeeTimeData: data.employeeTimeData || currentData.employeeTimeData || [],
        data: processedData,
        employeeList: data.employeeList || currentData.employeeList || [],
        lastSynced: data.lastSynced || currentData.lastSynced || new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    }

    return new Promise((resolve, reject) => {
      const request = store.put(mergedData)
      
      request.onsuccess = () => {
        console.log('Successfully saved to IndexedDB:', mergedData)
        resolve(true)
      }
      
      request.onerror = () => {
        console.error('Error in IndexedDB save:', request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('Error saving to IndexedDB:', error)
    return false
  }
}

// Get data from IndexedDB
export const getFromIndexedDB = async (): Promise<any> => {
  try {
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.get('current')
      
      request.onsuccess = () => {
        const result = request.result?.data || {
          employeeTimeData: [],
          data: [],
          employeeList: []
        }
        // Ensure isSaved is boolean when retrieving
        if (result.data) {
          result.data = result.data.map((item: any) => ({
            ...item,
            isSaved: item.isSaved === true || item.isSaved === 'true'
          }))
        }
        console.log('Retrieved from IndexedDB:', result)
        resolve(result)
      }
      
      request.onerror = () => {
        console.error('Error in IndexedDB get:', request.error)
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('Error reading from IndexedDB:', error)
    return null
  }
} 