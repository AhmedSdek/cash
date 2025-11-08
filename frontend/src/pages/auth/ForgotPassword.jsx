// src/pages/auth/ForgotPassword.jsx
import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Stack,
  Card as MuiCard,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: { maxWidth: "450px" },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
}));

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/forgot-password",
        { email }
      );
      setMessage(response.data.message || "Check your email for reset link");
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong, try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack
      sx={{
        height: "100vh",
        p: 2,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card variant="outlined">
        <Typography
          component="h1"
          variant="h5"
          sx={{ width: "100%", textAlign: "center" }}
        >
          Forgot Password
        </Typography>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
        {message && (
          <Typography color="primary" variant="body2">
            {message}
          </Typography>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <FormControl>
            <FormLabel htmlFor="email">Enter your email</FormLabel>
            <TextField
              id="email"
              type="email"
              name="email"
              required
              fullWidth
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Send Reset Link"}
          </Button>
        </Box>
      </Card>
    </Stack>
  );
};

export default ForgotPassword;
