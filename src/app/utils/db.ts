// IndexedDB configuration
const DB_NAME = 'LaundryKingDB'
const DB_VERSION = 3  // Incrementing version to add indexes
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

    request.onupgradeneeded = (event) => {
      const db = request.result
      let store;
      
      // Create store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        
        // Add indexes for faster queries
        store.createIndex('timestamp', 'timestamp', { unique: false })
        store.createIndex('type', 'type', { unique: false })
        
        // Initialize with separate records for different data types
        const timestamp = new Date().toISOString()
        const defaultRecords = [
          {
            id: 'employeeTimeData',
            type: 'employeeTime',
            data: [],
            timestamp
          },
          {
            id: 'salesData',
            type: 'sales',
            data: [],
            timestamp
          },
          {
            id: 'employeeList',
            type: 'employees',
            data: [],
            timestamp
          },
          {
            id: 'inventory',
            type: 'inventory',
            data: [],
            timestamp
          },
          {
            id: 'inventoryLogs',
            type: 'inventoryLogs',
            data: [],
            timestamp
          }
        ];
        
        // Add each record
        defaultRecords.forEach(record => {
          store.put(record);
        });
      }
    }
  })
}

// Selective data retrieval
export const getFromIndexedDB = async (dataTypes: string[] = ['all']): Promise<any> => {
  try {
    console.log('🔍 Reading from IndexedDB');
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    // If specific data types are requested, only fetch those
    if (!dataTypes.includes('all')) {
      const results: { [key: string]: any } = {}
      
      await Promise.all(dataTypes.map(async (type) => {
        const id = type === 'sales' ? 'salesData' : type + (type === 'employee' ? 'List' : 'Data')
        const request = store.get(id)
        
        return new Promise((resolve, reject) => {
          request.onsuccess = () => {
            results[type] = request.result?.data || []
            if (type === 'sales' && results[type]) {
              results[type] = results[type].map((item: any) => ({
                ...item,
                isSaved: item.isSaved === true || item.isSaved === 'true'
              }))
            }
            resolve(null)
          }
          request.onerror = () => reject(request.error)
        })
      }))
      
      return results
    }
    
    // If all data is requested, fetch everything
    const requests = [
      store.get('employeeTimeData'),
      store.get('salesData'),
      store.get('employeeList'),
      store.get('inventory'),
      store.get('inventoryLogs')
    ]
    
    const results = await Promise.all(requests.map(request => 
      new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result?.data || [])
        request.onerror = () => resolve([])
      })
    ))
    
    return {
      employeeTimeData: results[0],
      data: Array.isArray(results[1]) ? (results[1] as any[]).map((item: any) => ({
        ...item,
        isSaved: item.isSaved === true || item.isSaved === 'true'
      })) : [],
      employeeList: results[2],
      inventory: results[3],
      inventoryLogs: results[4]
    }
  } catch (error) {
    console.error('❌ Error reading from IndexedDB:', error)
    return null
  }
}

// Save data to IndexedDB with type separation
export const saveToIndexedDB = async (data: any) => {
  try {
    console.log('💾 Saving to IndexedDB:', data);
    const db = await openDB()
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const timestamp = new Date().toISOString()

    // Prepare all updates
    const updates = []

    if (data.employeeTimeData !== undefined) {
      updates.push({
        id: 'employeeTimeData',
        type: 'employeeTime',
        data: data.employeeTimeData,
        timestamp
      })
    }

    if (data.data !== undefined) {
      updates.push({
        id: 'salesData',
        type: 'sales',
        data: data.data.map((item: any) => ({
          ...item,
          isSaved: item.isSaved === true || item.isSaved === 'true'
        })),
        timestamp
      })
    }

    if (data.employeeList !== undefined) {
      console.log('👥 Updating employee list in IndexedDB:', data.employeeList);
      updates.push({
        id: 'employeeList',
        type: 'employees',
        data: data.employeeList,
        timestamp
      })
    }

    if (data.inventory !== undefined) {
      updates.push({
        id: 'inventory',
        type: 'inventory',
        data: data.inventory,
        timestamp
      })
    }

    if (data.inventoryLogs !== undefined) {
      updates.push({
        id: 'inventoryLogs',
        type: 'inventoryLogs',
        data: data.inventoryLogs,
        timestamp
      })
    }

    // Perform all updates in parallel
    await Promise.all(updates.map(update => 
      new Promise((resolve, reject) => {
        const request = store.put(update)
        request.onsuccess = () => {
          console.log(`✅ Successfully saved ${update.type} to IndexedDB`);
          resolve(true)
        }
        request.onerror = () => {
          console.error(`❌ Failed to save ${update.type} to IndexedDB:`, request.error);
          reject(request.error)
        }
      })
    ))

    return true
  } catch (error) {
    console.error('❌ Error saving to IndexedDB:', error)
    return false
  }
} 