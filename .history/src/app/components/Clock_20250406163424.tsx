'use client'

import { useState, useEffect } from 'react'
import { Typography } from '@mui/material'

export default function Clock() {
  const [time, setTime] = useState<string>('')

  useEffect(() => {
    // Set initial time
    setTime(new Date().toLocaleTimeString())

    // Update time every second
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Typography variant="h6" sx={{ color: 'black' }}>
      {time}
    </Typography>
  )
} 