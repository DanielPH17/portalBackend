import { Router } from "express";
import { authRequiere } from "../middlewares/validateToken.js";
import {
  getAllResp,
  getRespuestas,
  createRespuesta,
  updateRespuesta,
  deleteRespuesta,
  incrementarLikes,
} from "../controllers/respuestas.controller.js";

const router = Router();
router.get("/respuestas", getAllResp);
router.get("/comentario/:comentario", getRespuestas);
router.post("/respuestas", authRequiere, createRespuesta);
router.delete("/respuestas/:id", authRequiere, deleteRespuesta);
router.put("/respuestas/:id", authRequiere, updateRespuesta);
router.patch("/respuestas/:id/like", authRequiere, incrementarLikes);

export default router;
