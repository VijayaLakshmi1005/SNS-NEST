export const initializeDesignerSockets = (io) => {
  const designerNamespace = io.of('/designers');

  designerNamespace.on('connection', (socket) => {
    console.log(`Designer socket connected: ${socket.id}`);

    socket.on('join_designer_room', (designerId) => {
      socket.join(`designer_${designerId}`);
      console.log(`Socket ${socket.id} joined room designer_${designerId}`);
    });

    socket.on('update_status', async (data) => {
      // Broadcast status change to admins and related clients
      designerNamespace.emit('designer_status_changed', data);
    });

    socket.on('typing', (data) => {
      socket.to(`designer_${data.designerId}`).emit('designer_typing', data);
    });

    socket.on('disconnect', () => {
      console.log(`Designer socket disconnected: ${socket.id}`);
    });
  });
};
