// IndexedDB configuration
const DB_NAME = 'LaundryKingDB'
const DB_VERSION = 1
const STORE_NAME = 'laundryData'

// Open IndexedDB connection
export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(request.error)
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
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

    // Save with current timestamp as ID
    await store.put({
      id: 'current',
      data: data,
      timestamp: new Date().toISOString()
    })

    return true
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
    
    const request = store.get('current')
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result?.data || null)
      }
      request.onerror = () => {
        reject(request.error)
      }
    })
  } catch (error) {
    console.error('Error reading from IndexedDB:', error)
    return null
  }
} 