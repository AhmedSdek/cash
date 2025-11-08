// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Box, List, ListItemButton, ListItemText, Paper } from "@mui/material";

export default function ShiftLayout() {
  return (
    <Box display="flex" flexDirection="column">
      {/* Sidebar */}
      <Paper
        sx={{
          width: "100%",
          p: 2,
          display: "flex",
          flexDirection: "row",
          height: "100px",
          boxSizing: "border-box",
        }}>
        <List sx={{ display: "flex" }}>
          <ListItemButton
            style={({ isActive }) => ({
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: isActive ? "red" : "transparent",
            })}
            component={NavLink}
            to="/adminlayout/shift/current">
            <ListItemText primary="current" />
          </ListItemButton>

          <ListItemButton
            style={({ isActive }) => ({
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: isActive ? "red" : "transparent",
            })}
            component={NavLink}
            to="/adminlayout/shift/all">
            <ListItemText primary="All Shifts" />
          </ListItemButton>

          <ListItemButton
            style={({ isActive }) => ({
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: isActive ? "red" : "transparent",
            })}
            component={NavLink}
            to="/adminlayout/shift/delivery-reports">
            <ListItemText primary="Delivery Reports" />
          </ListItemButton>
          <ListItemButton
            style={({ isActive }) => ({
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: isActive ? "red" : "transparent",
            })}
            component={NavLink}
            to="/adminlayout/shift/orders">
            <ListItemText primary="order list" />
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
