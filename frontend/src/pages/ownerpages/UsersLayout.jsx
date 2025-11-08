// src/layouts/AdminLayout.jsx
import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Box, List, ListItemButton, ListItemText, Paper } from "@mui/material";

export default function UsersLayout() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "OWNER"; // أو أي default role

  // نحدد الـ base path حسب الرول
  const basePath =
    role === "ADMIN"
      ? "/adminlayout"
      : role === "CALL_CENTER_ADMIN"
      ? "/callcenteradminlayout"
      : "/ownerlayout";

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
            to={`${basePath}/users`}
            end
            style={({ isActive }) => ({
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: isActive ? "red" : "transparent",
            })}
          >
            <ListItemText primary="Add User" />
          </ListItemButton>

          <ListItemButton
            component={NavLink}
            to={`${basePath}/users/all-users`}
            style={({ isActive }) => ({
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              backgroundColor: isActive ? "red" : "transparent",
            })}
          >
            <ListItemText primary="All Users" />
          </ListItemButton>
        </List>
      </Paper>

      {/* Main Content */}
      <Box flex={1}>
        <Outlet />
      </Box>
    </Box>
  );
}
