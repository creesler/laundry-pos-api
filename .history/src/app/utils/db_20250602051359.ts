// IndexedDB configuration
const DB_NAME = 'LaundryKingDB'
const DB_VERSION = 3

// Define store names
const STORES = {
  SALES: 'sales',
  INVENTORY: 'inventory',
  INVENTORY_LOGS: 'inventoryLogs',
  EMPLOYEE_TIME: 'employeeTime',
  EMPLOYEE_LIST: 'employeeList',
  SETTINGS: 'settings'
} as const

// Connection management
let db: IDBDatabase | null = null

// Open and cache database connection
const getConnection = async (): Promise<IDBDatabase> => {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('Error opening IndexedDB:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      
      // Handle connection closing
      db.onclose = () => {
        db = null
      }
      
      // Handle connection errors
      db.onerror = (event) => {
        console.error('Database error:', event)
        db = null
      }

      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create stores if they don't exist
      if (!database.objectStoreNames.contains(STORES.SALES)) {
        database.createObjectStore(STORES.SALES, { keyPath: 'id', autoIncrement: true })
      }

      if (!database.objectStoreNames.contains(STORES.INVENTORY)) {
        const inventoryStore = database.createObjectStore(STORES.INVENTORY, { keyPath: 'id' })
        inventoryStore.createIndex('name', 'name', { unique: true })
      }

      if (!database.objectStoreNames.contains(STORES.INVENTORY_LOGS)) {
        const logsStore = database.createObjectStore(STORES.INVENTORY_LOGS, { keyPath: 'id' })
        logsStore.createIndex('itemId', 'itemId', { unique: false })
        logsStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      if (!database.objectStoreNames.contains(STORES.EMPLOYEE_TIME)) {
        const timeStore = database.createObjectStore(STORES.EMPLOYEE_TIME, { keyPath: 'id', autoIncrement: true })
        timeStore.createIndex('employeeName', 'employeeName', { unique: false })
        timeStore.createIndex('date', 'date', { unique: false })
      }

      if (!database.objectStoreNames.contains(STORES.EMPLOYEE_LIST)) {
        database.createObjectStore(STORES.EMPLOYEE_LIST, { keyPath: 'name' })
      }

      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' })
      }
    }
  })
}

// Generic get all function
const getAllFromStore = async <T>(storeName: string): Promise<T[]> => {
  const connection = await getConnection()
  return new Promise((resolve, reject) => {
    const transaction = connection.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Generic put function
const putInStore = async <T>(storeName: string, data: T): Promise<T> => {
  const connection = await getConnection()
  return new Promise((resolve, reject) => {
    const transaction = connection.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(data)

    request.onsuccess = () => resolve(data)
    request.onerror = () => reject(request.error)
  })
}

// Generic delete function
const deleteFromStore = async (storeName: string, key: IDBValidKey): Promise<void> => {
  const connection = await getConnection()
  return new Promise((resolve, reject) => {
    const transaction = connection.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(key)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Specific functions for each store
export const saveSalesRecord = async (record: any) => {
  return putInStore(STORES.SALES, {
    ...record,
    timestamp: Date.now() // Add timestamp for easier querying
  })
}

export const getSalesRecords = async (startDate?: Date, endDate?: Date) => {
  const records = await getAllFromStore(STORES.SALES)
  if (!startDate || !endDate) return records

  return records.filter(record => {
    const recordDate = new Date(record.Date)
    return recordDate >= startDate && recordDate <= endDate
  })
}

export const saveInventoryItem = async (item: any) => {
  return putInStore(STORES.INVENTORY, item)
}

export const getInventoryItems = async () => {
  return getAllFromStore(STORES.INVENTORY)
}

export const saveInventoryLog = async (log: any) => {
  return putInStore(STORES.INVENTORY_LOGS, {
    ...log,
    timestamp: Date.now()
  })
}

export const getInventoryLogs = async (itemId?: string) => {
  const logs = await getAllFromStore(STORES.INVENTORY_LOGS)
  return itemId ? logs.filter(log => log.itemId === itemId) : logs
}

export const saveEmployeeTimeRecord = async (record: any) => {
  return putInStore(STORES.EMPLOYEE_TIME, {
    ...record,
    timestamp: Date.now()
  })
}

export const getEmployeeTimeRecords = async (employeeName?: string, startDate?: Date, endDate?: Date) => {
  const records = await getAllFromStore(STORES.EMPLOYEE_TIME)
  return records.filter(record => {
    const matchesEmployee = !employeeName || record.employeeName === employeeName
    const matchesDate = !startDate || !endDate || (
      new Date(record.date) >= startDate && 
      new Date(record.date) <= endDate
    )
    return matchesEmployee && matchesDate
  })
}

export const saveEmployeeList = async (employees: string[]) => {
  const connection = await getConnection()
  const transaction = connection.transaction(STORES.EMPLOYEE_LIST, 'readwrite')
  const store = transaction.objectStore(STORES.EMPLOYEE_LIST)

  // Clear existing employees
  await new Promise((resolve, reject) => {
    const request = store.clear()
    request.onsuccess = () => resolve(null)
    request.onerror = () => reject(request.error)
  })

  // Add new employees
  return Promise.all(
    employees.map(name => 
      putInStore(STORES.EMPLOYEE_LIST, { name })
    )
  )
}

export const getEmployeeList = async () => {
  const employees = await getAllFromStore(STORES.EMPLOYEE_LIST)
  return employees.map(e => e.name)
}

export const saveSetting = async (key: string, value: any) => {
  return putInStore(STORES.SETTINGS, { key, value })
}

export const getSetting = async (key: string) => {
  const connection = await getConnection()
  return new Promise((resolve, reject) => {
    const transaction = connection.transaction(STORES.SETTINGS, 'readonly')
    const store = transaction.objectStore(STORES.SETTINGS)
    const request = store.get(key)

    request.onsuccess = () => resolve(request.result?.value)
    request.onerror = () => reject(request.error)
  })
}

// Migration helper
export const migrateData = async (oldData: any) => {
  if (!oldData) return

  try {
    // Migrate sales data
    if (oldData.data) {
      await Promise.all(
        oldData.data.map((record: any) => saveSalesRecord(record))
      )
    }

    // Migrate inventory
    if (oldData.inventory) {
      await Promise.all(
        oldData.inventory.map((item: any) => saveInventoryItem(item))
      )
    }

    // Migrate inventory logs
    if (oldData.inventoryLogs) {
      await Promise.all(
        oldData.inventoryLogs.map((log: any) => saveInventoryLog(log))
      )
    }

    // Migrate employee time data
    if (oldData.employeeTimeData) {
      await Promise.all(
        oldData.employeeTimeData.map((record: any) => saveEmployeeTimeRecord(record))
      )
    }

    // Migrate employee list
    if (oldData.employeeList) {
      await saveEmployeeList(oldData.employeeList)
    }

    // Save last synced timestamp
    if (oldData.lastSynced) {
      await saveSetting('lastSynced', oldData.lastSynced)
    }

    console.log('Data migration completed successfully')
  } catch (error) {
    console.error('Error during data migration:', error)
    throw error
  }
} 