import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import categoriasRoutes from "./routes/categorias.routes.js";
import noticiaRoutes from "./routes/noticia.routes.js";
import comentarioRoutes from "./routes/comentarios.routes.js";
import respuestasRoutes from "./routes/respuestas.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentPostRoutes from "./routes/postComment.routes.js";
import postResponseRoutes from "./routes/postResponse.routes.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.REACT_APP_URL_CORS,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use("/api", authRoutes);
app.use("/api", categoriasRoutes);
app.use("/api", noticiaRoutes);
app.use("/api", comentarioRoutes);
app.use("/api", respuestasRoutes);
app.use("/api", postRoutes);
app.use("/api", commentPostRoutes);
app.use("/api", postResponseRoutes);
export default app;
