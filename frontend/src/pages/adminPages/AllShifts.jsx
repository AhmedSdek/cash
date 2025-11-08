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
} from "@mui/material";

export default function AllShifts() {
  const dispatch = useDispatch();
  const { allShifts, report, loading } = useSelector((state) => state.shift);
  console.log(report);
  const [selectedShiftId, setSelectedShiftId] = useState("");

  useEffect(() => {
    dispatch(fetchAllShifts());
  }, [dispatch]);

  useEffect(() => {
    if (selectedShiftId) {
      dispatch(fetchShiftReport(selectedShiftId));
    }
  }, [selectedShiftId, dispatch]);

  return (
    <Box>
      <Typography variant="h5">كل الشيفتات</Typography>

      <FormControl sx={{ minWidth: 250, mt: 2 }}>
        <InputLabel>اختر شيفت</InputLabel>
        <Select
          value={selectedShiftId}
          label="اختر شيفت"
          onChange={(e) => setSelectedShiftId(e.target.value)}
        >
          {allShifts.map((shift) => (
            <MenuItem key={shift._id} value={shift._id}>
              {new Date(shift.openedAt).toLocaleString()} - {shift.status}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading && <Typography>جارٍ التحميل...</Typography>}

      {report && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography>الشيفت: {selectedShiftId}</Typography>
          <Typography>الحالة: {report.status}</Typography>
          <Typography>
            تاريخ الفتح: {new Date(report.openedAt).toLocaleString()}
          </Typography>
          <Typography>
            تاريخ الإغلاق:{" "}
            {report.closedAt
              ? new Date(report.closedAt).toLocaleString()
              : "غير مغلق"}
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            التقرير الإجمالي
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>النوع</TableCell>
                  <TableCell align="center">عدد الأوردرات</TableCell>
                  <TableCell align="center">إجمالي المبيعات (ج.م)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>دليفري</TableCell>
                  <TableCell align="center">
                    {report.totals.deliveryOrdersCount}
                  </TableCell>
                  <TableCell align="center">{report.totals.delivery}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>تيك أواي</TableCell>
                  <TableCell align="center">
                    {report.totals.takeawayOrdersCount}
                  </TableCell>
                  <TableCell align="center">{report.totals.takeaway}</TableCell>
                </TableRow>
                <TableRow
                  sx={{ backgroundColor: "#f5f5f5", fontWeight: "bold" }}
                >
                  <TableCell>إجمالي</TableCell>
                  <TableCell align="center">
                    {report.totals.deliveryOrdersCount +
                      report.totals.takeawayOrdersCount}
                  </TableCell>
                  <TableCell align="center">{report.totals.overall}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
