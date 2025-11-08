import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// ✅ استخدام الـ Thunk الجديد الذي يجلب كل أوردرات الفرع
import {
  fetchAllBranchOrders,
  clearAllBranchOrders,
} from "../../store/shiftSlice";
import {
  Box,
  Typography,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Alert,
} from "@mui/material";

export default function BranchOrdersList() {
  const dispatch = useDispatch();

  // 1. جلب البيانات من الـ Store
  // ✅ استخدام الحالة الجديدة allBranchOrders
  const { allBranchOrders, loading, error } = useSelector(
    (state) => state.shift
  );
  // 💡 افتراض أن بيانات المستخدم (لتحديد الفرع) محفوظة في store.auth.user
  const user = useSelector((state) => state.auth.user);

  // 2. جلب الأوردرات عند تحميل المكون
  useEffect(() => {
    // جلب كل الأوردرات للفرع الحالي
    dispatch(fetchAllBranchOrders());

    // تنظيف الحالة عند مغادرة المكون
    return () => {
      dispatch(clearAllBranchOrders());
    };
  }, [dispatch]);

  // 3. عرض حالة التحميل
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // 4. عرض رسالة الخطأ
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        ❌ حدث خطأ أثناء جلب الأوردرات: {error}
      </Alert>
    );
  }

  // 5. عرض رسالة لا يوجد بيانات
  if (allBranchOrders.length === 0) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        لا توجد أوردرات متاحة حالياً في الفرع ({user?.branchId || "غير معروف"}).
      </Alert>
    );
  }

  // 6. المكون الرئيسي لعرض الجدول
  return (
    <Box>
      <Typography variant="h5" mb={3}>
        📋 جميع الأوردرات لفرع: {user?.branchName || user?.branchId}
      </Typography>

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>نوع الأوردر</TableCell>
              <TableCell>الشيفت</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>الإجمالي</TableCell>
              <TableCell>الكاشير</TableCell>
              <TableCell>تاريخ الإنشاء</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allBranchOrders.map((order, index) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.type}</TableCell>
                {/* 💡 لعرض الـ Shift ID أو حالة الشيفت (مغلق/مفتوح) */}
                <TableCell>
                  {order.shiftId?.status || order.shiftId || "غير محدد"}
                </TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  **{order.grandTotal?.toFixed(2) || "0.00"} ج.م**
                </TableCell>
                {/* 💡 عرض اسم المستخدم الذي أنشأ الأوردر */}
                <TableCell>{order.createdBy?.name || "غير معروف"}</TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
