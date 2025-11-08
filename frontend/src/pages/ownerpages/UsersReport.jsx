import React, { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  TextField,
  Stack,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersReport } from "../../store/reportSlice";
import { fetchBranches } from "../../store/branchSlice";
import { fetchUsers } from "../../store/usersSlice";

const UsersReportPage = () => {
  const dispatch = useDispatch();

  const { branches } = useSelector((state) => state.branches);
  const { users } = useSelector((state) => state.users);
  const {
    users: reportUsers,
    loading,
    error,
  } = useSelector((state) => state.reports);

  console.log(reportUsers);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedUser, setSelectedUser] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isFetched, setIsFetched] = useState(false); // ✅ نضيف ده

  useEffect(() => {
    dispatch(fetchBranches());
    dispatch(fetchUsers());
  }, [dispatch]);

  const loadReports = () => {
    const filters = {};
    if (selectedBranch !== "all") filters.branchId = selectedBranch;
    if (selectedUser) filters.userId = selectedUser;
    if (fromDate) filters.from = fromDate;
    if (toDate) filters.to = toDate;

    dispatch(fetchUsersReport(filters));
    setIsFetched(true); // ✅ اول ما اضغط تحديث اعتبرني جبت داتا
  };

  const rows = reportUsers.map((u, idx) => {
    const typeMap = {};
    (u.types || []).forEach((t) => {
      typeMap[t.type] = {
        orders: t.totalOrders,
        sales: t.totalSales,
      };
    });

    return {
      id: u.userId || idx,
      name: u.name,
      role: u.role,
      totalOrders: u.totalOrders,
      totalSales: u.totalSales,
      deliveryOrders: typeMap["DELIVERY"]?.orders || 0,
      deliverySales: typeMap["DELIVERY"]?.sales || 0,
      takeawayOrders: typeMap["TAKEAWAY"]?.orders || 0,
      takeawaySales: typeMap["TAKEAWAY"]?.sales || 0,
    };
  });

  const columns = [
    { field: "name", headerName: "👤 المستخدم", flex: 1 },
    { field: "role", headerName: "👤 Role", flex: 1 },
    { field: "deliveryOrders", headerName: "🚚 دليفري أوردرات", flex: 1 },
    { field: "deliverySales", headerName: "🚚 دليفري مبيعات", flex: 1 },
    { field: "takeawayOrders", headerName: "🥡 تيكاوي أوردرات", flex: 1 },
    { field: "takeawaySales", headerName: "🥡 تيكاوي مبيعات", flex: 1 },
    { field: "totalOrders", headerName: "📦 إجمالي الأوردرات", flex: 1 },
    { field: "totalSales", headerName: "💰 إجمالي المبيعات", flex: 1 },
  ];

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        📊 تقارير المستخدمين حسب الفروع
      </Typography>

      {/* اختيار الفترة */}
      <Stack direction="row" spacing={2} mt={2} mb={2}>
        <TextField
          label="من تاريخ"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          fullWidth
        />
        <TextField
          label="إلى تاريخ"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          fullWidth
        />
        {/* اختيار الفرع */}
        <FormControl fullWidth margin="normal">
          <InputLabel>اختر الفرع</InputLabel>
          <Select
            value={selectedBranch}
            onChange={(e) => {
              setSelectedBranch(e.target.value);
              setSelectedUser("");
            }}
          >
            <MenuItem value="all">كل الفروع</MenuItem>
            {branches.map((b) => (
              <MenuItem key={b._id} value={b._id}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* اختيار اليوزر */}
        <FormControl fullWidth margin="normal">
          <InputLabel>اختر المستخدم</InputLabel>
          <Select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <MenuItem value="">الكل</MenuItem>
            {users
              .filter(
                (u) => selectedBranch === "all" || u.branchId === selectedBranch
              )
              .map((u) => (
                <MenuItem key={u._id} value={u._id}>
                  {u.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Stack>

      {/* زرار تحديث */}
      <Button
        variant="contained"
        color="primary"
        onClick={loadReports}
        sx={{ mt: 2 }}
      >
        تحديث التقارير
      </Button>

      {/* عرض النتائج */}
      <Box mt={3} sx={{ height: 280, width: "100%" }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : rows.length > 0 ? (
          <DataGrid
            rows={rows}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 5 } },
            }}
            pageSizeOptions={[5, 10, 20]}
          />
        ) : isFetched ? ( // ✅ بعد ما دوست تحديث ولقيت مفيش داتا
          <Typography>
            ⚠️ لا يوجد بيانات في الفترة أو الاختيارات المحددة
          </Typography>
        ) : (
          <Typography>اختر فرع/مستخدم ثم اضغط تحديث لعرض البيانات</Typography>
        )}
      </Box>
    </Box>
  );
};

export default UsersReportPage;
