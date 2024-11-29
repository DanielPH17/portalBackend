import { Router } from "express";
import { authRequiere } from "../middlewares/validateToken.js";
import {
  getAllPostComents,
  getPostComments,
  createPostComment,
  deletePostComment,
  updatePostComment,
  incrementarLikes,
} from "../controllers/commentPost.controller.js";

const router = Router();
router.get("/postComentarios", getAllPostComents);
router.get("/post/:post", getPostComments);
router.post("/postComentarios", authRequiere, createPostComment);
router.delete("/postComentarios/:id", authRequiere, deletePostComment);
router.put("/postComentarios/:id", authRequiere, updatePostComment);
router.patch("/postComentarios/:id/like", authRequiere, incrementarLikes);
export default router;
