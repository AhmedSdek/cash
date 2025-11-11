import { io } from "socket.io-client";

let socket; // 👈 متغير واحد عالمي

if (!socket) {
  socket = io("http://localhost:4000", {
    transports: ["websocket"],
    reconnection: true,
  });

  socket.on("connect", () => {
    console.log("🟢 Connected to Socket.io:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Disconnected from Socket.io");
  });
}

// 🔹 تتبع الغرف المنضم لها
const joinedRooms = new Set();

export const joinBranchRoom = (branchId) => {
  if (branchId && !joinedRooms.has(`branch_${branchId}`)) {
    socket.emit("joinBranch", branchId);
    joinedRooms.add(`branch_${branchId}`);
    // console.log("🏠 Joining branch room:", branchId);
  }
};

export const joinTenantRoom = (tenantId) => {
  if (tenantId && !joinedRooms.has(`tenant_${tenantId}`)) {
    socket.emit("joinTenant", tenantId);
    joinedRooms.add(`tenant_${tenantId}`);
    console.log("🏢 Joining tenant room:", tenantId);
  }
};

export const leaveBranchRoom = (branchId) => {
  if (branchId) {
    socket.emit("leaveBranch", branchId);
    joinedRooms.delete(`branch_${branchId}`);
    console.log("🚪 Leaving branch room:", branchId);
  }
};

export const leaveTenantRoom = (tenantId) => {
  if (tenantId) {
    socket.emit("leaveTenant", tenantId);
    joinedRooms.delete(`tenant_${tenantId}`);
    console.log("🚪 Leaving tenant room:", tenantId);
  }
};

// 💬 دالة إرسال الرسائل الخاصة الجديدة للدردشة
export const sendPrivateMessage = ({
  recipientId,
  message,
  senderId,
  senderName,
  tenantId, // ✅ هذا هو المكان الصحيح لاستقباله
}) => {
  if (socket.connected) {
    socket.emit("privateMessage", {
      recipientId,
      message,
      senderId,
      senderName,
      tenantId, // ✅ وهذا هو المكان الصحيح لإرساله
    });
    console.log(`✉️ Sending private message to ${recipientId}`);
  } else {
    console.error("❌ Socket not connected, cannot send message.");
  }
};

export default socket;
