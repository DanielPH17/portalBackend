import app from "./app.js"; // Importa tu aplicación Express
import { ConnectDB } from "./db.js"; // Importa tu función para conectar con la base de datos
import { createServer } from "http"; // Importa createServer de Node.js
import { Server } from "socket.io"; // Importa Server de Socket.IO

// Conecta con la base de datos
ConnectDB();

// Crea un servidor HTTP a partir de tu aplicación Express
const httpServer = createServer(app);

// Configura Socket.IO con el servidor HTTP
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.REACT_APP_URL_CORS,
    methods: ["PUT", "POST"],
    credentials: true,
  },
});

// Establecer la conexión de Socket.IO
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  // Cuando un cliente se desconecta
  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

// Inicia el servidor HTTP en el puerto 5000
httpServer.listen(5000, () => {
  console.log("Server on");
});
