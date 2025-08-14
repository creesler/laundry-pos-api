import React from 'react'
import { LineChart, BarChart } from '@mui/x-charts'
import { blue } from '@mui/material/colors'

interface ChartProps {
  data: Array<{
    date: string
    total: number
  }>
  type: 'line' | 'bar'
  height?: number
}

const Chart: React.FC<ChartProps> = ({ data, type = 'line', height = 150 }) => {
  const commonProps = {
    dataset: data,
    height,
    margin: {
      left: 65,
      right: 15,
      top: 15,
      bottom: 45
    }
  }

  const commonAxisProps = {
    tickLabelStyle: {
      fontSize: 12,
      fill: '#666666'
    },
    valueFormatter: (value: number) => `$${(value / 50).toFixed(2)}`,
    tickInterval: 'auto' as const
  }

  if (type === 'line') {
    return (
      <LineChart
        {...commonProps}
        xAxis={[{
          scaleType: 'point' as const,
          dataKey: 'date',
          tickLabelStyle: {
            fontSize: 10,
            fill: '#666666',
            angle: 45,
            textAnchor: 'start'
          },
          position: 'bottom',
          tickSize: 0
        }]}
        yAxis={[{
          scaleType: 'linear' as const,
          min: 0,
          position: 'left',
          ...commonAxisProps
        }]}
        series={[{
          dataKey: 'total',
          color: blue[600],
          valueFormatter: (value) => `$${(value / 50).toFixed(2)}`,
          area: false,
          showMark: true,
          connectNulls: false,
          curve: "linear"
        }]}
        slotProps={{
          legend: {
            hidden: true
          }
        }}
        sx={{
          '.MuiLineElement-root': {
            strokeWidth: 2
          },
          '.MuiMarkElement-root': {
            stroke: blue[600],
            fill: 'white',
            strokeWidth: 2,
            r: 4
          }
        }}
      />
    )
  }

  return (
    <BarChart
      {...commonProps}
      xAxis={[{
        scaleType: 'band' as const,
        dataKey: 'date',
        tickLabelStyle: {
          fontSize: 10,
          fill: '#666666',
          angle: 45,
          textAnchor: 'start'
        },
        position: 'bottom',
        tickSize: 0
      }]}
      yAxis={[{
        scaleType: 'linear' as const,
        min: 0,
        position: 'left',
        ...commonAxisProps
      }]}
      series={[{
        dataKey: 'total',
        color: blue[600],
        valueFormatter: (value) => `$${(value / 50).toFixed(2)}`
      }]}
    />
  )
}

export default Chart 