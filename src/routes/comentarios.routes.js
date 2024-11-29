import { Router } from "express";
import { authRequiere } from "../middlewares/validateToken.js";
import {
  getAllComents,
  getComentarios,
  createComentario,
  deleteComentario,
  updateComentario,
  incrementarLikes,
} from "../controllers/comentarios.controller.js";

const router = Router();
router.get("/comentarios", getAllComents);
router.get("/noticia/:noticia", getComentarios);
router.post("/comentarios", authRequiere, createComentario);
router.delete("/comentarios/:id", authRequiere, deleteComentario);
router.put("/comentarios/:id", authRequiere, updateComentario);
router.patch("/comentarios/:id/like", authRequiere, incrementarLikes);
export default router;
