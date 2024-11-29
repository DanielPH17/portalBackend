import { Router } from "express";
import { authRequiere } from "../middlewares/validateToken.js";
import {
  getCategorias,
  getCategoria,
  createCategorias,
  updateCategorias,
  deleteCategorias,
} from "../controllers/categorias.controller.js";

const router = Router();
router.get("/categorias", getCategorias);
router.get("/categorias/:id", getCategoria);
router.post("/categorias", authRequiere, createCategorias);
router.delete("/categorias/:id", authRequiere, deleteCategorias);
router.put("/categorias/:id", authRequiere, updateCategorias);
export default router;
