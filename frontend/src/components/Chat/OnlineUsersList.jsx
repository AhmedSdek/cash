// في ملف ./components/Chat/OnlineUsersList.jsx

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActiveChatUser, toggleChatList } from "../../store/chatSlice";

// استيراد مكونات MUI
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

// استيراد أيقونات MUI
import CloseIcon from "@mui/icons-material/Close";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"; // للدائرة الخضراء (Online indicator)

const OnlineUsersList = () => {
  const dispatch = useDispatch();
  const { isChatListOpen, onlineUsers } = useSelector((state) => state.chat); // 🛑 ملاحظة: يُفضل استخدام optional chaining لتجنب الأخطاء إذا لم يكن user موجودًا
  const currentUserId = useSelector((state) => state.auth.user?._id);

  if (!isChatListOpen) return null; // تصفية المستخدم الحالي

  const usersToChatWith = onlineUsers.filter((u) => u.userId !== currentUserId);

  const handleUserClick = (user) => {
    dispatch(setActiveChatUser(user.userId)); // نفتح نافذة الشات لهذا المستخدم // يمكنك هنا إضافة dispatch(toggleChatList()) لإغلاق القائمة بعد الاختيار
  };

  return (
    // Box يستخدم لتحديد الموضع الثابت (Fixed positioning)
    <Box
      sx={{
        position: "fixed",
        bottom: 70, // فوق الزر العائم
        right: 24,
        zIndex: 1000,
      }}>
      <Paper
        elevation={10}
        sx={{
          width: 256,
          borderRadius: 2,
          overflow: "hidden",
        }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: 1.5,
            backgroundColor: "grey.50", // لون خلفية خفيف
            borderBottom: 1,
            borderColor: "grey.200",
          }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold", color: "text.primary" }}>
            المستخدمون الأونلاين ({usersToChatWith.length})
          </Typography>
          <IconButton
            onClick={() => dispatch(toggleChatList())}
            size="small"
            color="inherit">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {/* Users List */}
        <List dense sx={{ maxHeight: 256, overflowY: "auto", p: 0 }}>
          {usersToChatWith.length > 0 ? (
            usersToChatWith.map((user) => (
              <ListItemButton
                key={user.userId}
                onClick={() => handleUserClick(user)}
                sx={{ "&:hover": { backgroundColor: "action.hover" } }}>
                <ListItemText
                  primary={user.name}
                  primaryTypographyProps={{ fontWeight: "medium" }}
                />
                {/* Online Indicator */}
                <FiberManualRecordIcon
                  sx={{ color: "success.main", fontSize: "small" }}
                  titleAccess="Online"
                />
              </ListItemButton>
            ))
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ p: 2 }}>
              لا يوجد مستخدمون آخرون متصلون حالياً.
            </Typography>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default OnlineUsersList;
