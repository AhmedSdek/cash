import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  IconButton,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Table,
  TableContainer,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "./styles.css";
import { Navigation } from "swiper/modules";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../store/itemsSlice";
import { createOrder, resetOrderState } from "../../store/cashierOrderSlice";

export default function CashierScreen() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [inputQty, setInputQty] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [amountGiven, setAmountGiven] = useState(""); // المبلغ اللي العميل دفعه
  const [change, setChange] = useState(0); // الباقي
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);

  // ✅ Ref لقائمة الأصناف
  const orderListRef = useRef(null);

  const categories = [...new Set(products.map((p) => p.category))];

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0 && !selectedCategory) {
      setSelectedCategory(products[0].category);
    }
  }, [products]);

  // ✅ كل ما يتغير orderItems، انزل لآخر عنصر
  useEffect(() => {
    if (orderListRef.current) {
      orderListRef.current.scrollTop = orderListRef.current.scrollHeight;
    }
  }, [orderItems]);

  const addItem = (item) => {
    const exist = orderItems.find((x) => x._id === item._id);
    if (exist) {
      setOrderItems(
        orderItems.map((x) =>
          x._id === item._id ? { ...x, qty: x.qty + 1 } : x
        )
      );
    } else {
      setOrderItems([...orderItems, { ...item, qty: 1 }]);
    }
    setSelectedItemIndex(orderItems.length);
    setInputQty("");
  };

  const updateQty = (num) => {
    if (orderItems.length === 0) return;
    const index =
      selectedItemIndex !== null ? selectedItemIndex : orderItems.length - 1;
    let newQty =
      inputQty === "" ? num.toString() : (inputQty + num).replace(/^0+/, "");
    if (newQty === "" || parseInt(newQty, 10) === 0) newQty = "1";

    setInputQty(newQty);
    const newItems = [...orderItems];
    newItems[index].qty = parseInt(newQty, 10);
    setOrderItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
    setSelectedItemIndex(null);
    setInputQty("");
  };

  const totalQty = orderItems.reduce((sum, x) => sum + x.qty, 0);
  const totalPrice = orderItems.reduce((sum, x) => sum + x.qty * x.price, 0);

  // حساب الباقي تلقائي
  useEffect(() => {
    const given = parseFloat(amountGiven) || 0;
    setChange(given - totalPrice);
  }, [amountGiven, totalPrice]);

  const handlePay = () => setOpenDialog(true);

  const handleConfirmPay = () => {
    if (orderItems.length === 0) return;

    setLoading(true);
    const orderData = {
      type: "TAKEAWAY",
      items: orderItems.map((x) => ({
        productId: x._id,
        quantity: x.qty,
      })),
    };

    dispatch(createOrder(orderData))
      .unwrap()
      .then((res) => {
        console.log("تم إنشاء الأوردر ✅", res);

        // الطباعة مباشرة
        const printContent = `
          <h2>فاتورة الطلب</h2>
          <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse; text-align: center;">
            <thead>
              <tr>
                <th>الصنف</th>
                <th>الكمية</th>
                <th>السعر</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.qty}</td>
                  <td>${item.price}</td>
                  <td>${item.qty * item.price}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <h3>الإجمالي: ${totalPrice} ج.م</h3>
          <h3>المبلغ المدفوع: ${amountGiven || 0} ج.م</h3>
          <h3>الباقي: ${change < 0 ? 0 : change} ج.م</h3>
        `;

        const win = window.open("", "_blank", "width=600,height=600");
        win.document.write(`
          <html>
            <head>
              <title>فاتورة الطلب</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #000; padding: 8px; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        win.document.close();
        win.print();

        setOrderItems([]);
        setSelectedItemIndex(null);
        setInputQty("");
        setAmountGiven("");
        setChange(0);
        setOpenDialog(false);
        dispatch(resetOrderState());
      })
      .catch((err) => {
        console.error("خطأ في إرسال الأوردر ❌", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Stack sx={{ height: "calc(100vh - 64px)" }}>
      <Box display="flex" height="100%" p={2} gap={2}>
        {/* شاشة الطلب */}
        <Paper
          sx={{ display: "flex", flexDirection: "column", p: 2, width: "35%" }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            fontWeight="bold"
            bgcolor="#f5f5f5"
            p={1}
          >
            <Typography sx={{ flex: 2 }}>الصنف</Typography>
            <Typography sx={{ flex: 1, textAlign: "center" }}>السعر</Typography>
            <Typography sx={{ flex: 1, textAlign: "center" }}>
              الكمية
            </Typography>
            <Typography sx={{ flex: 1, textAlign: "center" }}>
              الإجمالي
            </Typography>
            <Typography sx={{ width: 50, textAlign: "center" }}>حذف</Typography>
          </Box>

          <Box
            ref={orderListRef} // ✅ أضفنا الـ ref هنا
            flex={1}
            overflow="auto"
            border="1px solid #ddd"
            borderTop="none"
            sx={{ maxHeight: "235px" }}
            onClick={() => {
              setSelectedItemIndex(null);
              setInputQty("");
            }}
          >
            {orderItems.map((item, index) => (
              <Box
                key={item._id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={1}
                bgcolor={selectedItemIndex === index ? "#e0f7fa" : "white"}
                borderBottom="1px solid #eee"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItemIndex(index);
                  setInputQty("");
                }}
              >
                <Typography sx={{ flex: 2 }}>{item.name}</Typography>
                <Typography sx={{ flex: 1, textAlign: "center" }}>
                  {item.price}
                </Typography>
                <Typography sx={{ flex: 1, textAlign: "center" }}>
                  {item.qty}
                </Typography>
                <Typography sx={{ flex: 1, textAlign: "center" }}>
                  {item.qty * item.price}
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(index);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          {/* <Box mt={2}>
            <Typography>عدد الأصناف: {orderItems.length}</Typography>
            <Typography>إجمالي السعر: {totalPrice} ج.م</Typography>
          </Box> */}
          <Box>
            <TableContainer
              component={Paper}
              sx={{ mx: "auto", borderRadius: 2 }}
            >
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">عدد الأصناف</Typography>
                    </TableCell>
                    <TableCell align="right">{orderItems.length}</TableCell>
                  </TableRow>

                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        الإجمالي الكلي
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        {totalPrice} ج.م
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Grid container spacing={1} mt={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <Grid item xs={4} key={num}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => updateQty(num)}
                >
                  {num}
                </Button>
              </Grid>
            ))}
          </Grid>

          <Box display="flex" gap={1} mt={2}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              disabled={orderItems.length === 0 || loading}
              onClick={() => {
                setOrderItems([]);
                setSelectedItemIndex(null);
                setInputQty("");
              }}
            >
              مسح الكل
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="success"
              disabled={orderItems.length === 0 || loading}
              onClick={handlePay}
            >
              دفع
            </Button>
          </Box>
        </Paper>

        {/* الأصناف */}
        <Paper sx={{ display: "flex", flexDirection: "column", width: "65%" }}>
          <Stack sx={{ padding: "5px" }}>
            <Swiper
              slidesPerView={5}
              spaceBetween={10}
              navigation
              modules={[Navigation]}
            >
              {categories.map((cat) => (
                <SwiperSlide key={cat}>
                  <Button
                    fullWidth
                    variant={
                      cat === selectedCategory ? "contained" : "outlined"
                    }
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Button>
                </SwiperSlide>
              ))}
            </Swiper>
          </Stack>
          <Divider />
          <Stack
            sx={{
              flexDirection: "row",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "space-between",
              p: 2,
              overflow: "auto",
            }}
          >
            {products
              .filter((p) => p.category === selectedCategory)
              .map((item) => (
                <Button
                  sx={{
                    height: 80,
                    width: 120,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  onClick={() => addItem(item)}
                  variant="contained"
                  key={item._id}
                >
                  <Typography variant="body1">{item.name}</Typography>
                  <Typography variant="body2">{item.price} ج.م</Typography>
                </Button>
              ))}
          </Stack>
        </Paper>
      </Box>

      {/* Dialog تفاصيل الأوردر */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullScreen>
        <DialogTitle>تفاصيل الطلب</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", height: "100%" }}>
            <Box
              sx={{
                width: "50%",
                borderRight: "1px solid #ddd",
                pr: 2,
                overflow: "auto",
              }}
            >
              {orderItems.map((item, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent="space-between"
                  mb={1}
                  sx={{ borderBottom: "1px solid #eee", pb: 1 }}
                >
                  <Typography>
                    {item.name} x {item.qty}
                  </Typography>
                  <Typography>{item.qty * item.price} ج.م</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 1 }} />
            </Box>

            <Box
              sx={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                pl: 2,
              }}
            >
              <Typography variant="subtitle1" mb={1}>
                المبلغ المدفوع من العميل
              </Typography>
              <TextField
                value={amountGiven}
                InputProps={{ readOnly: true }}
                fullWidth
                sx={{ mb: 2 }}
              />

              <Box sx={{ flex: 1 }}>
                {[[1, 2, 3], [4, 5, 6], [7, 8, 9], [0]].map((row, rowIndex) => (
                  <Grid container spacing={1} mb={1} key={rowIndex}>
                    {row.map((num) => (
                      <Grid item xs={4} key={num}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() =>
                            setAmountGiven((prev) =>
                              (prev + num.toString()).replace(/^0+/, "")
                            )
                          }
                        >
                          {num}
                        </Button>
                      </Grid>
                    ))}
                    {rowIndex === 3 && (
                      <>
                        <Grid item xs={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            onClick={() => setAmountGiven("")}
                          >
                            مسح
                          </Button>
                        </Grid>
                        <Grid item xs={4}>
                          <Button
                            fullWidth
                            variant="outlined"
                            color="primary"
                            onClick={() =>
                              setAmountGiven(totalPrice.toString())
                            }
                          >
                            دفع كامل
                          </Button>
                        </Grid>
                      </>
                    )}
                  </Grid>
                ))}
              </Box>

              <Typography mt={2}>
                الباقي: {change < 0 ? 0 : change} ج.م
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between", p: 2 }}
        >
          <Typography variant="h6">الإجمالي: {totalPrice} ج.م</Typography>

          <Stack sx={{ flexDirection: "row" }}>
            <Button
              onClick={() => setOpenDialog(false)}
              color="error"
              disabled={loading}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirmPay}
              color="success"
              variant="contained"
              disabled={loading || totalPrice === 0}
            >
              {loading ? <CircularProgress size={24} /> : "إكمال الدفع وطباعه"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
