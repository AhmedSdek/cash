import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid } from "@mui/x-data-grid";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDeliveryDashboard,
  fetchUnassignedDeliveryOrders,
  returnDelivery,
  assignOrdersToDelivery,
  fetchAssignedOrders,
  unassignMultipleOrders,
} from "../../store/deliveryOrdersSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

// ✅ كومبوننت لحساب وعرض العداد للدليفري المشغول
function BusyDeliveryItem({ delivery, onReturn, returnLoading }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!delivery.busySince) return;

    const start = new Date(delivery.busySince).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diffSeconds = Math.floor((now - start) / 1000);
      setElapsedSeconds(diffSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [delivery.busySince]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const isOver30 = elapsedSeconds >= 1800; // أكتر من 30 دقيقة

  return (
    <Box
      p={1}
      borderBottom="1px solid #eee"
      sx={{
        bgcolor: isOver30 ? "#ffcccc" : "white",
        borderRadius: 1,
      }}
    >
      <Typography>{delivery.name}</Typography>
      <Typography variant="body2" color="text.secondary">
        {minutes}:{seconds.toString().padStart(2, "0")} دقيقة
      </Typography>

      <Button
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
        disabled={returnLoading}
        onClick={onReturn}
      >
        رجوع
      </Button>
    </Box>
  );
}

// ✅ كومبوننت للأوردرات اللي لسه مترفعتش (unassigned)
function UnassignedOrderItem({ order, isSelected, onToggle, onEdit }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!order.createdAt) return;

    const start = new Date(order.createdAt).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diffSeconds = Math.floor((now - start) / 1000);
      setElapsedSeconds(diffSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [order.createdAt]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const isOver20 = elapsedSeconds >= 1200; // أكتر من 20 دقيقة

  return (
    <Box
      key={order._id}
      p={1}
      mb={1}
      border="1px solid #ddd"
      bgcolor={isSelected ? "#e0f7fa" : isOver20 ? "#ffe0e0" : "white"}
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <Box flex={1} onClick={onToggle}>
        <Typography>الأوردر: {order.orderNumber}</Typography>
        <Typography>العميل: {order.customerId?.name || "-"}</Typography>
        <Typography>اجمالي الاصناف: {order.totalPrice} ج.م</Typography>
        <Typography>الإجمالي بالدليفري: {order.grandTotal} ج.م</Typography>{" "}
        <Typography variant="body2" color="text.secondary">
          {minutes}:{seconds.toString().padStart(2, "0")} دقيقة من إنشاء الأوردر
        </Typography>
      </Box>

      <IconButton color="primary" onClick={onEdit}>
        <EditIcon />
      </IconButton>
    </Box>
  );
}

