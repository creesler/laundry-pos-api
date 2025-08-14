'use client'

import React, { useEffect, useState } from 'react'
import { saveToIndexedDB, getFromIndexedDB } from './utils/db'
import {
  Box,
  Button,
  Grid,
  IconButton,
  Input,
  Menu,
  MenuItem,
  Modal,
  TextField,
  Typography,
} from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { enhancedDB } from './utils/db'

interface EmployeeData {
  name: string
  data: { [key: string]: string }
  clockIns: { timestamp: string }[]
}

interface Item {
  name: string
  price: number
  quantity: number
}

const Page = () => {
  const [employeeTimeData, setEmployeeTimeData] = useState<EmployeeData[]>([])
  const [data, setData] = useState<Item[]>([])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState<number>(0)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [employeeList, setEmployeeList] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'inventory' | 'sales'>('inventory')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const storedData = await getFromIndexedDB()
      setEmployeeTimeData(storedData.employeeTimeData || [])
      setData(storedData.data || [])
      setEmployeeList(storedData.employeeList || [])
    }

    const restoreIfNeeded = async () => {
      const productCount = await enhancedDB.products.count()
      if (productCount === 0) {
        if (confirm('No local data found. Load from backup file?')) {
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = '.json'

          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
              const text = await file.text()
              const { products, timestamps, employees } = JSON.parse(text)

              await enhancedDB.products.bulkAdd(products || [])
              await enhancedDB.clockIns.bulkAdd(timestamps || [])
              await enhancedDB.employeesMeta.bulkAdd(employees || [])

              alert('Backup restored successfully. Refreshing...')
              location.reload()
            }
          }

          input.click()
        }
      }
    }

    fetchData()
    restoreIfNeeded()
  }, [])
  const handleSave = async (index: number) => {
    const updatedData = [...data]
    if (updatedData[index].quantity === undefined) {
      updatedData[index].quantity = 0
    }

    await saveToIndexedDB({ data: updatedData })
    setData(updatedData)

    // Save to enhanced Dexie DB
    await enhancedDB.products.put({
      name: updatedData[index].name,
      price: updatedData[index].price,
    })

    await exportLocalBackup()
  }

  const exportLocalBackup = async () => {
    const products = await enhancedDB.products.toArray()
    const timestamps = await enhancedDB.clockIns.toArray()
    const employees = await enhancedDB.employeesMeta.toArray()

    const blob = new Blob(
      [JSON.stringify({ products, timestamps, employees })],
      {
        type: 'application/json',
      }
    )

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'laundry-backup.json'
    a.click()
  }

  const handleAddProduct = async () => {
    const updatedData = [...data, { name: newProductName, price: newProductPrice, quantity: 0 }]
    setData(updatedData)
    setShowAddProductModal(false)
    setNewProductName('')
    setNewProductPrice(0)
    await saveToIndexedDB({ data: updatedData })

    await enhancedDB.products.put({
      name: newProductName,
      price: newProductPrice,
    })

    await exportLocalBackup()
  }

  const handleClockIn = async () => {
    if (!selectedEmployee) return

    const timestamp = new Date().toISOString()
    const updatedEmployeeTimeData = [...employeeTimeData]
    const employeeIndex = updatedEmployeeTimeData.findIndex(
      (emp) => emp.name === selectedEmployee
    )

    if (employeeIndex === -1) {
      updatedEmployeeTimeData.push({
        name: selectedEmployee,
        data: {},
        clockIns: [{ timestamp }],
      })
    } else {
      updatedEmployeeTimeData[employeeIndex].clockIns.push({ timestamp })
    }

    setEmployeeTimeData(updatedEmployeeTimeData)
    await saveToIndexedDB({ employeeTimeData: updatedEmployeeTimeData })

    await enhancedDB.clockIns.add({
      employeeId: employeeIndex !== -1 ? employeeIndex : updatedEmployeeTimeData.length - 1,
      timestamp,
    })

    await exportLocalBackup()
  }
