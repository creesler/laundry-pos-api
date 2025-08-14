"use client";
import React from "react";
import { Box, Button, Paper, TextField } from "@mui/material";

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
  const inputFields = Object.keys(inputValues);

  return (
    <Paper sx={{ p: "2vh", display: "flex", flexDirection: "column", gap: "2vh" }}>
      {/* Input Fields */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5vh" }}>
        {inputFields.map((label) => (
          <TextField
            key={label}
            size="small"
            placeholder={label}
            value={inputValues[label]}
            onClick={() => setSelectedField(label)}
            inputProps={{
              style: { fontSize: "1.8vh" },
              readOnly: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "4vh",
                borderRadius: "6px",
                bgcolor: selectedField === label ? "#e8f0fe" : "transparent",
                "& fieldset": {
                  borderColor: selectedField === label ? "#2196f3" : "#e5e7eb",
                },
              },
            }}
          />
        ))}
      </Box>

      {/* Numpad */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1vh" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            variant="contained"
            onClick={() => handleNumpadClick(num.toString())}
            sx={{
              bgcolor: "#e0e0e0",
              color: "black",
              "&:hover": { bgcolor: "#bdbdbd" },
            }}
          >
            {num}
          </Button>
        ))}

        <Button
          variant="contained"
          onClick={() => handleNumpadClick("0")}
          sx={{
            bgcolor: "#4caf50",
            color: "white",
            "&:hover": { bgcolor: "#388e3c" },
          }}
        >
          0
        </Button>

        <Button
          variant="contained"
          onClick={() => handleNumpadClick(".")}
          sx={{
            bgcolor: "#fdd835",
            color: "black",
            "&:hover": { bgcolor: "#fbc02d" },
          }}
        >
          •
        </Button>

        <Button
          variant="contained"
          onClick={() => handleNumpadClick("Del")}
          sx={{
            bgcolor: "#f44336",
            color: "white",
            "&:hover": { bgcolor: "#d32f2f" },
          }}
        >
          Del
        </Button>

        <Button
          variant="contained"
          onClick={() => handleNumpadClick("Clr")}
          sx={{
            bgcolor: "#2196f3",
            color: "white",
            "&:hover": { bgcolor: "#1976d2" },
          }}
        >
          Clr
        </Button>

        {/* Save / Update Button */}
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            gridColumn: "span 3",
            bgcolor: "#1e88e5",
            color: "white",
            "&:hover": { bgcolor: "#1565c0" },
          }}
        >
          {editingIndex !== null ? "Update" : "Save"}
        </Button>
      </Box>
    </Paper>
  );
};

export default ProductForm;
