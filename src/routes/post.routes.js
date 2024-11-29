import { Router } from "express";
import { authRequiere } from "../middlewares/validateToken.js";
import {
  getPosts,
  getPost,
  createPost,
  deletePost,
  updatePost,
  incrementarLikes,
  getPostMaslikes,
} from "../controllers/post.controller.js";

const router = Router();

router.get("/posts/MasLikes", getPostMaslikes);

router.get("/posts", getPosts);
router.get("/posts/:id", getPost);
router.post("/posts", authRequiere, createPost);
router.delete("/posts/:id", authRequiere, deletePost);
router.put("/posts/:id", authRequiere, updatePost);
router.patch("/posts/:id/like", authRequiere, incrementarLikes);
export default router;
