import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/authSlice";

const pages = [
  // { name: "Cash", path: "/ownerlayout" },
  // { name: "Delivery", path: "/ownerlayout/delivery" },
  { name: "Items", path: "/ownerlayout/item" },
  { name: "Users", path: "/ownerlayout/users" },
  { name: "Zone", path: "/ownerlayout/zone" },
  { name: "Add Branch", path: "/ownerlayout/add-branch" },
  // { name: "All Products", path: "/ownerlayout/all-products" },
  { name: "Reborts", path: "/ownerlayout/reports" },
];

function OwnerNav() {
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector((state) => state.auth.role);
  console.log(role);
  const handleLogout = () => {
    dispatch(logout()); // مسح التوكن وإعادة الحالة
    navigate("/"); // تحويل المستخدم لصفحة تسجيل الدخول
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: "flex" }}>
            {pages.map((page) => {
              return (
                <NavLink
                  key={page.name}
                  to={page.path}
                  end={page.path === "/ownerlayout"} // هذا يحل مشكلة الـ exact
                  style={({ isActive }) => ({
                    textDecoration: "none",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    backgroundColor: isActive ? "red" : "transparent",
                  })}
                >
                  {page.name}
                </NavLink>
              );
            })}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt={role} src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <Button onClick={handleLogout}>Log out</Button>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default OwnerNav;