export default function DeliveryOrders() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    unassignedOrders,
    availableDeliveries,
    busyDeliveries,
    assignedOrders,
    loading,
    returnLoading,
    assignLoading,
    unassignLoading,
  } = useSelector((state) => state.delivery); // console.log(assignedOrders); // console.log(unassignedOrders); // console.log(unassignedOrders);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAssignedOrders, setSelectedAssignedOrders] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    dispatch(fetchDeliveryDashboard());
    dispatch(fetchUnassignedDeliveryOrders());
  }, [dispatch]);

  const toggleSelectOrder = (order) => {
    if (selectedOrders.some((o) => o._id === order._id)) {
      setSelectedOrders(selectedOrders.filter((o) => o._id !== order._id));
    } else {
      setSelectedOrders([...selectedOrders, order]);
    }
  };

  const handleAssignOrders = async () => {
    if (selectedOrders.length === 0 || !selectedDelivery) return;

    dispatch(
      assignOrdersToDelivery({
        orderIds: selectedOrders.map((o) => o._id),
        deliveryId: selectedDelivery._id,
      })
    )
      .unwrap()
      .then(() => {
        toast.success(
          `تم رفع ${selectedOrders.length} أوردر على ${selectedDelivery.name}`
        );
        setSelectedOrders([]);
        setSelectedDelivery(null);
        dispatch(fetchDeliveryDashboard());
        dispatch(fetchUnassignedDeliveryOrders());
      })
      .catch(() => {
        toast.error("حدث خطأ أثناء رفع الأوردرات");
      });
  };

  const handleReturnDelivery = (deliveryId, deliveryName) => {
    dispatch(returnDelivery(deliveryId))
      .unwrap()
      .then(() => {
        // toast.success(`${deliveryName} رجع متاح`);
      })
      .catch(() => {
        toast.error("خطأ أثناء تحديث حالة الدليفري");
      });
  };

  const handleOpenDialog = () => {
    dispatch(fetchAssignedOrders());
    setSelectedAssignedOrders([]);
    setOpenDialog(true);
  };

  const handleUnassignMultiple = () => {
    if (selectedAssignedOrders.length === 0) return;

    dispatch(unassignMultipleOrders(selectedAssignedOrders))
      .unwrap()
      .then(() => {
        toast.success("تم إلغاء رفع الأوردرات المختارة");
        setSelectedAssignedOrders([]);
        dispatch(fetchAssignedOrders());
        dispatch(fetchUnassignedDeliveryOrders());
      })
      .catch(() => {
        toast.error("خطأ أثناء إلغاء رفع الأوردرات");
      });
  };

  const columns = [
    { field: "orderNumber", headerName: "رقم الأوردر", width: 130 },
    { field: "customerName", headerName: "العميل", width: 160 },
    { field: "customerAddress", headerName: "العنوان", width: 200 },
    { field: "deliveryName", headerName: "الدليفري", width: 160 },
    { field: "totalPrice", headerName: "الإجمالي", width: 120 },
  ];

  const rows = assignedOrders.map((order) => ({
    id: order._id,
    orderNumber: order.orderNumber,
    customerName: order.customerId?.name || "-",
    customerAddress: order.customerId?.address || "-",
    deliveryName: order.deliveryId?.name || "-",
    totalPrice: order.totalPrice,
    fullData: order,
  }));

  return (
    <Box
      display="flex"
      gap={2}
      p={2}
      sx={{ boxSizing: "border-box" }}
      height="calc(100vh - 64px)"
    >
      {/* الشمال: الدليفريز */}
      <Stack sx={{ width: "30%", height: "100%" }} spacing={2}>
        {/* Available Deliveries */}
        <Paper sx={{ p: 2, flex: 1, overflow: "auto" }}>
          <Typography variant="h6">دليفريه متاح</Typography>
          <Divider sx={{ my: 1 }} />
          {availableDeliveries.map((d) => (
            <Box
              key={d._id}
              p={1}
              borderBottom="1px solid #eee"
              bgcolor={selectedDelivery?._id === d._id ? "#ffe0e0" : "white"}
              sx={{ cursor: "pointer" }}
              onClick={() =>
                setSelectedDelivery(selectedDelivery?._id === d._id ? null : d)
              }
            >
              <Typography>{d.name}</Typography>
            </Box>
          ))}
        </Paper>
        {/* Busy Deliveries */}
        <Paper sx={{ p: 2, flex: 1, overflow: "auto" }}>
          <Typography variant="h6">دليفريه مشغول</Typography>
          <Divider sx={{ my: 1 }} />
          {busyDeliveries.map((d) => (
            <BusyDeliveryItem
              key={d._id}
              delivery={d}
              onReturn={() => handleReturnDelivery(d._id, d.name)}
              returnLoading={returnLoading}
            />
          ))}
        </Paper>
      </Stack>
      {/* النص: الأوردرات بدون دليفري */}
      <Paper sx={{ flex: 1, p: 2, overflow: "auto" }}>
        <Typography variant="h6">الأوردرات دليفري غير مرفوعة</Typography>
        <Divider sx={{ my: 1 }} />
        {loading ? (
          <Typography>جارٍ التحميل...</Typography>
        ) : unassignedOrders.length === 0 ? (
          <Typography>لا يوجد أوردرات</Typography>
        ) : (
          [...unassignedOrders].reverse().map((order) => {
            const isSelected = selectedOrders.some((o) => o._id === order._id);
            return (
              <UnassignedOrderItem
                key={order._id}
                order={order}
                isSelected={isSelected}
                onToggle={() => toggleSelectOrder(order)}
                onEdit={() => {
                  sessionStorage.setItem("editOrder", JSON.stringify(order));
                  console.log(order); // ✅ التوجيه حسب الـ role
                  let redirectPath = "/adminlayout/delivery/order";
                  if (user?.role === "CASHIER") {
                    redirectPath = "/cashierlayout/delivery/order";
                  } else if (user?.role === "ADMIN") {
                    redirectPath = "/adminlayout/delivery/order";
                  }
                  navigate(redirectPath);
                }}
              />
            );
          })
        )}
      </Paper>
      {/* اليمين: الأزرار */}
      <Stack sx={{ width: "200px", gap: 2 }}>
        <Button
          variant="contained"
          disabled={
            selectedOrders.length === 0 || !selectedDelivery || assignLoading
          }
          onClick={handleAssignOrders}
        >
          رفع الأوردرات
        </Button>

        <Button variant="outlined" color="secondary" onClick={handleOpenDialog}>
          عرض الأوردرات المرفوعة
        </Button>
      </Stack>
      {/* الدايلوج: جدول الأوردرات المرفوعة */}
      <Dialog
        maxWidth="md"
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
      >
        <DialogTitle>الأوردرات المرفوعة</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ height: 400, width: "100%" }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSize={5}
              onRowDoubleClick={(params) => {
                setOrderDetails(params.row.fullData);
              }}
              checkboxSelection
              onRowSelectionModelChange={(ids) =>
                setSelectedAssignedOrders([...ids.ids])
              }
              disableRowSelectionOnClick
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>إغلاق</Button>

          <Button
            variant="contained"
            color="error"
            disabled={selectedAssignedOrders.length === 0 || unassignLoading}
            onClick={handleUnassignMultiple}
          >
            إلغاء رفع المختارة
          </Button>
        </DialogActions>
      </Dialog>
      {/* دايلوج تفاصيل الأوردر */}
      <Dialog
        open={!!orderDetails}
        onClose={() => setOrderDetails(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>تفاصيل الأوردر #{orderDetails?.orderNumber}</DialogTitle>

        <DialogContent dividers>
          <Typography>العميل: {orderDetails?.customerId?.name}</Typography>

          <Typography>العنوان: {orderDetails?.customerId?.address}</Typography>
          <Typography>الدليفري: {orderDetails?.deliveryId?.name}</Typography>

          <Typography sx={{ mt: 2 }} variant="h6">
            الأصناف:
          </Typography>

          {orderDetails?.items?.map((item, idx) => (
            <Box key={idx} p={1} borderBottom="1px solid #eee">
              <Typography>
                {item.name} - {item.quantity} × {item.price} = {item.total} ج.م
              </Typography>
            </Box>
          ))}

          <Typography>
            اجمالي الاصناف: {orderDetails?.totalPrice} ج.م
          </Typography>

          <Typography sx={{ mt: 2 }} variant="h6">
            الإجمالي بالدليفري: {orderDetails?.grandTotal} ج.م
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOrderDetails(null)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
