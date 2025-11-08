import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReport } from "../../store/reportSlice";
import { fetchBranches } from "../../store/branchSlice";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ar } from "date-fns/locale";

export default function ReportPage() {
  const dispatch = useDispatch();

  const { branches: branchesList } = useSelector((state) => state.branches);
  const { branches, finalTotal, loading, error } = useSelector(
    (state) => state.reports
  );

  const [branchId, setBranchId] = useState("all");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };

  const handleFetch = () => {
    if (fromDate && toDate) {
      dispatch(
        fetchReport({
          branchId: branchId !== "all" ? branchId : undefined,
          from: formatDate(fromDate),
          to: formatDate(toDate),
        })
      );
    }
  };

  // دالة لتنسيق التاريخ للعرض في عنوان التقرير
  const getFormattedDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 🧾 دالة الطباعة باستخدام iframe (بديل أكثر موثوقية لـ window.open)
  const handlePrint = () => {
    if (!branches || branches.length === 0) return;

    const startDate = getFormattedDate(fromDate);
    const endDate = getFormattedDate(toDate);

    const totalDeliveryOrders = finalTotal?.delivery?.count || 0;
    const totalDeliveryAmount = finalTotal?.delivery?.total || 0;
    const totalCashierOrders = finalTotal?.cashier?.count || 0;
    const totalCashierAmount = finalTotal?.cashier?.total || 0;
    const totalOrders = finalTotal?.overall?.count || 0;
    const totalAmount = finalTotal?.overall?.total || 0;

    const printContent = `
        <html lang="ar" dir="rtl">
          <head>
            <meta charset="UTF-8" />
            <title>إيصال التقرير</title>
            <style>
              /* 🚨 حجم الإيصال الحراري 80mm */
              @page {
                size: 80mm auto;
                margin: 2mm;
              }
              * {
                box-sizing: border-box;
              }
              body {
                font-family: 'Tahoma', sans-serif;
                font-size: 8px; 
                direction: rtl;
                text-align: right;
                width: 100%;
                margin: 0;
                padding: 0;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              .header {
                text-align: center;
                border-bottom: 1px dashed #000;
                padding-bottom: 3px;
                margin-bottom: 3px;
              }
              .header h2 {
                margin: 2px 0;
                font-size: 9px;
              }
              .branch {
                border-bottom: 1px dashed #000;
                margin-bottom: 3px;
                padding-bottom: 2px;
              }
              .branch-title {
                font-weight: bold;
                font-size: 8px;
                margin-bottom: 1px;
              }
              .line {
                display: flex;
                justify-content: space-between;
                font-size: 7.5px;
                margin: 1px 0;
                white-space: normal;
              }
              .summary {
                border-top: 1px dashed #000;
                padding-top: 3px;
                margin-top: 3px;
                font-size: 7.5px;
              }
              .footer {
                text-align: center;
                margin-top: 4px;
                font-size: 7px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>${new Date().toLocaleString("ar-EG")}</div>
              <h2>🧾 إيصال تقرير المبيعات</h2>
              <div>من ${startDate} إلى ${endDate}</div>
            </div>

            ${branches
              .map(
                (b) => `
              <div class="branch">
                <div class="branch-title">🏢 ${b.name}</div>
                <div class="line">🚚 دليفري: <span>${b.totals.delivery.count} طلب - ${b.totals.delivery.total} ج.م</span></div>
                <div class="line">💵 كاشير: <span>${b.totals.cashier.count} طلب - ${b.totals.cashier.total} ج.م</span></div>
                <div class="line">📊 الإجمالي: <span>${b.totals.overall.count} طلب - ${b.totals.overall.total} ج.م</span></div>
              </div>
            `
              )
              .join("")}

            <div class="summary">
              <div>📋 <b>إجمالي كل الفروع</b></div>
              <div class="line">🚚 دليفري: <span>${totalDeliveryOrders} طلب - ${totalDeliveryAmount} ج.م</span></div>
              <div class="line">💵 كاشير: <span>${totalCashierOrders} طلب - ${totalCashierAmount} ج.م</span></div>
              <div class="line">📊 <b>الإجمالي الكلي:</b> <span>${totalOrders} طلب - ${totalAmount} ج.م</span></div>
            </div>

            <div class="footer">
              شكراً لاستخدامك النظام 💙
            </div>
          </body>
        </html>
    `;

    // إنشاء iframe مخفي
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // كتابة المحتوى في الـ iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();

    // استدعاء الطباعة مباشرة
    iframe.contentWindow.print();

    // إزالة الـ iframe بعد الطباعة (يمكن تأخيرها قليلاً لضمان اكتمال الطباعة)
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          📊 تقرير الفروع
        </Typography>

        {/* اختيار الفرع والفترة */}
        <Box display="flex" gap={2} alignItems="center" mb={3}>
          <TextField
            select
            label="اختر الفرع"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">📌 كل الفروع</MenuItem>
            {branchesList.map((b) => (
              <MenuItem key={b._id} value={b._id}>
                {b.name}
              </MenuItem>
            ))}
          </TextField>

          <DatePicker
            label="من تاريخ"
            value={fromDate}
            onChange={(newValue) => setFromDate(newValue)}
          />
          <DatePicker
            label="إلى تاريخ"
            value={toDate}
            onChange={(newValue) => setToDate(newValue)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleFetch}
            disabled={!fromDate || !toDate}
          >
            عرض التقرير
          </Button>

          {/* زر الطباعة */}
          {branches.length > 0 && (
            <Button variant="outlined" color="success" onClick={handlePrint}>
              🖨️ طباعة إيصال (حراري)
            </Button>
          )}
        </Box>

        {/* عرض الجدول */}
        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}
        {!loading && branches.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الفرع</TableCell>
                  <TableCell align="center">عدد دليفري</TableCell>
                  <TableCell align="center">مبيعات دليفري</TableCell>
                  <TableCell align="center">عدد كاشير</TableCell>
                  <TableCell align="center">مبيعات كاشير</TableCell>
                  <TableCell align="center">عدد إجمالي</TableCell>
                  <TableCell align="center">إجمالي المبيعات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {branches.map((b) => (
                  <TableRow key={b.branchId}>
                    <TableCell>{b.name}</TableCell>
                    <TableCell align="center">
                      {b.totals.delivery.count}
                    </TableCell>
                    <TableCell align="center">
                      {b.totals.delivery.total}
                    </TableCell>
                    <TableCell align="center">
                      {b.totals.cashier.count}
                    </TableCell>
                    <TableCell align="center">
                      {b.totals.cashier.total}
                    </TableCell>
                    <TableCell align="center">
                      {b.totals.overall.count}
                    </TableCell>
                    <TableCell align="center">
                      {b.totals.overall.total}
                    </TableCell>
                  </TableRow>
                ))}

                {finalTotal && (
                  <TableRow
                    sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}
                  >
                    <TableCell>الإجمالي الكلي</TableCell>
                    <TableCell align="center">
                      {finalTotal.delivery.count}
                    </TableCell>
                    <TableCell align="center">
                      {finalTotal.delivery.total} ج.م
                    </TableCell>
                    <TableCell align="center">
                      {finalTotal.cashier.count}
                    </TableCell>
                    <TableCell align="center">
                      {finalTotal.cashier.total} ج.م
                    </TableCell>
                    <TableCell align="center">
                      {finalTotal.overall.count}
                    </TableCell>
                    <TableCell align="center">
                      {finalTotal.overall.total} ج.م
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </LocalizationProvider>
  );
}
