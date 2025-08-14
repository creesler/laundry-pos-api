import { Box, Paper, Typography, ButtonGroup, Button, Menu, MenuItem, ToggleButtonGroup, ToggleButton } from '@mui/material'
import { blue } from '@mui/material/colors'
import { LineChart, BarChart } from '@mui/x-charts'
import { SxProps, Theme } from '@mui/material/styles'

interface SalesChartProps {
  sx?: SxProps;
  savedData: SalesRecord[];
  viewType: 'week' | 'month' | 'year';
  setViewType: (type: 'week' | 'month' | 'year') => void;
  weekAnchorEl: HTMLElement | null;
  monthAnchorEl: HTMLElement | null;
  yearAnchorEl: HTMLElement | null;
  onWeekClick: (event: React.MouseEvent<HTMLElement>) => void;
  onMonthClick: (event: React.MouseEvent<HTMLElement>) => void;
  onYearClick: (event: React.MouseEvent<HTMLElement>) => void;
  onWeekClose: () => void;
  onMonthClose: () => void;
  onYearClose: () => void;
  onWeekSelect: (week: number) => void;
  onMonthSelect: (month: number) => void;
  onYearSelect: (year: number) => void;
  selectedWeek: number;
  selectedMonth: number;
  selectedYear: number;
  weekItems: number[];
  monthItems: number[];
  yearItems: number[];
}

export default function SalesChart({ 
  sx,
  savedData,
  viewType,
  setViewType,
  weekAnchorEl,
  monthAnchorEl,
  yearAnchorEl,
  onWeekClick,
  onMonthClick,
  onYearClick,
  onWeekClose,
  onMonthClose,
  onYearClose,
  onWeekSelect,
  onMonthSelect,
  onYearSelect,
  selectedWeek,
  selectedMonth,
  selectedYear,
  weekItems,
  monthItems,
  yearItems
}: SalesChartProps) {
  const chartData = calculateDailyTotals()

  const commonProps = {
    dataset: chartData,
    height: 90,
    margin: { 
      left: 35,
      right: 5,
      top: 5,
      bottom: 15
    }
  }

  const commonAxisProps = {
    tickLabelStyle: {
      fontSize: 9,
      fill: '#666666'
    },
    valueFormatter: (value: number) => `$${(value / 50).toFixed(0)}`,
    tickInterval: 'auto' as const
  }

  const renderChart = () => {
    if (viewType === 'line') {
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
              onClick={onWeekClick}
              variant={viewType === 'week' ? 'contained' : 'outlined'}
              sx={{ fontSize: '1.2vh', py: 0 }}
            >
              {selectedWeek}
            </Button>
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
        anchorEl={weekAnchorEl}
        open={Boolean(weekAnchorEl)}
        onClose={onWeekClose}
      >
        {weekItems.map((week) => (
          <MenuItem 
            key={week} 
            onClick={() => {
              onWeekSelect(week)
              onWeekClose()
            }}
            selected={selectedWeek === week}
          >
            Week {week}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={monthAnchorEl}
        open={Boolean(monthAnchorEl)}
        onClose={onMonthClose}
      >
        {monthItems.map((month) => (
          <MenuItem 
            key={month} 
            onClick={() => {
              onMonthSelect(month)
              onMonthClose()
            }}
            selected={selectedMonth === month}
          >
            {new Date(2024, month).toLocaleString('default', { month: 'long' })}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={yearAnchorEl}
        open={Boolean(yearAnchorEl)}
        onClose={onYearClose}
      >
        {yearItems.map((year) => (
          <MenuItem 
            key={year} 
            onClick={() => {
              onYearSelect(year)
              onYearClose()
            }}
            selected={selectedYear === year}
          >
            {year}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
} 