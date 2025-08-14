// src/app/utils/helpers.ts

// Calculate daily totals for chart
export function calculateDailyTotals(savedData: any[], viewType: 'month' | 'year', selectedMonth: number, selectedYear: number) {
  const dailyTotals = new Map<string, number>()
  let start, end

  if (viewType === 'month') {
    start = new Date(selectedYear, selectedMonth, 1)
    end = new Date(selectedYear, selectedMonth + 1, 0)
  } else {
    start = new Date(selectedYear, 0, 1)
    end = new Date(selectedYear, 11, 31)
  }

  savedData.forEach((row: any) => {
    const rowDate = new Date(row.Date.split(' ')[0])
    if (rowDate >= start && rowDate <= end) {
      let datePart
      if (viewType === 'year') {
        const month = rowDate.getMonth()
        datePart = month.toString()
      } else {
        datePart = rowDate.getDate().toString()
      }
      const rowTotal = [
        parseFloat(row.Coin) || 0,
        parseFloat(row.Hopper) || 0,
        parseFloat(row.Soap) || 0,
        parseFloat(row.Vending) || 0,
        parseFloat(row['Drop Off Amount 1']) || 0,
        parseFloat(row['Drop Off Amount 2']) || 0
      ].reduce((sum, val) => sum + val, 0)
      if (dailyTotals.has(datePart)) {
        dailyTotals.set(datePart, (dailyTotals.get(datePart) ?? 0) + rowTotal)
      } else {
        dailyTotals.set(datePart, rowTotal)
      }
    }
  })

  if (viewType === 'year') {
    for (let month = 0; month < 12; month++) {
      if (!dailyTotals.has(month.toString())) {
        dailyTotals.set(month.toString(), 0.001)
      }
    }
  } else {
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    for (let day = 1; day <= lastDay; day++) {
      if (!dailyTotals.has(day.toString())) {
        dailyTotals.set(day.toString(), 0.001)
      }
    }
  }

  const sortedEntries = Array.from(dailyTotals.entries())
    .sort((a: any, b: any) => parseInt(a[0]) - parseInt(b[0]))
    .map(([date, total]) => {
      let displayDate
      if (viewType === 'year') {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        displayDate = monthNames[parseInt(date)]
      } else {
        displayDate = date
      }
      return {
        date: displayDate,
        total: total === 0 ? 0.001 : parseFloat(total.toFixed(2))
      }
    })
  return sortedEntries
}

// Calculate chart width (if needed)
export function calculateChartWidth(viewType: 'month' | 'year', calculateDailyTotals: () => any[]) {
  if (viewType !== 'year') return '100%'
  const data = calculateDailyTotals()
  const dataPoints = data.length
  const pointWidth = 60
  const leftMargin = 65
  const rightMargin = 15
  const totalWidth = Math.max(800, leftMargin + (dataPoints * pointWidth) + rightMargin)
  return `${totalWidth}px`
}

// Calculate duration between two times
export function calculateDuration(timeIn: string, timeOut: string) {
  if (!timeIn || !timeOut || timeOut === '--') return '--'
  try {
    const [inTime, inPeriod] = timeIn.split(' ')
    const [outTime, outPeriod] = timeOut.split(' ')
    const inDate = new Date(`2000/01/01 ${inTime} ${inPeriod}`)
    const outDate = new Date(`2000/01/01 ${outTime} ${outPeriod}`)
    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return '--'
    const diff = outDate.getTime() - inDate.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  } catch {
    return '--'
  }
}

// Clear all fields utility
export function clearAllFields(setInputValues: (v: any) => void, setSelectedField: (v: string) => void, setEditingIndex: (v: number | null) => void) {
  const emptyInputs = {
    Date: new Date().toLocaleDateString(),
    Coin: '',
    Hopper: '',
    Soap: '',
    Vending: '',
    'Drop Off Amount 1': '',
    'Drop Off Code': '',
    'Drop Off Amount 2': '',
  }
  setInputValues(emptyInputs)
  setSelectedField('')
  setEditingIndex(null)
} 