import { Router } from "express";
import { authRequiere } from "../middlewares/validateToken.js";
import {
  getAllPostResp,
  getPostRespuestas,
  createPostRespuesta,
  updatePostRespuesta,
  deletePostRespuesta,
  incrementarLikes,
} from "../controllers/responsePost.controller.js";

const router = Router();
router.get("/postRespuestas", getAllPostResp);
router.get("/postComentario/:comentario", getPostRespuestas);
router.post("/postRespuestas", authRequiere, createPostRespuesta);
router.delete("/postRespuestas/:id", authRequiere, deletePostRespuesta);
router.put("/postRespuestas/:id", authRequiere, updatePostRespuesta);
router.patch("/postRespuestas/:id/like", authRequiere, incrementarLikes);
export default router;
