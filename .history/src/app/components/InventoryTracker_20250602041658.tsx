import { useState } from 'react';
import { Box, Paper, Typography, LinearProgress, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, FormControl, InputLabel } from '@mui/material';
import { blue, green, red, yellow, grey } from '@mui/material/colors';
import { SxProps, Theme } from '@mui/material/styles';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';
import { InventoryItem } from '../types';

interface InventoryTrackerProps {
  inventory: InventoryItem[];
  onUpdateStock: (itemId: string, newStock: number, updateType: 'restock' | 'usage' | 'adjustment', notes?: string) => void;
  onAddItem?: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  sx?: SxProps<Theme>;
}

export default function InventoryTracker({ inventory, onUpdateStock, onAddItem, sx }: InventoryTrackerProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateAmount, setUpdateAmount] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    currentStock: 0,
    maxStock: 100,
    minStock: 20,
    unit: 'units'
  });

  const handleItemClick = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    setSelectedItem(itemId);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleUpdateClick = () => {
    handleClose();
    setUpdateDialogOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (selectedItem && updateAmount) {
      const currentItem = inventory.find(item => item.id === selectedItem);
      if (currentItem) {
        const amount = Number(updateAmount);
        // If current maxStock is 0, set it to match the delivery amount
        const newMaxStock = currentItem.maxStock === 0 ? amount : currentItem.maxStock;
        
        console.log('Submitting update with:', {
          itemId: selectedItem,
          newStock: amount,
          newMaxStock: newMaxStock
        });
        
        onUpdateStock(
          selectedItem, 
          amount,
          'restock',
          `Stock updated to ${amount}. ${updateNotes}`
        );

        // Close dialog and reset fields
        setUpdateDialogOpen(false);
        setUpdateAmount('');
        setUpdateNotes('');
        setSelectedItem(null);
      }
    }
  };

  const handleAddSubmit = () => {
    if (onAddItem) {
      onAddItem(newItem);
    }
    setAddDialogOpen(false);
    setNewItem({
      name: '',
      currentStock: 0,
      maxStock: 100,
      minStock: 20,
      unit: 'units'
    });
  };

  const getStockLevelColor = (item: InventoryItem) => {
    const stockPercentage = (item.currentStock / item.maxStock) * 100;
    if (stockPercentage <= 25) return red[600];
    if (stockPercentage <= 50) return yellow[700];
    return blue[600];
  };

  return (
    <Paper sx={{ ...sx, p: '1.5vh', display: 'flex', flexDirection: 'column', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: 0, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2
      }}>
        <Typography fontSize="2.2vh" fontWeight="medium">Inventory</Typography>
        {onAddItem && (
          <IconButton size="small" onClick={() => setAddDialogOpen(true)}>
            <AddIcon />
          </IconButton>
        )}
      </Box>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '2vh',
        flex: 1,
        overflow: 'auto'
      }}>
        {inventory.map((item) => {
          const stockPercentage = item.maxStock > 0 ? (item.currentStock / item.maxStock) * 100 : 0;
          
          return (
            <Box 
              key={item.id} 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2,
                p: 1,
                borderRadius: 1,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography fontSize="1.8vh">{item.name}</Typography>
                  <Typography fontSize="1.6vh" color="text.secondary">
                    {`${item.currentStock}/${item.maxStock} ${item.unit}`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stockPercentage}
                  sx={{
                    height: '1.5vh',
                    borderRadius: '4px',
                    bgcolor: grey[200],
                    '& .MuiLinearProgress-bar': {
                      bgcolor: getStockLevelColor(item)
                    }
                  }}
                />
              </Box>
              <IconButton 
                size="small"
                onClick={(e) => handleItemClick(e, item.id)}
                title="Update Stock"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          );
        })}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleUpdateClick}>Update Stock</MenuItem>
      </Menu>

      <Dialog 
        open={updateDialogOpen} 
        onClose={() => {
          setUpdateDialogOpen(false);
          setUpdateAmount('');
          setUpdateNotes('');
          setSelectedItem(null);
        }}
      >
        <DialogTitle>Update Stock</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter the new stock amount.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Stock Amount"
            type="number"
            fullWidth
            value={updateAmount}
            onChange={(e) => setUpdateAmount(e.target.value)}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
          <TextField
            margin="dense"
            label="Notes (Optional)"
            fullWidth
            multiline
            rows={2}
            value={updateNotes}
            onChange={(e) => setUpdateNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setUpdateDialogOpen(false);
            setUpdateAmount('');
            setUpdateNotes('');
            setSelectedItem(null);
          }}>Cancel</Button>
          <Button 
            onClick={handleUpdateSubmit} 
            variant="contained"
            disabled={!updateAmount || Number(updateAmount) < 0}
          >
            Update Stock
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Item Name"
            fullWidth
            value={newItem.name}
            onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            margin="dense"
            label="Current Stock"
            type="number"
            fullWidth
            value={newItem.currentStock}
            onChange={(e) => setNewItem(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
          />
          <TextField
            margin="dense"
            label="Maximum Stock"
            type="number"
            fullWidth
            value={newItem.maxStock}
            onChange={(e) => setNewItem(prev => ({ ...prev, maxStock: Number(e.target.value) }))}
          />
          <TextField
            margin="dense"
            label="Minimum Stock"
            type="number"
            fullWidth
            value={newItem.minStock}
            onChange={(e) => setNewItem(prev => ({ ...prev, minStock: Number(e.target.value) }))}
          />
          <TextField
            margin="dense"
            label="Unit"
            fullWidth
            value={newItem.unit}
            onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddSubmit} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 