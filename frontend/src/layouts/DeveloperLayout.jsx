import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setUserFromStorage } from "../store/authSlice"; // ✅ مهم
import { Box, CircularProgress } from "@mui/material";
import DeveloperNav from "../components/navbars/DeveloperNav";

function DeveloperLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const role = useSelector((state) => state.auth.role);
  const token = localStorage.getItem("token");
  const [checkingAuth, setCheckingAuth] = useState(true); // ✅ حالة التشييك

  useEffect(() => {
    if (token && !role) {
      // لو فيه توكن لكن الرول مش موجود في الريدكس
      dispatch(setUserFromStorage());
    } else if (!token || role !== "DEVELOPER") {
      navigate("/", { replace: true });
    } else {
      setCheckingAuth(false); // ✅ خلص التشييك
    }
  }, [token, role, navigate, dispatch]);

  if (checkingAuth) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <>
      <DeveloperNav />
      <Outlet />
    </>
  );
}

export default DeveloperLayout;
