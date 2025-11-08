import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import img from "/undraw_page-not-found_6wni.svg";
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #64b5f6 100%)",
        color: "white",
        textAlign: "center",
        px: 2,
      }}
    >
      <Box
        component="img"
        src={img}
        alt="Not Found Illustration"
        sx={{
          width: 300,
          maxWidth: "80%",
          mb: 3,
          filter: "drop-shadow(0px 3px 10px rgba(0,0,0,0.2))",
        }}
      />

      <ErrorOutlineIcon sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h2" sx={{ fontWeight: "bold" }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ mb: 2 }}>
        الصفحة غير موجودة 😢
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, maxWidth: 400 }}>
        يبدو أنك دخلت على رابط غير صحيح أو الصفحة تم نقلها إلى مكان آخر.
      </Typography>
      <Button
        variant="contained"
        color="inherit"
        onClick={() => navigate("/")}
        sx={{
          color: "#1976d2",
          fontWeight: "bold",
          px: 4,
          py: 1,
          borderRadius: 3,
          backgroundColor: "white",
          "&:hover": { backgroundColor: "#e3f2fd" },
        }}
      >
        الرجوع إلى الصفحة الرئيسية
      </Button>
    </Box>
  );
}
