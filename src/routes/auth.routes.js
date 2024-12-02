import { Router } from "express";
import {
  register,
  login,
  logout,
  profile,
  verifyToken,
  getUsers,
  updateUser,
  createNewUser,
} from "../controllers/auth.controller.js";
import { authRequiere } from "../middlewares/validateToken.js";
import { validaSchema } from "../middlewares/validator.middleare.js";
import { registerSchema, loginSchema } from "../schemas/auth.schema.js";

const router = Router();
router.post("/register", validaSchema(registerSchema), register);
router.post("/registerNewUser", validaSchema(registerSchema), createNewUser);
router.post("/login", validaSchema(loginSchema), login);
router.post("/logout", logout);
router.get("/verify", verifyToken);
router.get("/profile", authRequiere, profile);
router.get("/usuarios", authRequiere, getUsers);
router.put("/usuarios/:id", authRequiere, updateUser);

export default router;
