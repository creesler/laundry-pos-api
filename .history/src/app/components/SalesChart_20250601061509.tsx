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
    height: 150,
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

  const renderChart = () => {
    if (chartType === 'line') {
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

  return (
    <Paper sx={{ ...sx, p: '1.5vh', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: 0, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: '1.5vh'
      }}>
        <Typography fontSize="2.2vh" fontWeight="medium">
          Sales Overview
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          mx: '2vh'
        }}>
          <Typography fontSize="1.8vh" color="text.secondary">
            Total Sales
          </Typography>
          <Typography fontSize="2.2vh" color={blue[600]} fontWeight="medium">
            ${chartData.reduce((sum, day) => sum + (day.total / 50), 0).toFixed(2)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: '1vh', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: '1vh' }}>
            <ButtonGroup size="small" sx={{ height: '3vh' }}>
              <Button
                onClick={onMonthClick}
                variant={viewType === 'month' ? 'contained' : 'outlined'}
                sx={{ fontSize: '1.4vh', py: 0 }}
              >
                {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'short' })} {selectedYear}
              </Button>
              <Button
                onClick={onYearClick}
                variant={viewType === 'year' ? 'contained' : 'outlined'}
                sx={{ fontSize: '1.4vh', py: 0 }}
              >
                {selectedYear}
              </Button>
            </ButtonGroup>
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
          <ToggleButtonGroup
            size="small"
            value={chartType}
            exclusive
            onChange={(e, value) => value && onChartTypeChange(value)}
            sx={{ height: '3vh' }}
          >
            <ToggleButton value="line" sx={{ fontSize: '1.4vh', py: 0 }}>
              Line
            </ToggleButton>
            <ToggleButton value="bar" sx={{ fontSize: '1.4vh', py: 0 }}>
              Bar
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        minHeight: 0,
        width: '100%',
        height: '100%'
      }}>
        <Box sx={{ 
          flex: 1,
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{
            overflowX: 'hidden',
            overflowY: 'hidden',
            pb: '8px',
            width: '100%'
          }}>
            <Box sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <Box sx={{
                height: '150px',
                width: '100%'
              }}>
                {renderChart()}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Paper>
  )
} 