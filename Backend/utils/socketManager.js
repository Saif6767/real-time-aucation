export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    socket.on("join_auction", (auctionId) => {
      socket.join(auctionId);
      console.log(`User joined auction ${auctionId}`);
    });

    socket.on("new_bid", (data) => {
      io.to(data.auctionId).emit("bid_update", data);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};
