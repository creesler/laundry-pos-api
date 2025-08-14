import React from "react";

interface ProductFormProps {
  inputValues: Record<string, string>;
  setSelectedField: (field: string) => void;
  selectedField: string;
  handleNumpadClick: (value: string) => void;
  handleSave: () => void;
  editingIndex: number | null;
}

const ProductForm: React.FC<ProductFormProps> = ({
  inputValues,
  setSelectedField,
  selectedField,
  handleNumpadClick,
  handleSave,
  editingIndex,
}) => {
  // ... rest of your component code
};
