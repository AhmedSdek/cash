import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, setUserFromStorage } from "../../store/authSlice.js";
import { useNavigate, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

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

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: "100vh",
  minHeight: "100%",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: { padding: theme.spacing(4) },
}));

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { role, loading, error, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ تحقق من التوكن عند فتح الصفحة
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      dispatch(setUserFromStorage());
    }
    if (role) {
      // توجيه حسب الرول
      switch (role) {
        case "DEVELOPER":
          navigate("/developerlayout", { replace: true });
          break;
        case "OWNER":
          navigate("/ownerlayout", { replace: true });
          break;
        case "ADMIN":
          navigate("/adminlayout", { replace: true });
          break;
        case "CASHIER":
          navigate("/cashierlayout", { replace: true });
          break;
        case "CALL_CENTER_ADMIN":
          navigate("/callcenteradminlayout", { replace: true });
          break;
        case "CALL_CENTER_USER":
          navigate("/callcenteruserlayout", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    } else {
      setCheckingAuth(false);
    }
  }, [role, dispatch, navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(loginUser({ email, password }));

    if (result.payload) {
      switch (result.payload.role) {
        case "DEVELOPER":
          navigate("/developerlayout", { replace: true });
          break;
        case "OWNER":
          navigate("/ownerlayout", { replace: true });
          break;
        case "ADMIN":
          navigate("/adminlayout", { replace: true });
          break;
        case "CASHIER":
          navigate("/cashierlayout", { replace: true });
          break;
        case "CALL_CENTER_ADMIN":
          navigate("/callcenteradminlayout", { replace: true });
          break;
        case "CALL_CENTER_USER":
          navigate("/callcenteruserlayout", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
    }
  };

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
    <Stack sx={{ maxHeight: "100vh" }}>
      <SignInContainer direction="column">
        <Card variant="outlined">
          <Typography
            component="h1"
            variant="h4"
            sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
          >
            تسجيل الدخول
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">البريد الإلكتروني</FormLabel>
              <TextField
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">كلمة المرور</FormLabel>
              <TextField
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="current-password"
                required
                fullWidth
                variant="outlined"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 1 }}
            >
              {loading ? <CircularProgress size={24} /> : "تسجيل الدخول"}
            </Button>

            <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
              نسيت كلمة المرور؟{" "}
              <Link to="/forgot-password" style={{ color: "#1976d2" }}>
                اضغط هنا
              </Link>
            </Typography>
          </Box>
        </Card>
      </SignInContainer>
    </Stack>
  );
}
