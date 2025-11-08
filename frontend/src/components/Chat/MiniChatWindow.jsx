// في ملف ./components/Chat/MiniChatWindow.jsx

import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
// 💡 تم تعديل الاستيراد ليشمل loadChatHistory
import { setActiveChatUser, loadChatHistory } from "../../store/chatSlice";
import { sendPrivateMessage } from "../../socket";

// استيراد مكونات MUI
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress"; // 💡 لإظهار حالة التحميل

// استيراد أيقونات MUI
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";

const MiniChatWindow = () => {
  const dispatch = useDispatch();
  const { activeChatUserId, onlineUsers, messages } = useSelector(
    (state) => state.chat
  );
  const currentUser = useSelector((state) => state.auth.user);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false); // 💡 حالة التحميل
  const messagesEndRef = useRef(null);

  const activeUser = onlineUsers.find((u) => u.userId === activeChatUserId);
  const chatHistory = messages[activeChatUserId] || [];

  useEffect(() => {
    // 💡 دالة جلب سجل الشات
    const fetchChatHistory = async () => {
      // إذا كان سجل الشات فارغًا لهذا المستخدم، قم بجلبه
      if (activeChatUserId && chatHistory.length === 0 && currentUser?._id) {
        setIsLoadingHistory(true);
        try {
          // ملاحظة: يجب أن يحتوي الطلب على التوكن (Token) في الـ Headers
          const response = await fetch(
            `http://localhost:4000/api/chat/history/${activeChatUserId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`, // يجب أن يكون التوكن محفوظاً بهذه الطريقة
              },
            }
          );

          if (response.ok) {
            const history = await response.json();

            // 💡 هنا نقوم بإرسال Action لتحديث الـ Redux Store بالتاريخ القديم
            dispatch(
              loadChatHistory({
                userId: activeChatUserId,
                history: history,
              })
            );
          } else {
            console.error(
              "Failed to load chat history:",
              await response.text()
            );
          }
        } catch (error) {
          console.error("Error fetching chat history:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
    };

    fetchChatHistory(); // تمرير النافذة لأسفل عند إضافة رسالة جديدة

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // 💡 التبعيات: activeChatUserId لجلبه عند التغيير، و chatHistory.length لضمان التمرير لأسفل
  }, [activeChatUserId, chatHistory.length, currentUser]);

  if (!activeChatUserId || !activeUser) return null;

  const handleClose = () => {
    dispatch(setActiveChatUser(null)); // إغلاق النافذة
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) return;

    if (!currentUser || !currentUser.tenantId) {
      alert("خطأ: لا يمكن تحديد معرف المطعم (Tenant ID مفقود).");
      console.error(
        "❌ Failed to send message: currentUser or tenantId is missing."
      );
      return;
    }

    sendPrivateMessage({
      recipientId: activeChatUserId,
      message: trimmedMessage,
      senderId: currentUser._id,
      senderName: currentUser.name,
      tenantId: currentUser.tenantId,
    });

    setInputMessage("");
  };

  const MessageBubble = ({ msg, isSelf }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: isSelf ? "flex-end" : "flex-start",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 1,
          maxWidth: "80%",
          borderRadius: "12px",
          borderTopRightRadius: isSelf ? 0 : "12px",
          borderTopLeftRadius: isSelf ? "12px" : 0,
          backgroundColor: isSelf ? "primary.main" : "grey.200", // 💡 تغيير اللون
          color: isSelf ? "white" : "text.primary",
          wordBreak: "break-word",
        }}
      >
        <Typography variant="body2">{msg.message}</Typography>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "right",
            mt: 0.5,
            color: isSelf ? "rgba(255, 255, 255, 0.7)" : "text.secondary",
          }}
        >
          {new Date(msg.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <Paper
      elevation={10}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 300,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        zIndex: 1000,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          bgcolor: "primary.main",
          color: "white",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Typography variant="subtitle1" component="h3" fontWeight="bold">
          {activeUser.name}
        </Typography>

        <IconButton onClick={handleClose} color="inherit" size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {/* Messages Body */}
      <Stack
        spacing={1}
        sx={{
          p: 1.5,
          flexGrow: 1,
          overflowY: "auto",
          minHeight: 160,
          maxHeight: 320,
        }}
      >
        {/* 💡 عرض حالة التحميل أو سجل الشات */}
        {isLoadingHistory ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress size={20} />
          </Box>
        ) : (
          <>
            {chatHistory.map((msg, index) => (
              <MessageBubble
                key={msg._id || index}
                msg={msg}
                isSelf={msg.isSelf}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Stack>
      {/* Input Footer */}
      <Box
        component="form"
        onSubmit={handleSend}
        sx={{ p: 1.5, borderTop: 1, borderColor: "grey.200" }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="اكتب رسالتك..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={!currentUser || isLoadingHistory} // 💡 تعطيل الحقل أثناء التحميل
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={!inputMessage.trim() || isLoadingHistory} // 💡 تعطيل الزر أثناء التحميل
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Paper>
  );
};

export default MiniChatWindow;
