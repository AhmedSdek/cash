import React, { useEffect, useState, useMemo } from "react";
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
  CircularProgress,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";

import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../store/itemsSlice";
import {
  createOrder,
  updateOrder,
  resetOrderState,
} from "../../store/cashierOrderSlice";

import _ from "lodash";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function DeliveryScreen() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [inputQty, setInputQty] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { loading: orderLoading } = useSelector((state) => state.order);
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  // console.log(editingOrder);

  useEffect(() => {
    if (customer?.branchId) {
      // لو العميل مرتبط بفرع معين، نجيب المنتجات بتاعته
      dispatch(fetchProducts({ branchId: customer.branchId }));
    }
  }, [dispatch, customer]);

  useEffect(() => {
    const editOrderData = JSON.parse(sessionStorage.getItem("editOrder"));
    if (editOrderData) {
      setEditingOrder(editOrderData);
      setCustomer(editOrderData.customerId || null);

      setOrderItems(
        editOrderData.items.map((item) => ({
          _id: item.productId?._id || item.productId,
          name: item.name,
          price: item.price,
          qty: item.quantity,
        }))
      );

      sessionStorage.removeItem("editOrder");
    } else {
      const data = JSON.parse(sessionStorage.getItem("customerData"));
      // console.log(data);
      if (data) setCustomer(data);
    }
  }, []);

  const categories = useMemo(() => _.groupBy(products, "category"), [products]);

  useEffect(() => {
    if (Object.keys(categories).length > 0 && !selectedCategory) {
      setSelectedCategory(Object.keys(categories)[0]);
    }
  }, [categories, selectedCategory]);

  const addItem = (item) => {
    if (orderLoading) return;
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
    if (orderLoading || orderItems.length === 0) return;
    const index =
      selectedItemIndex !== null ? selectedItemIndex : orderItems.length - 1;

    let newQty =
      inputQty === ""
        ? num.toString()
        : (inputQty + num.toString()).replace(/^0+/, "");
    if (newQty === "" || parseInt(newQty, 10) === 0) newQty = "1";

    setInputQty(newQty);
    const newItems = [...orderItems];
    newItems[index].qty = parseInt(newQty, 10);
    setOrderItems(newItems);
  };

  const removeItem = (index) => {
    if (orderLoading) return;
    const newItems = [...orderItems];
    newItems.splice(index, 1);
    setOrderItems(newItems);
    setSelectedItemIndex(null);
    setInputQty("");
  };

  const totalQty = orderItems.reduce((sum, x) => sum + x.qty, 0);
  const totalPrice = orderItems.reduce((sum, x) => sum + x.qty * x.price, 0);

  // ✅ حساب مصاريف التوصيل والإجمالي النهائي
  const deliveryFee = customer?.zoneId?.deliveryFee || 0;
  const totalWithDelivery = totalPrice + deliveryFee;

  const handlePay = () => setOpenDialog(true);

  const handleConfirmPay = async () => {
    if (orderItems.length === 0 || !customer) return;

    try {
      const orderData = {
        type: "DELIVERY",
        customerId: customer._id,
        branchId: customer.branchId,
        items: orderItems.map((item) => ({
          productId: item._id,
          quantity: item.qty,
        })),
        deliveryFee: customer?.zoneId?.deliveryFee || 0, // ← أضفنا مصاريف التوصيل
        zoneId: customer?.zoneId?._id || null, // ← أضفنا zoneId
      };

      if (editingOrder) {
        const updatedOrderData = {
          ...orderData,
          branchId: customer.branchId, // ✅ أضف الـ branchId هنا قبل الإرسال
        };

        const updated = await dispatch(
          updateOrder({ orderId: editingOrder._id, updates: updatedOrderData })
        ).unwrap();

        Swal.fire({
          icon: "success",
          title: "تم تعديل الأوردر بنجاح",
          showConfirmButton: false,
          timer: 1000,
        });
      } else {
        // إنشاء أوردر جديد
        const created = await dispatch(createOrder(orderData)).unwrap();
        if (created.order.customerId) {
          setCustomer(created.order.customerId);
        }
        Swal.fire({
          icon: "success",
          title: "تم إنشاء الأوردر بنجاح",
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      }
      // إعادة تهيئة الحالة بعد الدفع
      setOrderItems([]);
      setOpenDialog(false);
      setEditingOrder(null);
      dispatch(resetOrderState());

      // التوجيه حسب الدور
      let redirectPath = "/adminlayout/delivery";

      if (user?.role === "ADMIN") {
        redirectPath = "/adminlayout/delivery";
      } else if (user?.role === "CASHIER") {
        redirectPath = "/cashierlayout/delivery";
      } else if (user?.role === "CALL_CENTER_ADMIN") {
        redirectPath = "/callcenteradminlayout";
      } else if (user?.role === "CALL_CENTER_USER") {
        redirectPath = "/callcenteruserlayout";
      }

      navigate(redirectPath);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err || "حدث خطأ أثناء حفظ الأوردر",
      });
    }
  };

  return (
    <Stack sx={{ height: "calc(100vh - 64px)" }}>
      <Paper
        sx={{
          padding: "0 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ p: "0 10px" }}>
          🛵 {editingOrder ? "تعديل أوردر" : "أوردر جديد"}
        </Typography>
        {customer && (
          <>
            <Typography>الاسم: {customer.name}</Typography>
            <Typography>العنوان: {customer.address}</Typography>
            <Typography>الهاتف 1: {customer.phone1}</Typography>
            <Typography>الهاتف 2: {customer.phone2}</Typography>
            {customer.zoneId && (
              <Typography>
                الزون:
                {customer.zoneId.name
                  ? `${customer.zoneId.name} - ${customer.zoneId.deliveryFee} ج.م`
                  : customer.zoneId}
              </Typography>
            )}
          </>
        )}
      </Paper>

      <Box display="flex" height="100%" sx={{ padding: "5px 0 0 0 " }} gap={2}>
        {/* شاشة الطلب */}
        <Paper
          sx={{
            display: "flex",
            flexDirection: "column",
            p: "0 10px",
            width: "35%",
          }}
        >
          {/* <Typography variant="h6">الطلب الحالي</Typography> */}

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
            flex={1}
            overflow="auto"
            border="1px solid #ddd"
            borderTop="none"
            sx={{ maxHeight: "205px" }}
            onClick={() => {
              if (!orderLoading) {
                setSelectedItemIndex(null);
                setInputQty("");
              }
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
                  if (!orderLoading) {
                    setSelectedItemIndex(index);
                    setInputQty("");
                  }
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
                  disabled={orderLoading}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          {/* <Box mt={2}>
            <Typography>عدد الأصناف: {orderItems.length}</Typography>
            <Typography>إجمالي الأصناف: {totalPrice} ج.م</Typography>
            {customer?.zoneId && (
              <Typography>مصاريف التوصيل: {deliveryFee} ج.م</Typography>
            )}
            <Typography variant="h6" fontWeight="bold">
              الإجمالي الكلي: {totalWithDelivery} ج.م
            </Typography>
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
                    <TableCell align="right">{orderItems.length}</TableCell>{" "}
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Typography fontWeight="bold">إجمالي الأصناف</Typography>
                    </TableCell>
                    <TableCell align="right">{totalPrice} ج.م</TableCell>{" "}
                  </TableRow>
                  {customer?.zoneId && (
                    <TableRow>
                      <TableCell>
                        <Typography fontWeight="bold">
                          مصاريف التوصيل
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{deliveryFee} ج.م</TableCell>{" "}
                    </TableRow>
                  )}
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        الإجمالي الكلي
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="bold" color="primary">
                        {totalWithDelivery} ج.م
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
                  disabled={orderLoading}
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
              disabled={orderItems.length === 0 || orderLoading}
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
              onClick={handlePay}
              disabled={orderItems.length === 0 || orderLoading}
            >
              {editingOrder ? "تحديث" : "دفع"}
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
              {Object.keys(categories).map((cat) => (
                <SwiperSlide key={cat}>
                  <Button
                    fullWidth
                    variant={
                      cat === selectedCategory ? "contained" : "outlined"
                    }
                    onClick={() => setSelectedCategory(cat)}
                    disabled={orderLoading}
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

      {/* Dialog الدفع */}
      <Dialog
        open={openDialog}
        onClose={() => !orderLoading && setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تفاصيل الطلب</DialogTitle>
        <DialogContent dividers>
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

          <Typography>إجمالي الأصناف: {totalPrice} ج.م</Typography>
          {customer?.zoneId && (
            <Typography>مصاريف التوصيل: {deliveryFee} ج.م</Typography>
          )}
          <Typography variant="h6" fontWeight="bold">
            الإجمالي الكلي: {totalWithDelivery} ج.م
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="error"
            disabled={orderLoading}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmPay}
            color="success"
            variant="contained"
            disabled={orderLoading}
          >
            {orderLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : editingOrder ? (
              "تحديث الأوردر"
            ) : (
              "إكمال الدفع"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
