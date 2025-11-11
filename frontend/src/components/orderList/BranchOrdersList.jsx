import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllBranchOrders,
  clearAllBranchOrders,
  fetchAllShifts,
  fetchCurrentShift,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";

export default function BranchOrdersList() {
  const dispatch = useDispatch();

  const [selectedShiftId, setSelectedShiftId] = useState(null);

  const { allBranchOrders, allShifts, loading, error, currentShift } =
    useSelector((state) => state.shift);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchAllShifts());
    dispatch(fetchCurrentShift());

    return () => {
      dispatch(clearAllBranchOrders());
    };
  }, [dispatch]);

  useEffect(() => {
    if (currentShift !== undefined && selectedShiftId === null) {
      if (currentShift) {
        setSelectedShiftId(undefined);
      } else {
        setSelectedShiftId(null);
      }
    }
  }, [currentShift, selectedShiftId]);

  useEffect(() => {
    if (selectedShiftId !== null) {
      dispatch(fetchAllBranchOrders(selectedShiftId));
    }
  }, [dispatch, selectedShiftId]);

  const handleShiftChange = (event) => {
    const value = event.target.value;
    setSelectedShiftId(
      // "open" (الشيفت المفتوح) تُترجم لـ undefined
      value === "open"
        ? undefined
        : // "" (الخيار الافتراضي الفارغ) تُترجم لـ null
        value === ""
        ? null
        : value
    );
  };

  // ----------------------------------------------------
  // حالات العرض
  // ----------------------------------------------------

  // 💡 انتظار حتى يتم تحديد selectedShiftId لأول مرة (أي حتى يتغير من null)
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        حدث خطأ أثناء جلب البيانات: {error}
      </Alert>
    );
  }

  // إذا لم يكن هناك أوردرات و انتهى التحميل
  if (allBranchOrders.length === 0 && !loading) {
    return (
      <Box>
        <ShiftSelectionControl
          allShifts={allShifts}
          currentShift={currentShift}
          selectedShiftId={selectedShiftId}
          handleShiftChange={handleShiftChange}
          userBranchName={user?.branchId?.name}
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          {/* رسالة توضح السياق: إذا كان لا يوجد شيفت مفتوح، نوجه المستخدم للاختيار */}
          {currentShift === null
            ? "لا يوجد شيفت مفتوح حالياً. يرجى اختيار شيفت مغلق من القائمة لعرض أوردراته."
            : `لا توجد أوردرات متاحة حالياً في الفرع (${
                user?.branchId?.name || "غير معروف"
              }) للشيفت المحدد.`}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        📋 جميع الأوردرات لفرع: {user?.branchId?.name || "..."}
      </Typography>

      <ShiftSelectionControl
        allShifts={allShifts}
        currentShift={currentShift}
        selectedShiftId={selectedShiftId}
        handleShiftChange={handleShiftChange}
        userBranchName={user?.branchId?.name}
      />

      {/* 🔴 عرض الجدول */}
      <TableContainer component={Paper} sx={{ mt: 3 }}>
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
            {allBranchOrders.map((order) => (
              <TableRow key={order._id}>
                <TableCell>{order.orderNumber}</TableCell>
                <TableCell>{order.type}</TableCell>
                <TableCell>
                  {/* عرض حالة الشيفت */}
                  {order.shiftId?.status || "غير محدد"}
                </TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  **{order.grandTotal?.toFixed(2) || "0.00"} ج.م**
                </TableCell>
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

// ---
// ----------------------------------------------------
// 🟢 مكون فرعي لأداة اختيار الشيفت (تم التعديل)
// ----------------------------------------------------
const ShiftSelectionControl = ({
  allShifts,
  currentShift,
  selectedShiftId,
  handleShiftChange,
  userBranchName,
}) => {
  const displayValue =
    selectedShiftId === undefined
      ? "open"
      : selectedShiftId === null
      ? ""
      : selectedShiftId;

  return (
    <Box mb={3}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth sx={{ width: "150px" }} size="small">
            <InputLabel id="shift-select-label">اختيار الشيفت</InputLabel>
            <Select
              labelId="shift-select-label"
              value={displayValue} // 👈 سيصبح "" عندما لا يوجد شيفت مفتوح
              label="اختيار الشيفت"
              onChange={handleShiftChange}>
              {/* 🆕 الخيار الافتراضي الفارغ */}
              <MenuItem value={""}>
                {currentShift
                  ? "-- اختيار شيفت مغلق --"
                  : "--- لا يوجد شيفت مفتوح ---"}
              </MenuItem>

              {/* 🟢 الشيفت المفتوح (يُعرض فقط إذا كان موجوداً) */}
              {currentShift && (
                <MenuItem value={"open"}>
                  🟢 الشيفت المفتوح حالياً (
                  {new Date(currentShift.openedAt).toLocaleTimeString()})
                </MenuItem>
              )}

              {/* 🔴 الشيفتات المغلقة (لم تتغير) */}
              {allShifts
                .filter((shift) => shift._id !== currentShift?._id)
                .map((shift) => (
                  <MenuItem key={shift._id} value={shift._id}>
                    {shift.status === "CLOSED" ? "🔴 مُغلق" : "🟡 شيفت قديم"} (
                    {new Date(shift.openedAt).toLocaleDateString()})
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Typography variant="body2" color="textSecondary">
            ملاحظة: إذا لم تختر شيفت محدد، سيتم جلب أوردرات الشيفت المفتوح
            حالياً لفرع {userBranchName}.
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
