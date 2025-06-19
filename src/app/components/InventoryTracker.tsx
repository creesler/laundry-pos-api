import { useState } from 'react';
import { Box, Paper, Typography, LinearProgress, IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, ToggleButtonGroup, ToggleButton, Tooltip, Collapse } from '@mui/material';
import { blue, green, red, yellow, grey } from '@mui/material/colors';
import { SxProps, Theme } from '@mui/material/styles';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import { InventoryItem } from '../types';

interface InventoryTrackerProps {
  inventory: InventoryItem[];
  onUpdateStock: (itemId: string, newStock: number, updateType: 'restock' | 'usage' | 'adjustment', notes?: string) => void;
  onAddItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
  onDeleteItem: (itemName: string) => void;
  sx?: SxProps<Theme>;
}

export default function InventoryTracker({ inventory, onUpdateStock, onAddItem, onDeleteItem, sx }: InventoryTrackerProps) {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateAmount, setUpdateAmount] = useState('');
  const [updateType, setUpdateType] = useState<'add' | 'set'>('add');
  const [updateNotes, setUpdateNotes] = useState('');
  const [newItem, setNewItem] = useState({
    name: '',
    currentStock: 0,
    maxStock: 100,
    minStock: 20,
    unit: 'units',
    isDeleted: false
  });
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleItemClick = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    console.log('handleItemClick called with itemId:', itemId);
    const currentItem = inventory.find(item => item.id === itemId);
    if (currentItem) {
      setSelectedItem(itemId);
      setUpdateAmount(currentItem.maxStock.toString()); // Show total stock capacity
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    console.log('handleClose called');
    setAnchorEl(null);
  };

  const handleUpdateClick = () => {
    console.log('handleUpdateClick called');
    handleClose();
    setUpdateDialogOpen(true);
  };

  const handleUpdateSubmit = () => {
    if (selectedItem && updateAmount) {
      const currentItem = inventory.find(item => item.id === selectedItem);
      if (currentItem) {
        console.log('Submitting update with:', {
          itemId: selectedItem,
          amount: Number(updateAmount)
        });
        
        onUpdateStock(
          selectedItem, 
          Number(updateAmount), // Ensure we're passing a number
          'restock',
          `Set total stock capacity to ${updateAmount} ${currentItem.unit}. ${updateNotes}`
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
      onAddItem({
        ...newItem,
        currentStock: 0, // Start with 0 used
        isDeleted: false
      });
    }
    setAddDialogOpen(false);
    setNewItem({
      name: '',
      currentStock: 0,
      maxStock: 100,
      minStock: 20,
      unit: 'units',
      isDeleted: false
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmItem) {
      onDeleteItem(deleteConfirmItem);
      setDeleteConfirmItem(null);
    }
  };

  const getStockLevelColor = (item: InventoryItem) => {
    const stockPercentage = (item.currentStock / item.maxStock) * 100;
    if (stockPercentage <= 25) return red[600];
    if (stockPercentage <= 50) return yellow[700];
    return blue[600];
  };

  return (
    <Paper sx={{ 
      ...sx, 
      p: '1vh', 
      display: 'flex', 
      flexDirection: 'column', 
      borderRadius: '8px', 
      border: '1px solid #e5e7eb', 
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      height: '100%',
      minHeight: { xs: isExpanded ? '150px' : 'auto', md: 'auto' },
      maxHeight: { xs: isExpanded ? '200px' : 'auto', md: '100%' },
      overflow: 'hidden'
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        mb: 0.5,
        flexShrink: 0
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1 
        }}>
          <IconButton 
            onClick={() => setIsExpanded(!isExpanded)}
            sx={{ 
              display: { xs: 'flex', md: 'none' },
              p: '3px'
            }}
          >
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
          <Typography 
            fontSize="2vh" 
            fontWeight="medium"
            sx={{ 
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            Inventory
          </Typography>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          justifyContent: 'flex-end',
          flexShrink: 0
        }}>
          <Button
            startIcon={<AddIcon />}
            size="small"
            onClick={() => setAddDialogOpen(true)}
            variant="contained"
            sx={{ 
              fontSize: '1.2vh', 
              py: 0.25,
              minWidth: 'auto',
              height: 'auto'
            }}
          >
            Add Item
          </Button>
        </Box>
      </Box>
      
      <Collapse in={isExpanded} sx={{ display: { md: 'block' } }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '1vh',
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '3px',
            '&:hover': {
              background: '#666',
            },
          }
        }}>
          {inventory.filter(item => !item.isDeleted).map((item) => {
            const currentStock = Number(item.currentStock) || 0;
            const maxStock = Number(item.maxStock) || 0;
            const usagePercentage = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;
            
            return (
              <Box 
                key={item.id} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1,
                  p: 0.75,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.02)'
                  }
                }}
              >
                <Box sx={{ 
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Typography 
                      fontSize="1.6vh"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography 
                      fontSize="1.4vh" 
                      color="text.secondary"
                      sx={{
                        flexShrink: 0,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {`${currentStock}/${maxStock} ${item.unit}`}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={usagePercentage}
                    sx={{
                      height: '1.2vh',
                      borderRadius: '3px',
                      bgcolor: grey[200],
                      '& .MuiLinearProgress-bar': {
                        bgcolor: getStockLevelColor(item)
                      }
                    }}
                  />
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 0.5,
                  flexShrink: 0
                }}>
                  <IconButton 
                    size="small"
                    onClick={(e) => handleItemClick(e, item.id)}
                    title="Set Total Stock"
                    sx={{
                      p: '3px',
                      bgcolor: 'background.default',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <EditIcon sx={{ fontSize: '1.6vh' }} />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => setDeleteConfirmItem(item.name)}
                    sx={{ 
                      p: '3px',
                      bgcolor: 'background.default',
                      '&:hover': {
                        bgcolor: 'error.lighter'
                      }
                    }}
                  >
                    <DeleteIcon sx={{ fontSize: '1.6vh', color: 'error.main' }} />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Collapse>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleUpdateClick}>Set Total Stock</MenuItem>
      </Menu>

      <Dialog 
        open={updateDialogOpen} 
        onClose={() => {
          setUpdateDialogOpen(false);
          setUpdateAmount('');
          setUpdateNotes('');
          setSelectedItem(null);
          setUpdateType('add');
        }}
      >
        <DialogTitle>Set Total Stock</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Enter the total stock capacity. Usage will be tracked when employees clock out.
            </Typography>
          </Box>
          {selectedItem && (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current total: {inventory.find(item => item.id === selectedItem)?.maxStock || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Current used: {inventory.find(item => item.id === selectedItem)?.currentStock || 0}
              </Typography>
            </>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Total Stock Capacity"
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
            setUpdateType('add');
          }}>Cancel</Button>
          <Button 
            onClick={handleUpdateSubmit}
            variant="contained"
            disabled={!updateAmount || Number(updateAmount) < 0}
          >
            Set Total Stock
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addDialogOpen}
        onClose={() => {
          setAddDialogOpen(false);
          setNewItem({
            name: '',
            currentStock: 0,
            maxStock: 100,
            minStock: 20,
            unit: 'units',
            isDeleted: false
          });
        }}
      >
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Add a new item to track in inventory.
            </Typography>
          </Box>
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
            label="Total Stock Capacity"
            type="number"
            fullWidth
            value={newItem.maxStock}
            onChange={(e) => setNewItem(prev => ({ ...prev, maxStock: Number(e.target.value) }))}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
          <TextField
            margin="dense"
            label="Unit (e.g., bottles, boxes)"
            fullWidth
            value={newItem.unit}
            onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAddDialogOpen(false);
            setNewItem({
              name: '',
              currentStock: 0,
              maxStock: 100,
              minStock: 20,
              unit: 'units',
              isDeleted: false
            });
          }}>Cancel</Button>
          <Button 
            onClick={handleAddSubmit}
            variant="contained"
            disabled={!newItem.name || newItem.maxStock <= 0}
          >
            Add Item
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(deleteConfirmItem)}
        onClose={() => setDeleteConfirmItem(null)}
      >
        <DialogTitle sx={{ fontSize: '1.6vh', pb: 1 }}>
          Delete Item
        </DialogTitle>
        <DialogContent>
          <Typography fontSize="1.4vh">
            Are you sure you want to delete "{deleteConfirmItem}"? This action will take effect when you click "Save to Server".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmItem(null)} size="small">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" size="small">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 