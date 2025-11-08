import React, { useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOutDeliveries,
  setDeliveryAvailable,
} from "../../store/deliverySlice";

const DeliverysList = () => {
  const dispatch = useDispatch();

  // ✅ التعديل الرئيسي: استخدام 'outList' بدلاً من 'list'
  // واستخدام قيمة افتراضية آمنة في حالة عدم وجود الـ state
  const { outList, loading } = useSelector((state) => state.deliverylist || {});

  // ✅ معالجة أكثر أمانًا لجلب branchId
  const userJson = localStorage.getItem("user");
  const { branchId } = userJson ? JSON.parse(userJson) : {};

  useEffect(() => {
    // التأكد من وجود branchId قبل إرسال الـ Thunk
    if (branchId) {
      dispatch(fetchOutDeliveries(branchId));
    }
    // 💡 يمكن إضافة حالة خطأ هنا إذا لم يتم العثور على branchId
  }, [dispatch, branchId]);

  const handleSetAvailable = (deliveryId) => {
    // 💡 يُفضل وضع "loading state" هنا أو منع الضغط المتعدد
    dispatch(setDeliveryAvailable(deliveryId));
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h5"
        sx={{
          mb: 3,
          fontWeight: "bold",
          textAlign: "center",
          color: "primary.main",
        }}
      >
        Out Deliverys
      </Typography>

      {/* ✅ استخدام outList هنا */}
      {outList?.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          لا يوجد دليفريه حالياً 😊
        </Typography>
      ) : (
        <Grid container spacing={2} direction="column" alignItems="center">
          {/* ✅ استخدام outList هنا */}
          {outList.map((d) => (
            <Grid
              item
              xs={12}
              key={d._id}
              sx={{ width: "100%", maxWidth: 500 }}
            >
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  width: "100%",
                  transition: "0.3s",
                  "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6" fontWeight="bold">
                    {d.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {d.phone}
                  </Typography>

                  <Box sx={{ my: 2 }}>
                    <Chip
                      label={d.status === "available" ? "available" : "out"}
                      color={d.status === "available" ? "success" : "warning"}
                    />
                  </Box>

                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleSetAvailable(d._id)}
                    sx={{ borderRadius: 2, width: "100%" }}
                  >
                    Available
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DeliverysList;
