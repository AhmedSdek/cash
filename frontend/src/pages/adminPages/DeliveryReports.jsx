import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Snackbar, // ✅ إضافة Snackbar
  Alert, // ✅ إضافة Alert
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchShifts,
  fetchDeliveriesByShift,
  fetchDeliveryReport,
  clearDeliveryPayments, // ✅ استيراد الثانك الجديد
} from "../../store/deliveryReportSlice";

export default function DeliveryReportPage() {
  const dispatch = useDispatch();
  // ✅ إضافة 'settlement' إلى الـ loading
  const { closedShifts, currentShift, deliveries, reports, loading } =
    useSelector((state) => state.deliveryReport);

  const [selectedShift, setSelectedShift] = useState("current");
  const [selectedDelivery, setSelectedDelivery] = useState("");
  const [noShiftMsg, setNoShiftMsg] = useState("");
  const [shiftInfo, setShiftInfo] = useState(null);
  const [openOrdersDialog, setOpenOrdersDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openOrderDetailsDialog, setOpenOrderDetailsDialog] = useState(false);

  // ✅ حالة جديدة للـ Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const reportRef = useRef();

  useEffect(() => {
    dispatch(fetchShifts())
      .unwrap()
      .then((data) => {
        if (!data.currentShift) {
          setNoShiftMsg("⚠️ لا يوجد شيفت مفتوح حالياً");
          setSelectedShift("");
        }
      });
  }, [dispatch]);

  useEffect(() => {
    if (selectedShift) {
      if (selectedShift === "current") {
        setShiftInfo(currentShift);
      } else {
        const shift = closedShifts.find((s) => s._id === selectedShift);
        setShiftInfo(shift || null);
      }

      dispatch(fetchDeliveriesByShift(selectedShift))
        .unwrap()
        .then(() => setNoShiftMsg(""))
        .catch((err) => {
          if (err.message === "الشيفت غير موجود") {
            setNoShiftMsg("⚠️ لا يوجد شيفت مفتوح حالياً");
          } else {
            setNoShiftMsg("⚠️ حدث خطأ أثناء تحميل الدليفري");
          }
        });
    }
  }, [dispatch, selectedShift, currentShift, closedShifts]);

  const handleShiftSelect = (shiftId) => {
    setSelectedShift(shiftId);
    setSelectedDelivery("");
    setNoShiftMsg("");
  };

  const handleDeliverySelect = (deliveryId) => {
    setSelectedDelivery(deliveryId);
    if (deliveryId) {
      dispatch(fetchDeliveryReport({ shiftId: selectedShift, deliveryId }));
    }
  };

  // ✅ دالة إتمام المحاسبة
  const handleClearPayments = () => {
    if (!selectedShift || !selectedDelivery) return;

    dispatch(
      clearDeliveryPayments({
        shiftId: selectedShift,
        deliveryId: selectedDelivery,
      })
    )
      .unwrap()
      .then((data) => {
        setSnackbar({
          open: true,
          message: `✅ تم تسجيل المحاسبة للدليفري ${data.updatedReport.delivery.name} بنجاح.`,
          severity: "success",
        });
        // لا نحتاج لإعادة جلب التقرير يدوياً، تم التحديث في الـ Reducer
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: `❌ فشل المحاسبة: ${error.message || "خطأ غير معروف"}`,
          severity: "error",
        });
      });
  };

  // دالة إغلاق الـ Snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePrint = (contentId) => {
    const printContent = document.getElementById(contentId).innerHTML;
    const win = window.open("", "_blank", "width=800,height=600");
    win.document.write(`
      <html>
        <head>
          <title>تقرير</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            td, th { border: 1px solid #000; padding: 8px; font-size: 16px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const reportKey =
    selectedShift && selectedDelivery
      ? `${selectedShift}-${selectedDelivery}`
      : null;

  const report = reportKey ? reports[reportKey] : null;

  // افتراض وجود حقل 'isSettled' في التقرير
  const isSettled = report?.isSettled || false;

  const cellStyle = {
    border: "1px solid #000",
    padding: "8px",
    textAlign: "center",
    fontSize: "16px",
  };

  const handleReportDoubleClick = () => {
    setOpenOrdersDialog(true);
  };

  const handleOrderDoubleClick = (order) => {
    setSelectedOrder(order);
    setOpenOrderDetailsDialog(true);
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        تقرير الدليفري
      </Typography>

      {loading.shifts && <CircularProgress />}

      <FormControl fullWidth margin="normal">
        <InputLabel id="shift-label">اختار الشيفت</InputLabel>
        <Select
          labelId="shift-label"
          value={selectedShift}
          onChange={(e) => handleShiftSelect(e.target.value)}
        >
          {currentShift && (
            <MenuItem value="current">
              (الشيفت الحالي) {new Date(currentShift.openedAt).toLocaleString()}{" "}
              - الآن
            </MenuItem>
          )}
          {closedShifts.map((shift) => (
            <MenuItem key={shift._id} value={shift._id}>
              {new Date(shift.openedAt).toLocaleString()} -{" "}
              {shift.closedAt
                ? new Date(shift.closedAt).toLocaleString()
                : "جاري"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {noShiftMsg && (
        <Typography color="error" sx={{ mt: 2 }}>
          {noShiftMsg}
        </Typography>
      )}

      {selectedShift &&
        deliveries[selectedShift] &&
        deliveries[selectedShift].length > 0 && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="delivery-label">اختار الدليفري</InputLabel>
            <Select
              labelId="delivery-label"
              value={selectedDelivery}
              onChange={(e) => handleDeliverySelect(e.target.value)}
            >
              {deliveries[selectedShift].map((d) => (
                <MenuItem key={d._id} value={d._id}>
                  {d.name} - {d.phone}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

      {report && shiftInfo && (
        <Box mt={4}>
          {isSettled && (
            <Typography
              color="success.main"
              variant="h6"
              textAlign="center"
              mb={2}
            >
              تمت محاسبة هذا الدليفري في هذا الشيفت ✅
            </Typography>
          )}

          <Box
            id="print-area"
            sx={{
              p: 3,
              mb: 2,
              border: "2px solid #000",
              borderRadius: "8px",
              maxWidth: "500px",
              margin: "auto",
              background: "#fff",
              cursor: "pointer",
            }}
            onDoubleClick={handleReportDoubleClick}
            ref={reportRef}
          >
            <Typography variant="h6" gutterBottom>
              🧾 تقرير الدليفري (اضغط مرتين لعرض الأوردرات)
            </Typography>

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={cellStyle}>اسم الدليفري</td>
                  <td style={cellStyle}>{report.delivery.name}</td>
                </tr>
                <tr>
                  <td style={cellStyle}>رقم التليفون</td>
                  <td style={cellStyle}>{report.delivery.phone}</td>
                </tr>
                <tr>
                  <td style={cellStyle}>عدد الأوردرات</td>
                  <td style={cellStyle}>{report.totalOrders}</td>
                </tr>
                <tr>
                  <td style={cellStyle}>إجمالي المبيعات</td>
                  <td style={cellStyle}>{report.totalAmount} ج.م</td>
                </tr>
                <tr>
                  <td style={cellStyle}>إجمالي رسوم التوصيل</td>
                  <td style={cellStyle}>{report.totalDeliveryFees} ج.م</td>
                </tr>
                <tr>
                  <td style={cellStyle}>الاجمالي</td>
                  <td style={cellStyle}>{report.grandTotal} ج.م</td>
                </tr>
                <tr>
                  <td style={cellStyle}>بداية الشيفت</td>
                  <td style={cellStyle}>
                    {new Date(shiftInfo.openedAt).toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td style={cellStyle}>نهاية الشيفت</td>
                  <td style={cellStyle}>
                    {shiftInfo.closedAt
                      ? new Date(shiftInfo.closedAt).toLocaleString()
                      : "جاري"}
                  </td>
                </tr>
              </tbody>
            </table>
          </Box>

          <Box
            sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}
          >
            {/* ✅ الزر الجديد للمحاسبة */}
            <Button
              variant="contained"
              color="success"
              onClick={handleClearPayments}
              // تعطيل الزر في حالتين: أثناء التحميل، أو إذا تمت المحاسبة مسبقاً
              disabled={loading.settlement || isSettled}
            >
              {loading.settlement ? (
                <CircularProgress size={24} color="inherit" />
              ) : isSettled ? (
                "تمت المحاسبة ✅"
              ) : (
                "إتمام المحاسبة"
              )}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handlePrint("print-area")}
            >
              طباعة التقرير
            </Button>
          </Box>
        </Box>
      )}

      {/* Dialog للأوردرات */}
      <Dialog
        open={openOrdersDialog}
        onClose={() => setOpenOrdersDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>الأوردرات الخاصة بالدليفري</DialogTitle>
        <DialogContent dividers>
          {report && report.orders && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>رقم الأوردر</TableCell>
                  <TableCell>اسم العميل</TableCell>
                  <TableCell>رقم الهاتف</TableCell>
                  <TableCell>العنوان</TableCell>
                  <TableCell>إجمالي المبلغ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.orders.map((o) => (
                  <TableRow
                    key={o.orderId}
                    onDoubleClick={() => handleOrderDoubleClick(o)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{o.orderNumber}</TableCell>
                    <TableCell>{o.customerName}</TableCell>
                    <TableCell>{o.customerPhone}</TableCell>
                    <TableCell>{o.customerAddress}</TableCell>
                    <TableCell>{o.grandTotal} ج.م</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handlePrint("orders-dialog-print")}
            color="primary"
          >
            طباعة الأوردرات
          </Button>
          <Button onClick={() => setOpenOrdersDialog(false)} color="primary">
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog لتفاصيل الأوردر */}
      <Dialog
        open={openOrderDetailsDialog}
        onClose={() => setOpenOrderDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          تفاصيل الأوردر رقم {selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && selectedOrder.items && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>اسم الصنف</TableCell>
                  <TableCell>الكمية</TableCell>
                  <TableCell>سعر الوحدة</TableCell>
                  <TableCell>الإجمالي</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedOrder.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.price} ج.م</TableCell>
                    <TableCell>{item.total} ج.م</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handlePrint("order-details-dialog-print")}
            color="primary"
          >
            طباعة تفاصيل الأوردر
          </Button>
          <Button
            onClick={() => setOpenOrderDetailsDialog(false)}
            color="primary"
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* محتوى مخفي للطباعة */}
      {/* ... (نفس محتوى الطباعة الموجود لديك) ... */}
      {report && (
        <>
          <Box id="orders-dialog-print" sx={{ display: "none" }}>
            <Typography variant="h6">الأوردرات الخاصة بالدليفري</Typography>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={cellStyle}>رقم الأوردر</th>
                  <th style={cellStyle}>اسم العميل</th>
                  <th style={cellStyle}>رقم الهاتف</th>
                  <th style={cellStyle}>العنوان</th>
                  <th style={cellStyle}>إجمالي المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {report.orders.map((o) => (
                  <tr key={o.orderId}>
                    <td style={cellStyle}>{o.orderNumber}</td>
                    <td style={cellStyle}>{o.customerName}</td>
                    <td style={cellStyle}>{o.customerPhone}</td>
                    <td style={cellStyle}>{o.customerAddress}</td>
                    <td style={cellStyle}>{o.grandTotal} ج.م</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Box id="order-details-dialog-print" sx={{ display: "none" }}>
            <Typography variant="h6">
              تفاصيل الأوردر رقم {selectedOrder?.orderNumber}
            </Typography>
            {selectedOrder && (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={cellStyle}>اسم الصنف</th>
                    <th style={cellStyle}>الكمية</th>
                    <th style={cellStyle}>سعر الوحدة</th>
                    <th style={cellStyle}>الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td style={cellStyle}>{item.name}</td>
                      <td style={cellStyle}>{item.quantity}</td>
                      <td style={cellStyle}>{item.price} ج.م</td>
                      <td style={cellStyle}>{item.total} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Box>
        </>
      )}

      {/* ✅ مكون الـ Snackbar للتنبيهات */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
