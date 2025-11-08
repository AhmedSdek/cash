// components/ItemsReport.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
  TextField,
  Stack,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { fetchItemsReport } from "../../store/reportSlice";
import { fetchBranches } from "../../store/branchSlice";

export default function ItemsReport() {
  const dispatch = useDispatch();

  const { items, itemsFinalTotal, loading, error } = useSelector(
    (state) => state.reports
  );
  console.log(items);
  const { branches } = useSelector((state) => state.branches);

  const [selectedBranch, setSelectedBranch] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  const handleFetch = () => {
    dispatch(
      fetchItemsReport({
        branchId: selectedBranch !== "all" ? selectedBranch : undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      })
    );
  };

  const columns = [
    { field: "name", headerName: "اسم الصنف", flex: 1 },
    { field: "count", headerName: "الكمية", width: 120 },
    { field: "price", headerName: "السعر", width: 150 },
    {
      field: "total",
      headerName: "الإجمالي (ج.م)",
      width: 180,
      renderCell: (params) => `${params.value}`,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        تقرير الأصناف
      </Typography>

      {/* فلاتر البحث */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 2, flexWrap: "wrap", alignItems: "center" }}
      >
        <Select
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">كل الفروع</MenuItem>
          {branches?.map((b) => (
            <MenuItem key={b._id} value={b._id}>
              {b.name}
            </MenuItem>
          ))}
        </Select>

        <TextField
          type="date"
          label="من تاريخ"
          InputLabelProps={{ shrink: true }}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <TextField
          type="date"
          label="إلى تاريخ"
          InputLabelProps={{ shrink: true }}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <Button variant="contained" onClick={handleFetch} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "جلب التقرير"}
        </Button>
      </Stack>

      {/* عرض الأخطاء */}
      {error && <Typography color="error">{error}</Typography>}

      {/* عرض التقرير */}
      {items.length > 0 ? (
        <Box sx={{ height: 300, width: "100%" }}>
          <DataGrid
            rows={items}
            columns={columns}
            getRowId={(row) => row._id || row.name}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
          />

          {/* الإجمالي */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderTop: "2px solid #333",
              backgroundColor: "#f9f9f9",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6">الإجمالي:</Typography>
            <Typography>
              إجمالي الكمية: {itemsFinalTotal?.totalQuantity || 0}
            </Typography>
            <Typography>
              إجمالي السعر: {itemsFinalTotal?.totalSales?.toLocaleString() || 0}{" "}
              ج.م
            </Typography>
          </Box>
        </Box>
      ) : (
        !loading && <Typography>لا يوجد تقرير بعد</Typography>
      )}
    </Box>
  );
}
