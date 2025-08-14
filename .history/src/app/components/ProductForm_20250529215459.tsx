"use client";
import React from "react";
import { Box, Button, Paper, TextField } from "@mui/material";
// Add all props you'll pass down
const ProductForm = ({
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

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1vh" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0, ".", "Del", "Clr"].map((label, i) => (
          <Button
            key={i}
            variant="contained"
            onClick={() => handleNumpadClick(label.toString())}
            sx={{
              bgcolor: label === "Clr" ? "#2196f3" : "#e0e0e0",
              color: label === "Clr" ? "#fff" : "#000",
              "&:hover": { bgcolor: "#bdbdbd" },
              gridColumn: label === "Clr" ? "span 3" : undefined,
            }}
          >
            {label === "." ? "•" : label}
          </Button>
        ))}
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
