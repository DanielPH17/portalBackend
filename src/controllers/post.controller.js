import postModels from "../models/post.models.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase.js";

import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() }).single("imagen"); // Define el middleware de multer

export const getPosts = async (req, res) => {
  try {
    const post = await postModels
      .find()
      .sort({ fechaPost: -1 })
      .populate("usuario", "username fotoDePerfil");
    res.json(post);
  } catch (error) {
    return res.status(500).json({ message: "Algo salio mal" });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await postModels
      .findById(req.params.id)
      .populate("usuario", "username");
    if (!post) return res.status(404).json({ message: "Post no encontrado" });
    res.json(post);
  } catch (error) {
    return res.status(404).json({ message: "Noticia no encontrada" });
  }
};

export const createPost = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) return res.status(500).json({ message: "Error al subir imagen" });

    const { content } = req.body;
    let imagenUrl = null;

    // Si hay un archivo, intenta subirlo y obtener la URL
    if (req.file) {
      const storageRef = ref(storage, `post/${req.file.originalname}`);
      try {
        const snapshot = await uploadBytes(storageRef, req.file.buffer);
        imagenUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error al obtener URL de la imagen" });
      }
    }

    // Validar que haya al menos contenido o una imagen
    if ((!content || content.trim() === "") && !imagenUrl) {
      return res
        .status(400)
        .json({ message: "Debes proporcionar contenido o una imagen." });
    }

    try {
      // Crear el nuevo post
      const newPost = new postModels({
        usuario: req.user.id,
        content: content || null, // Si no hay contenido, lo guarda como null
        imagen: imagenUrl || null, // Si no hay imagen, lo guarda como null
      });

      const savePost = await newPost.save();
      res.status(201).json(savePost); // Enviar el post guardado como respuesta
    } catch (error) {
      return res.status(500).json({ message: "Error al crear noticia" });
    }
  });
};

export const deletePost = async (req, res) => {
  try {
    const post = await postModels.findById(req.params.id);
    if (!post)
      return res.status(404).json({ message: "Noticia no encontrada" });

    if (post.imagen) {
      const imagenRef = ref(storage, post.imagen);
      try {
        // Eliminar la imagen de Firebase Storage
        await deleteObject(imagenRef);
      } catch (error) {
        console.error("Error al eliminar la imagen de Firebase:", error);
        console.log(imagenRef);
        return res
          .status(500)
          .json({ message: "Error al eliminar la imagen asociada" });
      }
    }
    await postModels.findByIdAndDelete(req.params.id);

    res.json(post);
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar post " });
  }
};

export const updatePost = (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ message: "Error al subir imagen" });
    }

    try {
      // Verificar si el post existe
      const postExistente = await postModels.findById(req.params.id);
      if (!postExistente)
        return res.status(404).json({ message: "Post no encontrado." });

      const { content } = req.body;
      let imagenUrl = postExistente.imagen; // Mantener la imagen actual por defecto

      // Si se sube una nueva imagen
      if (req.file) {
        const storageRef = ref(storage, `post/${req.file.originalname}`);
        try {
          // Subir la nueva imagen
          const snapshot = await uploadBytes(storageRef, req.file.buffer);
          imagenUrl = await getDownloadURL(snapshot.ref);

          // Eliminar la imagen antigua si existe
          if (postExistente.imagen) {
            const oldImageRef = ref(storage, postExistente.imagen);
            await deleteObject(oldImageRef);
          }
        } catch (error) {
          console.error("Error al manejar la imagen:", error);
          return res
            .status(500)
            .json({ message: "Error al procesar la imagen." });
        }
      }

      // Validar que al menos uno de los campos sea actualizado
      if (!content && !req.file) {
        return res.status(400).json({
          message: "Debe proporcionar contenido o una nueva imagen.",
        });
      }

      // Actualizar el post
      const postActualizado = await postModels.findByIdAndUpdate(
        req.params.id,
        { content: content || postExistente.content, imagen: imagenUrl },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        message: "Post actualizado exitosamente.",
        post: postActualizado,
      });
    } catch (error) {
      console.error("Error al actualizar el post:", error);
      return res.status(500).json({ message: "Error al actualizar el post." });
    }
  });
};

export const incrementarLikes = async (req, res) => {
  const userId = req.user.id;

  try {
    const post = await postModels.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post no encontrado" });

    // Comprobar si el usuario ya dio "me gusta"
    const yaLeDioLike = post.usuariosLikes.includes(userId);

    if (yaLeDioLike) {
      // Si ya le dio "me gusta", quitamos el like y disminuimos el contador
      post.usuariosLikes.pull(userId);
      post.likes -= 1;
    } else {
      // Si no le dio "me gusta", lo agregamos a la lista y aumentamos el contador
      post.usuariosLikes.push(userId);
      post.likes += 1;
    }

    await post.save();

    res.json(post); // Responder con la noticia actualizada
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar me gusta" });
  }
};

export const getPostMaslikes = async (req, res) => {
  try {
    const likesNews = await postModels
      .find()
      .sort({ fechaPost: -1 })
      .limit(6)
      .populate("usuario", "username");
    res.json(likesNews);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener las noticias" });
  }
};
