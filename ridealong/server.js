// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

// Explicit configuration for standard App Router architectures
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize the Next.js Compiler pipeline
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Construct the raw Node HTTP Server underneath Next.js so Socket.io has a root to grab
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Core routing error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Inject WebSockets explicitly over the HTTP protocol stack
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client active [${socket.id}]`);

    // Channel Isolation: Restrict socket broadcasts exclusively to participants of a single trip
    socket.on('join_trip', (tripId) => {
      socket.join(`trip_${tripId}`);
      console.log(`👤 User joined secure trip channel: trip_${tripId}`);
    });

    socket.on('leave_trip', (tripId) => {
      socket.leave(`trip_${tripId}`);
      console.log(`🚪 User left secure trip channel: trip_${tripId}`);
    });

    // 1. High Frequency Telemetry (Live Map Tracking)
    socket.on('driver_location_update', (data) => {
      const { tripId, lat, lng } = data;
      // Emit exactly to isolating channel without bouncing to DB disk
      socket.to(`trip_${tripId}`).emit('driver_location', { lat, lng });
    });
    
    // 2. Chat Sync Protocol
    socket.on('new_chat_message', (data) => {
      const { tripId, message } = data;
      socket.to(`trip_${tripId}`).emit('chat_message', message);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client connection severed [${socket.id}]`);
    });
  });

  server.once('error', (err) => {
    console.error('Fatal Server Boot Error:', err);
    process.exit(1);
  });

  // Finally listen on port 3000 wrapping both protocols
  server.listen(port, () => {
    console.log(`> 🚀 Online and Broadcasting on http://${hostname}:${port} (Next.js v16 + Socket.io Engine v1)`);
  });
});
