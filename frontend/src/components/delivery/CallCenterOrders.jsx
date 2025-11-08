import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchBranches } from "../../store/branchSlice";
import { fetchUnassignedDeliveryOrders } from "../../store/deliveryOrdersSlice";

export default function CallCenterOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const branches = useSelector((state) => state.branches.branches);
  const { unassignedOrders, loading } = useSelector((state) => state.delivery);
  // console.log(unassignedOrders);
  const role = useSelector((state) => state.auth.role);

  const [selectedBranch, setSelectedBranch] = useState("all");
  const [now, setNow] = useState(Date.now());
  const [selectedOrder, setSelectedOrder] = useState(null);
  // console.log(selectedOrder);

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchUnassignedDeliveryOrders(
        selectedBranch === "all" ? "" : selectedBranch
      )
    )
      .unwrap()
      .catch(() => toast.error("حدث خطأ أثناء جلب الأوردرات"));
  }, [dispatch, selectedBranch]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeSince = (dateString) => {
    const diffMs = now - new Date(dateString).getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return `منذ ${diffSeconds} ثانية`;
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  const handleEditClick = (order) => {
    sessionStorage.setItem("editOrder", JSON.stringify(order));

    // 👇 جلب بيانات اليوزر

    // 👇 تحديد المسار بناءً على الدور
    let navigatePath = "/callcenteradminlayout/delivery/order";
    if (role === "CALL_CENTER_USER") {
      navigatePath = "/callcenteruserlayout/delivery/order";
    }

    navigate(navigatePath);
  };

  const columns = [
    { field: "orderNumber", headerName: "رقم الأوردر", width: 80 },
    {
      field: "customerName",
      headerName: "العميل",
      width: 160,
      renderCell: (params) => params.row.customerId?.name,
    },
    {
      field: "customerAddress",
      headerName: "العنوان",
      width: 160,
      renderCell: (params) => params.row.customerId?.address,
    },
    {
      field: "customerPhone1",
      headerName: "Phone1",
      width: 160,
      renderCell: (params) => params.row.customerId?.phone1,
    },
    {
      field: "branchName",
      headerName: "الفرع",
      width: 160,
      renderCell: (params) => params.row.branchId?.name,
    },
    {
      field: "createdByName",
      headerName: "اليوزر",
      width: 160,
      renderCell: (params) => params.row.createdBy?.name,
    },
    { field: "grandTotal", headerName: "الإجمالي", width: 130 },
    {
      field: "elapsedTime",
      headerName: "بقاله قد إيه",
      width: 160,
      renderCell: (params) => timeSince(params.row.createdAt),
    },
    {
      field: "actions",
      headerName: "تعديل",
      width: 100,
      renderCell: (params) => (
        <IconButton color="primary" onClick={() => handleEditClick(params.row)}>
          <EditIcon />
        </IconButton>
      ),
    },
  ];

  const rows = unassignedOrders.map((order) => ({
    ...order,
    id: order._id, // ضروري عشان الـ DataGrid يحتاج id
  }));

  const handleRowDoubleClick = (params) => {
    setSelectedOrder(params.row);
  };

  const handleCloseDialog = () => {
    setSelectedOrder(null);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        أوردرات الكول سنتر
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>اختر الفرع</InputLabel>
          <Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            label="اختر الفرع"
          >
            <MenuItem value="all">كل الفروع</MenuItem>
            {branches.map((branch) => (
              <MenuItem key={branch._id} value={branch._id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">الأوردرات الدليفري غير المرفوعة</Typography>
        <Divider sx={{ my: 1 }} />
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Typography>لا يوجد أوردرات</Typography>
        ) : (
          <Box sx={{ height: 500 }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={7}
              disableRowSelectionOnClick
              onRowDoubleClick={handleRowDoubleClick}
            />
          </Box>
        )}
      </Paper>

      {/* ✅ Dialog تفاصيل الأوردر */}
      <Dialog
        open={Boolean(selectedOrder)}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        {selectedOrder && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              الأوردر رقم {selectedOrder.orderNumber}
              <Typography variant="subtitle1">
                العميل: {selectedOrder.customerId?.name}
              </Typography>
              <Typography variant="subtitle1">
                رقم الهاتف: {selectedOrder.customerId?.phone1}
              </Typography>
              <Typography variant="subtitle1">
                العنوان: {selectedOrder.customerId?.address}
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>الصنف</TableCell>
                    <TableCell>الكمية</TableCell>
                    <TableCell>السعر</TableCell>
                    <TableCell>الإجمالي</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.productId?.name || "-"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.price} ج.م</TableCell>
                      <TableCell>{item.price * item.quantity} ج.م</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                p: "5px 20px",
              }}
            >
              <Typography variant="subtitle1">
                المجموع قبل الدليفري:
                {selectedOrder.totalPrice} ج.م
              </Typography>
              <Typography variant="subtitle1">
                مصاريف الدليفري: {selectedOrder.deliveryFee} ج.م
              </Typography>
              <Typography variant="h6" mt={1}>
                الإجمالي الكلي: {selectedOrder.grandTotal} ج.م
              </Typography>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
