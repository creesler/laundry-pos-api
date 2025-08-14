import { useState } from 'react';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleAddClick = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const handleDeleteConfirm = async () => {
    if (selectedItem) {
      try {
        // TODO: Implement API call to delete item
        setItems(items.filter(item => item.id !== selectedItem.id));
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const handleSave = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      if (selectedItem) {
        // TODO: Implement API call to update item
        const updatedItem = { ...item, id: selectedItem.id };
        setItems(items.map(i => i.id === selectedItem.id ? updatedItem : i));
      } else {
        // TODO: Implement API call to create item
        const newItem = { ...item, id: Date.now().toString() };
        setItems([...items, newItem]);
      }
      setIsDialogOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  return {
    items,
    selectedItem,
    isDialogOpen,
    isDeleteDialogOpen,
    handleAddClick,
    handleEditClick,
    handleDeleteClick,
    handleDialogClose,
    handleDeleteDialogClose,
    handleDeleteConfirm,
    handleSave,
  };
} 