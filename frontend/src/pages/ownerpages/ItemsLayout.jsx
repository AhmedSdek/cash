// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Box, List, ListItemButton, ListItemText, Paper } from "@mui/material";

export default function ItemsLayout() {
  return (
    <Box display="flex" sx={{ height: "calc(100vh - 64px)" }}>
      {/* Sidebar */}
      <Paper
        sx={{
          width: "200px",
          p: 2,
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <List>
          <ListItemButton
            component={NavLink}
            to="/ownerlayout/item"
            end // ✅ مهم جدا عشان ميعملش match على /reports/items
            style={({ isActive }) => ({
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: isActive ? "red" : "transparent",
            })}
          >
            <ListItemText primary="Add Item" />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to="/ownerlayout/item/all-items"
            style={({ isActive }) => ({
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: isActive ? "red" : "transparent",
            })}
          >
            <ListItemText primary="All Items" />
          </ListItemButton>
        </List>
      </Paper>

      {/* Main Content */}
      <Box flex={1} p={2}>
        <Outlet />
      </Box>
    </Box>
  );
}
