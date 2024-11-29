import { Router } from "express";
import { authRequiere } from "../middlewares/validateToken.js";
import {
  getNoticias,
  getNoticia,
  crearNoticia,
  updateNoticia,
  deleteNoticia,
  incrementarLikes,
  getNoticiaReciente,
  get3NoticiasRecientes,
  getNoticiasMasLikes,
} from "../controllers/noticias.controller.js";

const router = Router();
//Rutas para el Home
router.get("/noticias/homeNoti", getNoticiaReciente);
router.get("/noticias/home3Noti", get3NoticiasRecientes);
router.get("/noticias/homeLikes", getNoticiasMasLikes);

router.get("/noticias", getNoticias);
router.get("/noticias/:id", getNoticia);
router.post("/noticias", authRequiere, crearNoticia);
router.delete("/noticias/:id", authRequiere, deleteNoticia);
router.put("/noticias/:id", authRequiere, updateNoticia);
router.patch("/noticias/:id/like", authRequiere, incrementarLikes);
export default router;
