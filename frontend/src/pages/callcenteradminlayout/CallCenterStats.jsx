// pages/CallCenterStats.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCallCenterStats } from "../../store/callCenterStatsSlice";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Grid,
  Button,
  Stack,
  ButtonGroup, // 🆕 استخدمنا ButtonGroup لتجميع الأزرار بشكل أنيق
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { toast } from "react-toastify";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents"; // 🆕 أيقونة لأفضل أداء

// 🆕 مكون بطاقة الإحصائيات الرئيسية
const StatCard = ({ title, value, color, icon }) => (
  <Paper
    sx={{
      p: 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderLeft: `5px solid ${color}`, // شريط لوني لإبراز البطاقة
      minHeight: 100,
      boxShadow: 3,
    }}
  >
    <Box>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight="bold" color={color}>
        {value}
      </Typography>
    </Box>
    <Box color={color} sx={{ fontSize: 40 }}>
      {icon}
    </Box>
  </Paper>
);

export default function CallCenterStats() {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector(
    (state) => state.callCenterStats
  );

  // local UI state
  const [timeframe, setTimeframe] = useState("monthly");
  // 🆕 تم تغيير الحالة لتعكس الترتيب الافتراضي في الجدول
  const [sortedBy, setSortedBy] = useState("monthly");

  useEffect(() => {
    dispatch(fetchCallCenterStats())
      .unwrap()
      .catch((err) => {
        toast.error(err || "فشل في جلب البيانات");
      });
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  // 🔹 حساب الإجماليات
  const totalDaily = useMemo(
    () => stats.reduce((s, it) => s + (it.daily || 0), 0),
    [stats]
  );
  const totalWeekly = useMemo(
    () => stats.reduce((s, it) => s + (it.weekly || 0), 0),
    [stats]
  );
  const totalMonthly = useMemo(
    () => stats.reduce((s, it) => s + (it.monthly || 0), 0),
    [stats]
  );

  // 🔹 تحضير البيانات
  const rows = useMemo(
    () =>
      stats.map((s) => ({
        id: s.userId,
        name: s.name,
        email: s.email,
        daily: s.daily ?? 0,
        weekly: s.weekly ?? 0,
        monthly: s.monthly ?? 0,
      })),
    [stats]
  );

  const chartData = useMemo(() => {
    if (timeframe === "daily")
      return stats.map((s) => ({ name: s.name, قيمة: s.daily || 0 }));
    if (timeframe === "weekly")
      return stats.map((s) => ({ name: s.name, قيمة: s.weekly || 0 }));
    return stats.map((s) => ({ name: s.name, قيمة: s.monthly || 0 }));
  }, [stats, timeframe]);

  // 🔹 إيجاد أفضل أداء (لجميع الفترات)
  const topPerformer = useMemo(() => {
    if (!stats || stats.length === 0) return null;
    // يمكننا عرض أفضل أداء شهريًا كأداء افتراضي لبطاقة الإنجاز
    const key = "monthly";
    const arr = [...stats].sort((a, b) => (b[key] || 0) - (a[key] || 0));
    return arr[0];
  }, [stats]);

  // 🔹 أعمدة DataGrid
  const columns = useMemo(
    () => [
      { field: "name", headerName: "المستخدم", flex: 1, minWidth: 150 },
      { field: "email", headerName: "الإيميل", flex: 1, minWidth: 170 },
      {
        field: "daily",
        headerName: "اليوم",
        width: 100,
        type: "number",
      },
      {
        field: "weekly",
        headerName: "الأسبوع",
        width: 110,
        type: "number",
      },
      {
        field: "monthly",
        headerName: "الشهر",
        width: 110,
        type: "number",
      },
    ],
    []
  );

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3, backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <Typography variant="h4" mb={4} fontWeight="bold" color="#3f51b5">
        لوحة مراقبة أداء موظفي الكول سنتر 📞
      </Typography>

      {/* 1. البطاقات الإحصائية الرئيسية (KPI Cards) */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي اليوم"
            value={totalDaily}
            color="#00bcd4" // Cyan
            icon={<span className="material-icons">today</span>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الأسبوع"
            value={totalWeekly}
            color="#ff9800" // Orange
            icon={<span className="material-icons">calendar_view_week</span>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="إجمالي الشهر"
            value={totalMonthly}
            color="#4caf50" // Green
            icon={<span className="material-icons">calendar_month</span>}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="أفضل أداء (شهريًا)"
            value={
              topPerformer
                ? `${topPerformer.name} (${topPerformer.monthly || 0})`
                : "لا يوجد"
            }
            color="#e91e63" // Pink
            icon={<EmojiEventsIcon />}
          />
        </Grid>
      </Grid>

      {/* 2. قسم الجدول والرسم البياني */}
      <Grid container spacing={3}>
        {/* Left: Table */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: "100%", minHeight: 600, boxShadow: 6 }}>
            <Typography variant="h6" mb={2} color="#3f51b5">
              📈 جدول ترتيب الموظفين
            </Typography>
            <Box sx={{ height: 500, width: "100%" }}>
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(r) => r.id}
                initialState={{
                  sorting: {
                    sortModel: [{ field: "monthly", sort: "desc" }], // ترتيب افتراضي: الشهر، تنازليًا
                  },
                }}
                pageSize={7}
                rowsPerPageOptions={[7, 14]}
                disableSelectionOnClick
                sx={{
                  "& .MuiDataGrid-row": { cursor: "default" },
                  height: "100%",
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Right: Charts */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: "100%", minHeight: 600, boxShadow: 6 }}>
            {/* 3. تنسيق أزرار الفترة الزمنية */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" color="#3f51b5">
                📊 أداء الموظفين -{" "}
                {timeframe === "daily"
                  ? "اليوم"
                  : timeframe === "weekly"
                  ? "الأسبوع"
                  : "الشهر"}
              </Typography>
              <ButtonGroup variant="contained" aria-label="timeframe selection">
                <Button
                  color={timeframe === "daily" ? "primary" : "inherit"}
                  onClick={() => setTimeframe("daily")}
                >
                  اليوم
                </Button>
                <Button
                  color={timeframe === "weekly" ? "primary" : "inherit"}
                  onClick={() => setTimeframe("weekly")}
                >
                  الأسبوع
                </Button>
                <Button
                  color={timeframe === "monthly" ? "primary" : "inherit"}
                  onClick={() => setTimeframe("monthly")}
                >
                  الشهر
                </Button>
              </ButtonGroup>
            </Stack>

            {/* 4. الرسم البياني */}
            <Box sx={{ width: "100%", height: 480 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} أوردر`, "القيمة"]}
                  />
                  <Legend />
                  <Bar
                    dataKey="قيمة"
                    name="عدد الأوردرات"
                    fill="#3f51b5" // لون أساسي موحد للرسم البياني
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
