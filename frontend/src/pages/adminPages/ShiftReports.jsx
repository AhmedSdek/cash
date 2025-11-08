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
} from "@mui/material";
import Swal from "sweetalert2";

export default function ShiftReports() {
  const dispatch = useDispatch();
  const { currentShift, loading, error } = useSelector((state) => state.shift);
  console.log(currentShift);

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

  // 🔹 إغلاق الشيفت
  const handleCloseShiftClick = () => {
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

  // 🔹 دالة طباعة الشيفت الكلي
  const handlePrintShift = () => {
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
            body {
              font-family: "Courier New", monospace;
              direction: rtl;
              text-align: center;
              padding: 10px;
            }
            h2 {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border-bottom: 1px dashed #000;
              padding: 6px;
              font-size: 14px;
            }
            .total {
              font-weight: bold;
              border-top: 2px solid #000;
            }
            .footer {
              margin-top: 15px;
              font-size: 12px;
              border-top: 1px dashed #000;
              padding-top: 10px;
            }
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
                <td>${totals.takeaway} ج.م</td>
              </tr>
              <tr>
                <td>دليفري</td>
                <td>${totals.deliveryOrdersCount}</td>
                <td>${totals.delivery} ج.م</td>
              </tr>
              <tr class="total">
                <td>الإجمالي الكلي</td>
                <td>${
                  totals.takeawayOrdersCount + totals.deliveryOrdersCount
                }</td>
                <td>${totals.overall} ج.م</td>
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

  // 🆕 🔹 دالة طباعة الخزنة المنفردة
  const handlePrintCash = () => {
    if (!selectedCash) return;

    const cashTotals = selectedCash.totals || {
      takeaway: 0,
      takeawayOrdersCount: 0,
      // يمكن إضافة الدليفري والإجمالي هنا إذا كنت تريد طباعتهم في تقرير الخزنة المنفرد
    };

    // بيانات الكاشير والوقت
    const userName = selectedCash.userId?.name || "غير معروف";
    const openedAt = new Date(selectedCash.openedAt).toLocaleString();

    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(`
        <html>
            <head>
                <title>إيصال خزنة ${userName}</title>
                <style>
                    body {
                        font-family: "Courier New", monospace;
                        direction: rtl;
                        text-align: center;
                        padding: 10px;
                    }
                    h2 {
                        margin: 5px 0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 10px 0;
                    }
                    th, td {
                        border-bottom: 1px dashed #000;
                        padding: 6px;
                        font-size: 14px;
                    }
                    .info {
                        text-align: right;
                        margin-bottom: 10px;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 5px;
                    }
                    .info p {
                        margin: 2px 0;
                    }
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
                            <td>${cashTotals.takeaway || 0} ج.م</td>
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
      {loading && <Typography>جارٍ التحميل...</Typography>}
      {error && (
        <Typography color="error" textAlign="center">
          خطأ: {error}
        </Typography>
      )}

      {!currentShift && !loading && (
        <Typography>لا يوجد شيفت مفتوح حالياً</Typography>
      )}

      {currentShift && (
        <Box>
          <Typography variant="h6" textAlign="center" gutterBottom>
            الشيفت الحالي
          </Typography>
          <Divider sx={{ my: 2 }} />

          {/* عرض كل الخزن */}
          {currentShift.cashes.map((cash) => (
            <Paper
              key={cash._id}
              sx={{ p: 2, my: 1, cursor: "pointer" }}
              onDoubleClick={() => handleDoubleClick(cash)}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                خزنة: {cash.userId?.name || "غير معروف"}
              </Typography>
              <Typography variant="body2">
                تم فتحها في: {new Date(cash.openedAt).toLocaleString()}
              </Typography>
              <Typography variant="body2">الحالة: {cash.status}</Typography>
            </Paper>
          ))}

          {/* 🔹 الإجمالي الكلي لكل الخزن */}
          {/* ... (كود إجمالي الشيفت الكلي كما هو) ... */}
          <Paper sx={{ p: 2, mt: 3, background: "#f9f9f9" }}>
            <Typography variant="h6" gutterBottom textAlign="center">
              إجمالي الشيفت
            </Typography>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
              }}
            >
              <thead>
                <tr style={{ background: "#f0f0f0" }}>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    النوع
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    عدد الأوردرات
                  </th>
                  <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    المبيعات
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    تيك أواي
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {currentShift.totals.takeawayOrdersCount}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {currentShift.totals.takeaway} ج.م
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    دليفري
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {currentShift.totals.deliveryOrdersCount}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {currentShift.totals.delivery} ج.م
                  </td>
                </tr>
                <tr style={{ background: "#f9f9f9", fontWeight: "bold" }}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    الإجمالي الكلي
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {currentShift.totals.takeawayOrdersCount +
                      currentShift.totals.deliveryOrdersCount}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {currentShift.totals.overall} ج.م
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 🔹 زرار إغلاق الشيفت + زرار الطباعة */}
            <Box
              textAlign="center"
              mt={3}
              display="flex"
              gap={2}
              justifyContent="center"
            >
              <Button
                variant="contained"
                color="error"
                onClick={handleCloseShiftClick}
              >
                إغلاق الشيفت
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePrintShift}
              >
                طباعة الشيفت
              </Button>
            </Box>
          </Paper>

          {/* Dialog تفاصيل الخزنة (تم إضافة زر الطباعة هنا) */}
          <Dialog open={!!selectedCash} onClose={handleCloseDialog} fullWidth>
            <DialogTitle>تفاصيل خزنة {selectedCash?.userId?.name}</DialogTitle>
            <DialogContent>
              {selectedCash && (
                <Box>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography>الحالة:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{selectedCash.status}</Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Typography>تاريخ الفتح:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>
                        {new Date(selectedCash.openedAt).toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" gutterBottom>
                    تفاصيل مبيعات التيك أواي فقط
                  </Typography>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginTop: "10px",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f0f0f0" }}>
                        <th
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          النوع
                        </th>
                        <th
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          عدد الأوردرات
                        </th>
                        <th
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          المبيعات
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* عرض التيك أواي فقط */}
                      <tr>
                        <td
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          تيك أواي
                        </td>
                        <td
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          {selectedCash.totals.takeawayOrdersCount || 0}
                        </td>
                        <td
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          {selectedCash.totals.takeaway || 0} ج.م
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <Divider sx={{ my: 2 }} />

                  {/* 🆕 زر طباعة الخزنة المنفردة */}
                  <Box textAlign="center" mt={2}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={handlePrintCash}
                    >
                      طباعة تقرير هذه الخزنة
                    </Button>
                  </Box>
                </Box>
              )}
            </DialogContent>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}
