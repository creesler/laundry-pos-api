import { Box, Paper, Typography, ButtonGroup, Button, Menu, MenuItem, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { blue } from '@mui/material/colors'
import { LineChart, BarChart } from '@mui/x-charts'
import { SxProps, Theme } from '@mui/material/styles'

interface SalesChartProps {
  viewType: 'week' | 'month' | 'year'
  chartType: 'line' | 'bar'
  selectedMonth: number
  selectedYear: number
  monthAnchorEl: HTMLElement | null
  yearAnchorEl: HTMLElement | null
  onMonthClick: (event: React.MouseEvent<HTMLElement>) => void
  onYearClick: (event: React.MouseEvent<HTMLElement>) => void
  onMonthClose: () => void
  onYearClose: () => void
  onMonthSelect: (month: number) => void
  onYearSelect: (year: number) => void
  onChartTypeChange: (type: 'line' | 'bar') => void
  calculateDailyTotals: () => Array<{ date: string; total: number }>
  yearItems: React.ReactNode[]
  sx?: SxProps<Theme>
}

export default function SalesChart({
  viewType,
  chartType,
  selectedMonth,
  selectedYear,
  monthAnchorEl,
  yearAnchorEl,
  onMonthClick,
  onYearClick,
  onMonthClose,
  onYearClose,
  onMonthSelect,
  onYearSelect,
  onChartTypeChange,
  calculateDailyTotals,
  yearItems,
  sx
}: SalesChartProps) {
  const chartData = calculateDailyTotals()

  const commonProps = {
    dataset: chartData,
    height: 50,
    margin: { 
      left: 35,
      right: 5,
      top: 5,
      bottom: 15
    }
  }

  const commonAxisProps = {
    tickLabelStyle: {
      fontSize: 8,
      fill: '#666666'
    },
    valueFormatter: (value: number) => `$${(value / 50).toFixed(0)}`,
    tickInterval: 'auto' as const
  }

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart
          {...commonProps}
          xAxis={[{
            scaleType: 'point' as const,
            dataKey: 'date',
            tickLabelStyle: {
              fontSize: 8,
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
            valueFormatter: (value) => `$${(value / 50).toFixed(0)}`,
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
              strokeWidth: 1
            },
            '.MuiMarkElement-root': {
              stroke: blue[600],
              fill: 'white',
              strokeWidth: 1,
              r: 2
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
            fontSize: 8,
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
          valueFormatter: (value) => `$${(value / 50).toFixed(0)}`
        }]}
      />
    )
  }

  return (
    <Box sx={{ 
      ...sx,
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      bgcolor: '#fff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: '0.8vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e7eb',
        flexShrink: 0
      }}>
        <Typography fontSize="1.6vh" fontWeight="medium">
          Sales Overview
        </Typography>
        <Box sx={{ display: 'flex', gap: '0.8vh', alignItems: 'center' }}>
          <ButtonGroup size="small" sx={{ height: '2.5vh' }}>
            <Button
              onClick={onMonthClick}
              variant={viewType === 'month' ? 'contained' : 'outlined'}
              sx={{ fontSize: '1.2vh', py: 0 }}
            >
              {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'short' })} {selectedYear}
            </Button>
            <Button
              onClick={onYearClick}
              variant={viewType === 'year' ? 'contained' : 'outlined'}
              sx={{ fontSize: '1.2vh', py: 0 }}
            >
              {selectedYear}
            </Button>
          </ButtonGroup>
          <ToggleButtonGroup
            size="small"
            value={chartType}
            exclusive
            onChange={(e, value) => value && onChartTypeChange(value)}
            sx={{ height: '2.5vh' }}
          >
            <ToggleButton value="line" sx={{ fontSize: '1.2vh', py: 0 }}>
              Line
            </ToggleButton>
            <ToggleButton value="bar" sx={{ fontSize: '1.2vh', py: 0 }}>
              Bar
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Chart */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        p: '0.5vh'
      }}>
        {renderChart()}
      </Box>

      {/* Menus */}
      <Menu
        anchorEl={monthAnchorEl}
        open={Boolean(monthAnchorEl)}
        onClose={onMonthClose}
      >
        {Array.from({ length: 12 }, (_, i) => (
          <MenuItem 
            key={i} 
            onClick={() => {
              onMonthSelect(i)
              onMonthClose()
            }}
            selected={selectedMonth === i && viewType === 'month'}
          >
            {new Date(2024, i).toLocaleString('default', { month: 'long' })}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={yearAnchorEl}
        open={Boolean(yearAnchorEl)}
        onClose={onYearClose}
      >
        {yearItems}
      </Menu>
    </Box>
  )
} 