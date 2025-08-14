'use client'
import { useEffect, useState } from 'react'
import { enhancedDB } from './utils/db'

const exportLocalBackup = async () => {
  const products = await enhancedDB.products.toArray()
  const timestamps = await enhancedDB.clockIns.toArray()
  const employees = await enhancedDB.employeesMeta.toArray()

  const blob = new Blob([JSON.stringify({ products, timestamps, employees })], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'laundry-backup.json'
  a.click()
}

useEffect(() => {
  const checkAndRestore = async () => {
    const products = await enhancedDB.products.toArray()
    if (products.length === 0) {
      if (confirm('No local data found. Would you like to load from a backup file?')) {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = '.json'

        input.onchange = async (e) => {
          const file = e.target.files?.[0]
          if (file) {
            const text = await file.text()
            const { products, timestamps, employees } = JSON.parse(text)

            await enhancedDB.products.bulkAdd(products || [])
            await enhancedDB.clockIns.bulkAdd(timestamps || [])
            await enhancedDB.employeesMeta.bulkAdd(employees || [])
            alert('Data restored from backup.')
            window.location.reload()
          }
        }

        input.click()
      }
    }
  }

  checkAndRestore()
}, [])
