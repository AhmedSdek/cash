import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { setUserFromStorage } from "../store/authSlice";
import { Box, CircularProgress } from "@mui/material";
import CallCenterAdminNav from "../components/navbars/CallCenterAdminNav";

const CallCenterAdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const role = useSelector((state) => state.auth.role);
  const token = localStorage.getItem("token");
  const [checkingAuth, setCheckingAuth] = useState(true); // ✅ حالة التشييك

  useEffect(() => {
    if (token && !role) {
      // لو فيه توكن لكن الرول مش موجود في الريدكس
      dispatch(setUserFromStorage());
    } else if (!token || role !== "CALL_CENTER_ADMIN") {
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
      <CallCenterAdminNav />
      <Outlet />
    </>
  );
};

export default CallCenterAdminLayout;
