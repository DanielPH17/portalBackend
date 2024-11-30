import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() }).fields([
  { name: "fotoDePerfil", maxCount: 1 },
  { name: "imagenDePortada", maxCount: 1 },
]);

export const register = async (req, res) => {
  const { email, password, username, role, fotoDePerfil, imagenDePortada } =
    req.body;
  try {
    const userFound = await User.findOne({ email });
    if (userFound)
      return res.status(400).json({ message: "The email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: passwordHash,
      role,
      fotoDePerfil,
      imagenDePortada,
    });

    const userSave = await newUser.save();
    const token = await createAccessToken({ id: userSave._id });

    res.cookie("token", token);
    res.json({
      id: userSave._id,
      username: userSave.username,
      email: userSave.email,
      role: userSave.role,
      fotoDePerfil: userSave.fotoDePerfil,
      imagenDePortada: userSave.imagenDePortada,
      createdAt: userSave.createdAt,
      updatedAt: userSave.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await User.findOne({ email });

    if (!userFound) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = await createAccessToken({ id: userFound._id });

    res.cookie("token", token, {
      httpOnly: true, // No accesible desde JavaScript
      secure: true, // Solo enviar la cookie a través de HTTPS
      sameSite: "None", // Asegurarse de que la cookie se envíe en solicitudes entre sitios
    });
    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      role: userFound.role,
      fotoDePerfil: userFound.fotoDePerfil,
      imagenDePortada: userFound.imagenDePortada,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);
  if (!userFound) return res.status(404).json({ message: "User not found" });
  return res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
    role: userFound.role,
    fotoDePerfil: userFound.fotoDePerfil,
    imagenDePortada: userFound.imagenDePortada,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
};

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.status(401).json({ message: "No autorizado" });
  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "No autorzado" });
    const userFound = await User.findById(user.id);
    if (!userFound) return res.status(401).json({ message: "No autorizado" });
    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
    });
  });
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Excluir el campo password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = (req, res) => {
  // Usamos el middleware de Multer para manejar los archivos subidos
  upload(req, res, async function (err) {
    if (err) {
      // Si ocurre un error con la carga del archivo
      return res.status(500).json({ message: "Error al subir imagen" });
    }

    try {
      // Buscar al usuario a actualizar por su ID
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const { username, role, password, oldPassword } = req.body;
      let fotoDePerfil = user.fotoDePerfil; // Mantener las imágenes actuales por defecto
      let imagenDePortada = user.imagenDePortada;

      // Verificar la contraseña anterior si se intenta cambiar la contraseña
      if (password && oldPassword) {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "La contraseña anterior no es correcta" });
        }

        // Si la contraseña anterior es correcta, encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword; // Actualizar la contraseña
      } else if (password) {
        return res
          .status(400)
          .json({ message: "Debes proporcionar la contraseña anterior" });
      }

      // Si se sube una nueva foto de perfil
      if (req.files && req.files.fotoDePerfil) {
        const storageRef = ref(
          storage,
          `users/${req.files.fotoDePerfil[0].originalname}`
        );
        try {
          const snapshot = await uploadBytes(
            storageRef,
            req.files.fotoDePerfil[0].buffer
          );
          fotoDePerfil = await getDownloadURL(snapshot.ref);

          // Eliminar la antigua si existe
          if (user.fotoDePerfil) {
            const oldImageRef = ref(storage, user.fotoDePerfil);
            await deleteObject(oldImageRef);
          }
        } catch (error) {
          console.error("Error al procesar la imagen de perfil:", error);
          return res
            .status(500)
            .json({ message: "Error al subir imagen de perfil" });
        }
      }

      // Si se sube una nueva imagen de portada
      if (req.files && req.files.imagenDePortada) {
        const storageRef = ref(
          storage,
          `users/${req.files.imagenDePortada[0].originalname}`
        );
        try {
          const snapshot = await uploadBytes(
            storageRef,
            req.files.imagenDePortada[0].buffer
          );
          imagenDePortada = await getDownloadURL(snapshot.ref);

          // Eliminar la antigua si existe
          if (user.imagenDePortada) {
            const oldImageRef = ref(storage, user.imagenDePortada);
            await deleteObject(oldImageRef);
          }
        } catch (error) {
          console.error("Error al procesar la imagen de portada:", error);
          return res
            .status(500)
            .json({ message: "Error al subir imagen de portada" });
        }
      }

      // Actualizar el usuario con los nuevos datos
      const userUpdate = await User.findByIdAndUpdate(
        req.params.id,
        {
          username: username || user.username,
          role: role,
          fotoDePerfil: fotoDePerfil,
          imagenDePortada: imagenDePortada,
          password: user.password, // Mantener la contraseña actualizada si se modificó
        },
        { new: true } // Retorna el documento actualizado
      );

      // Responder con los datos actualizados del usuario
      res.status(200).json({
        message: "Usuario actualizado exitosamente",
        user: {
          id: userUpdate._id,
          username: userUpdate.username,
          email: userUpdate.email,
          role: userUpdate.role,
          fotoDePerfil: userUpdate.fotoDePerfil,
          imagenDePortada: userUpdate.imagenDePortada,
          updatedAt: userUpdate.updatedAt,
        },
      });
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      res
        .status(500)
        .json({ message: "Error al actualizar usuario", error: error.message });
    }
  });
};
