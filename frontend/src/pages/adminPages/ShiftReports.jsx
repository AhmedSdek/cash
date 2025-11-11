import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCurrentShift,
  clearShiftReport,
  closeShift,
} from "../../store/shiftSlice";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from "@mui/material";
import Swal from "sweetalert2";

export default function ShiftReports() {
  const dispatch = useDispatch();
  const { currentShift, loading, error } = useSelector((state) => state.shift);

  const [selectedCash, setSelectedCash] = useState(null);

  useEffect(() => {
    dispatch(fetchCurrentShift());
    return () => {
      dispatch(clearShiftReport());
    };
  }, [dispatch]);

  const handleDoubleClick = (cash) => {
    setSelectedCash(cash);
  };

  const handleCloseDialog = () => {
    setSelectedCash(null);
  };

  const formatCurrency = (value) => Number(value || 0).toFixed(2);
  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleString() : "غير محدد";
  };

  // 🔹 إغلاق الشيفت
  const handleCloseShiftClick = () => {
    // ... (الكود كما هو)
    Swal.fire({
      title: "تأكيد إغلاق الشيفت",
      text: "هل أنت متأكد أنك تريد إغلاق هذا الشيفت؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، إغلاق",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed && currentShift?._id) {
        try {
          await dispatch(closeShift(currentShift._id)).unwrap();
          Swal.fire("تم الإغلاق!", "تم إغلاق الشيفت بنجاح.", "success");
        } catch (error) {
          const errorMessage =
            typeof error === "string"
              ? error
              : error.message || "حدث خطأ أثناء إغلاق الشيفت.";

          Swal.fire("فشل الإغلاق!", errorMessage, "error");
        }
      }
    });
  };

  // 🔹 دالة طباعة الشيفت الكلي (كما هي بدون تغيير)
  const handlePrintShift = () => {
    // ... (الكود كما هو)
    if (!currentShift) return;

    const totals = currentShift.totals || {
      takeaway: 0,
      delivery: 0,
      overall: 0,
      takeawayOrdersCount: 0,
      deliveryOrdersCount: 0,
    };

    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>إيصال الشيفت</title>
          <style>
            body { font-family: "Courier New", monospace; direction: rtl; text-align: center; padding: 10px; }
            h2 { margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { border-bottom: 1px dashed #000; padding: 6px; font-size: 14px; }
            .total { font-weight: bold; border-top: 2px solid #000; }
            .footer { margin-top: 15px; font-size: 12px; border-top: 1px dashed #000; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h2>📋 تقرير الشيفت الإجمالي</h2>
          <p>تاريخ الطباعة: ${new Date().toLocaleString()}</p>
          <hr/>

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
                <td>${totals.takeawayOrdersCount}</td>
                <td>${formatCurrency(totals.takeaway)} ج.م</td>
              </tr>
              <tr>
                <td>دليفري</td>
                <td>${totals.deliveryOrdersCount}</td>
                <td>${formatCurrency(totals.delivery)} ج.م</td>
              </tr>
              <tr class="total">
                <td>الإجمالي الكلي</td>
                <td>${
                  totals.takeawayOrdersCount + totals.deliveryOrdersCount
                }</td>
                <td>${formatCurrency(totals.overall)} ج.م</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <p>✅ تم الطباعة بواسطة النظام</p>
            <p>شكراً لاستخدامك برنامجنا</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  // 🔹 دالة طباعة الخزنة المنفردة (كما هي بدون تغيير)
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
        📊 تقارير الشيفت النشط
      </Typography>
      {loading && <CircularProgress sx={{ my: 2 }} />}
      {error && (
        <Typography color="error" textAlign="center">
          خطأ: {error}
        </Typography>
      )}

      {!currentShift && !loading && (
        <Paper sx={{ p: 3, textAlign: "center", mt: 3, background: "#fce4ec" }}>
          <Typography color="error">لا يوجد شيفت مفتوح حالياً</Typography>
        </Paper>
      )}

      {currentShift && (
        <Paper
          sx={{
            p: 3,
            mt: 3,
            // 🆕 تصميم مطابق للكود المفضل لديك
            border: "2px solid #388e3c",
            boxShadow: 3,
          }}>
          {/* 1. ملخص الشيفت الأساسي */}
          <Typography
            variant="h6"
            gutterBottom
            fontWeight="bold"
            color="primary">
            ملخص الشيفت النشط #{currentShift._id.slice(-6)}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={4}>
              <Typography fontWeight="bold">فاتح الشيفت:</Typography>
            </Grid>

            <Grid item xs={6} sm={8}>
              <Typography>
                {currentShift.openedBy?.name || "غير معروف"}
              </Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography fontWeight="bold">وقت الفتح:</Typography>
            </Grid>

            <Grid item xs={6} sm={8}>
              <Typography>{formatDate(currentShift.openedAt)}</Typography>
            </Grid>

            <Grid item xs={6} sm={4}>
              <Typography fontWeight="bold">حالة الشيفت:</Typography>
            </Grid>

            <Grid item xs={6} sm={8}>
              <Typography color="success.main">
                {currentShift.status}
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />

          {/* 2. جدول إجمالي مبيعات الشيفت الكلي */}
          <Typography variant="h6" gutterBottom fontWeight="bold">
            الإجمالي الكلي لمبيعات الشيفت
          </Typography>

          <TableContainer component={Paper} elevation={1}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
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
                  <TableCell>تيك أواي</TableCell>
                  <TableCell align="center">
                    {currentShift.totals.takeawayOrdersCount || 0}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(currentShift.totals.takeaway)}
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>دليفري</TableCell>
                  <TableCell align="center">
                    {currentShift.totals.deliveryOrdersCount || 0}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(currentShift.totals.delivery)}
                  </TableCell>
                </TableRow>

                <TableRow
                  sx={{ backgroundColor: "#e0e0e0", fontWeight: "bold" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>
                    الإجمالي الكلي
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    {(currentShift.totals.takeawayOrdersCount || 0) +
                      (currentShift.totals.deliveryOrdersCount || 0)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>
                    {formatCurrency(currentShift.totals.overall)} ج.م
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />

          {/* 3. عرض كل الخزن (Cashes) */}
          <Typography variant="h6" gutterBottom fontWeight="bold">
            👤 ملخص خزن الكاشير المفتوحة (انقر مرتين للتفاصيل):
          </Typography>

          <Grid container spacing={2}>
            {currentShift.cashes.map((cash) => (
              <Grid item xs={12} sm={6} md={4} key={cash._id}>
                <Paper
                  sx={{
                    p: 2,
                    my: 1,
                    cursor: "pointer",
                    // 🆕 تصميم مميز للخزن
                    borderLeft: "5px solid #2196f3",
                    "&:hover": { boxShadow: 6, background: "#e3f2fd" },
                  }}
                  onDoubleClick={() => handleDoubleClick(cash)}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    💰 خزنة: {cash.userId?.name || "غير معروف"}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    حالة الخزنة: **{cash.status}**
                  </Typography>
                  <Typography variant="body2">
                    وقت الفتح: **{formatDate(cash.openedAt)}**
                  </Typography>
                  <Typography variant="h6" color="primary" mt={1}>
                    المبيعات: **{formatCurrency(cash.totals.overall)} ج.م**
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* 4. أزرار الإجراءات */}
          <Box
            textAlign="center"
            mt={3}
            display="flex"
            gap={2}
            justifyContent="center">
            <Button
              variant="contained"
              color="error"
              onClick={handleCloseShiftClick}
              disabled={loading}
              sx={{ minWidth: "200px" }}>
              🚫 إغلاق الشيفت بالكامل
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrintShift}>
              طباعة تقرير الشيفت كاملاً
            </Button>
          </Box>

          {/* Dialog تفاصيل الخزنة */}
          <Dialog open={!!selectedCash} onClose={handleCloseDialog} fullWidth>
            <DialogTitle>تفاصيل خزنة {selectedCash?.userId?.name}</DialogTitle>
            <DialogContent>
              {selectedCash && (
                <Box>
                  {/* ... (عرض تفاصيل الخزنة داخل الدايالوج بنفس تنسيق الجدول) ... */}
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
                      <Typography>
                        {formatDate(selectedCash.openedAt)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    fontWeight="bold">
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
                            {`${formatCurrency(
                              selectedCash.totals.takeaway || 0
                            )}
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
                            {`${formatCurrency(
                              selectedCash.totals.overall || 0
                            )}
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
        </Paper>
      )}
    </Box>
  );
}