import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllShifts, fetchShiftReport } from "../../store/shiftSlice";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Grid,
  Alert,
  // 🆕 المكونات الجديدة المطلوبة لفتح التفاصيل
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";

export default function AllShifts() {
  const dispatch = useDispatch();
  const { allShifts, report, loading, error } = useSelector(
    (state) => state.shift
  );

  const [selectedShiftId, setSelectedShiftId] = useState("");
  // 🆕 1. إضافة حالة (State) لتخزين تفاصيل الخزنة المحددة
  const [selectedCash, setSelectedCash] = useState(null);

  // 🔹 دوال التنسيق الموحدة
  const formatCurrency = (value) => Number(value || 0).toFixed(2);
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : "غير محدد";
  };

  useEffect(() => {
    dispatch(fetchAllShifts());
  }, [dispatch]);

  useEffect(() => {
    if (selectedShiftId) {
      dispatch(fetchShiftReport(selectedShiftId));
    }
  }, [selectedShiftId, dispatch]);

  const handleShiftChange = (e) => {
    setSelectedShiftId(e.target.value);
  };

  const selectedShiftDetails = allShifts.find((s) => s._id === selectedShiftId);

  // 🆕 2. دالة فتح الـ Dialog (النقر مرة واحدة)
  const handleDoubleClick = (cash) => {
    setSelectedCash(cash);
  };

  // 🆕 3. دالة إغلاق الـ Dialog
  const handleCloseDialog = () => {
    setSelectedCash(null);
  };

  // 🆕 4. دالة طباعة الخزنة المنفردة (منقولة من الكود الثاني)
  const handlePrintCash = () => {
    if (!selectedCash) return;

    const cashTotals = selectedCash.totals || {
      takeaway: 0,
      takeawayOrdersCount: 0,
    };

    const userName = selectedCash.userId?.name || "غير معروف";
    const openedAt = new Date(selectedCash.openedAt).toLocaleString();

    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(`
         <html>
             <head>
                 <title>إيصال خزنة ${userName}</title>
                 <style>
                      body { font-family: "Courier New", monospace; direction: rtl; text-align: center; padding: 10px; }
                      h2 { margin: 5px 0; }
                      table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                      th, td { border-bottom: 1px dashed #000; padding: 6px; font-size: 14px; }
                      .info { text-align: right; margin-bottom: 10px; border-bottom: 1px dashed #000; padding-bottom: 5px; }
                      .info p { margin: 2px 0; }
                 </style>
             </head>
             <body>
                 <h2>💰 تقرير خزنة الكاشير</h2>
                 <div class="info">
                     <p>الكاشير: ${userName}</p>
                     <p>وقت الفتح: ${openedAt}</p>
                     <p>تاريخ الطباعة: ${new Date().toLocaleString()}</p>
                 </div>
 
                 <h3>مبيعات التيك أواي</h3>
                 <table>
                     <thead>
                         <tr>
                             <th>النوع</th>
                             <th>عدد الأوردرات</th>
                             <th>المبيعات</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr>
                             <td>تيك أواي</td>
                             <td>${cashTotals.takeawayOrdersCount || 0}</td>
                             <td>${formatCurrency(
                               cashTotals.takeaway || 0
                             )} ج.م</td>
                         </tr>
                     </tbody>
                 </table>
                 
                 <div style="margin-top: 20px; text-align: center;">
                     <p>✅ شكراً لاستخدامك برنامجنا</p>
                 </div>
             </body>
         </html>
     `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        📑 تقارير الشيفتات السابقة
      </Typography>

      {/* 1. قائمة اختيار الشيفت */}
      <FormControl sx={{ minWidth: 300, mt: 2, mb: 3 }} size="small">
        <InputLabel id="select-shift-label">اختر شيفت لعرض تقريره</InputLabel>
        <Select
          labelId="select-shift-label"
          value={selectedShiftId}
          label="اختر شيفت لعرض تقريره"
          onChange={handleShiftChange}
          disabled={loading && !allShifts.length}>
          {allShifts.map((shift) => (
            <MenuItem key={shift._id} value={shift._id}>
              {formatDate(shift.openedAt)} - **{shift.status}**
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* عرض حالة التحميل والأخطاء */}
      {loading && selectedShiftId && (
        <CircularProgress size={24} sx={{ display: "block", my: 2 }} />
      )}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          خطأ في جلب البيانات: {error}
        </Alert>
      )}

      {/* 2. عرض تقرير الشيفت المختار */}
      {report && (
        <Paper
          sx={{
            p: 3,
            mt: 3,
            border:
              report.status === "CLOSED"
                ? "2px solid #ff0000"
                : "2px solid #388e3c",
            boxShadow: 3,
            backgroundColor: "#f9fff9",
          }}>
          <Typography
            variant="h6"
            gutterBottom
            fontWeight="bold"
            color="primary">
            تقرير الشيفت رقم #{report._id.slice(-6)}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* بيانات الشيفت الأساسية */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={4}>
              <Typography fontWeight="bold">الحالة:</Typography>
            </Grid>
            <Grid item xs={6} sm={8}>
              <Typography
                color={
                  report.status === "CLOSED" ? "error.main" : "success.main"
                }>
                **{report.status === "CLOSED" ? "مغلق" : "مفتوح"}**
              </Typography>
            </Grid>

            {/* ... (باقي تفاصيل الشيفت) ... */}
            <Grid item xs={6} sm={4}>
              <Typography fontWeight="bold">فاتح الشيفت:</Typography>
            </Grid>
            <Grid item xs={6} sm={8}>
              <Typography>
                {report.openedBy?.name ||
                  selectedShiftDetails?.openedBy?.name ||
                  "غير معروف"}
              </Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography fontWeight="bold">تاريخ الفتح:</Typography>
            </Grid>
            <Grid item xs={6} sm={8}>
              <Typography>{formatDate(report.openedAt)}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography fontWeight="bold">تاريخ الإغلاق:</Typography>
            </Grid>
            <Grid item xs={6} sm={8}>
              <Typography
                color={report.closedAt ? "text.primary" : "text.secondary"}>
                {report.closedAt ? formatDate(report.closedAt) : "غير مغلق"}
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* 3. جدول التقرير الإجمالي */}
          <Typography variant="h6" gutterBottom fontWeight="bold">
            الإجمالي الكلي لمبيعات الشيفت
          </Typography>

          <TableContainer component={Paper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#e8f5e9" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>النوع</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    عدد الأوردرات
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    إجمالي المبيعات (ج.م)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>دليفري</TableCell>
                  <TableCell align="center">
                    {report.totals.deliveryOrdersCount || 0}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(report.totals.delivery)}
                  </TableCell>
                </TableRow>
                {/* ... (باقي صفوف الجدول) ... */}
                <TableRow>
                  <TableCell>تيك أواي</TableCell>
                  <TableCell align="center">
                    {report.totals.takeawayOrdersCount || 0}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(report.totals.takeaway)}
                  </TableCell>
                </TableRow>

                <TableRow
                  sx={{ backgroundColor: "#c8e6c9", fontWeight: "bold" }}>
                  <TableCell sx={{ fontWeight: "bold", fontSize: "16px" }}>
                    الإجمالي الكلي
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    {(report.totals.deliveryOrdersCount || 0) +
                      (report.totals.takeawayOrdersCount || 0)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    **{formatCurrency(report.totals.overall)} ج.م**
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          {/* 4. عرض ملخص خزن الكاشير (مع إضافة النقر) */}
          {report.cashes && report.cashes.length > 0 && (
            <Box>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                👤 ملخص خزن الكاشير: (اضغط لعرض التفاصيل)
              </Typography>
              <Grid container spacing={2}>
                {report.cashes.map((cash) => (
                  <Grid item xs={12} sm={6} md={4} key={cash._id}>
                    <Paper
                      sx={{
                        p: 2,
                        my: 1,
                        cursor: "pointer", // 👈 لتظهر كزر
                        border: "1px solid #bbdefb",
                        borderLeft: "5px solid #2196f3",
                        backgroundColor: "#e3f2fd",
                        "&:hover": { boxShadow: 6, background: "#cfd8dc" }, // 🆕 تأثير عند المرور
                      }}
                      // 🆕 ربط دالة الفتح بالنقر العادي (onClick)
                      onDoubleClick={() => handleDoubleClick(cash)}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        💰 خزنة: {cash.userId?.name || "غير معروف"}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2">
                        وقت الفتح: **{formatDate(cash.openedAt)}**
                      </Typography>
                      <Typography variant="body2">
                        حالة الخزنة: **{cash.status}**
                      </Typography>
                      <Typography variant="h6" color="primary" mt={1}>
                        المبيعات: **{formatCurrency(cash.totals.overall)} ج.م**
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      )}

      {/* ... (رسالة عدم اختيار شيفت) ... */}
      {!selectedShiftId && !loading && allShifts.length > 0 && (
        <Paper sx={{ p: 3, textAlign: "center", mt: 3, background: "#fff3e0" }}>
          <Typography color="text.secondary">
            الرجاء اختيار شيفت من القائمة أعلاه لعرض تقريره المفصّل.
          </Typography>
        </Paper>
      )}

      {/* 🆕 5. إضافة الـ Dialog لعرض تفاصيل الخزنة */}
      <Dialog open={!!selectedCash} onClose={handleCloseDialog} fullWidth>
        <DialogTitle>
          تفاصيل خزنة {selectedCash?.userId?.name || "..."}
        </DialogTitle>
        <DialogContent>
          {selectedCash && (
            <Box>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography fontWeight="bold">الحالة:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{selectedCash.status}</Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography fontWeight="bold">تاريخ الفتح:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>{formatDate(selectedCash.openedAt)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                ملخص مبيعات الخزنة
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        تيك أواي (عدد)
                      </TableCell>
                      <TableCell align="right">
                        {selectedCash.totals.takeawayOrdersCount || 0}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        تيك أواي (مبيعات)
                      </TableCell>
                      <TableCell align="right">
                        {`${formatCurrency(selectedCash.totals.takeaway || 0)}
                        ج.م`}
                      </TableCell>
                    </TableRow>

                    <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                      <TableCell
                        sx={{ fontWeight: "bold", color: "error.main" }}>
                        الإجمالي الكلي
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: "error.main" }}>
                        {`${formatCurrency(selectedCash.totals.overall || 0)}
                        ج.م`}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 2 }} />

              <Box textAlign="center" mt={2}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handlePrintCash}>
                  طباعة تقرير هذه الخزنة
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}