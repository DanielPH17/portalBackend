import NoticiasModels from "../models/noticias.models.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../firebase.js";
import { io } from "../index.js";

import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() }).single("imagen"); // Define el middleware de multer

export const getNoticias = async (req, res) => {
  try {
    const noticias = await NoticiasModels.find()
      .sort({ fechaCreacion: -1 })
      .populate("categoria", "title");
    res.json(noticias);
  } catch (error) {
    return res.status(500).json({ message: "Algo salio mal" });
  }
};

export const getNoticia = async (req, res) => {
  try {
    const noticia = await NoticiasModels.findById(req.params.id).populate(
      "categoria",
      "title"
    );
    if (!noticia)
      return res.status(404).json({ message: "Noticia no encontrada" });
    res.json(noticia);
  } catch (error) {
    return res.status(404).json({ message: "Noticia no encontrada" });
  }
};

export const crearNoticia = async (req, res) => {
  upload(req, res, async function (err) {
    if (err)
      return res.status(500).json({ message: "Error al subir la imagen" });

    const { title, description, content, categoria } = req.body;
    let imageUrl = "";

    if (req.file) {
      const storageRef = ref(storage, `noticias/${req.file.originalname}`);
      try {
        const snapshot = await uploadBytes(storageRef, req.file.buffer);
        imageUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error al obtener URL de la imagen" });
      }
    }

    try {
      const newNoticia = new NoticiasModels({
        title,
        description,
        content,
        categoria,
        imagen: imageUrl,
      });
      const saveNoticia = await newNoticia.save();
      // Emitir evento en tiempo real para notificar a todos los clientes conectados
      io.emit("nueva-noticia", {
        message: "Se ha publicado una nueva noticia",
        noticia: saveNoticia, // Enviar la noticia recién creada
      });

      res.json(saveNoticia);
    } catch (error) {
      return res.status(500).json({ message: "Error al crear noticia" });
    }
  });
};

export const deleteNoticia = async (req, res) => {
  try {
    // Buscar la noticia antes de eliminarla para obtener la URL de la imagen
    const noticia = await NoticiasModels.findById(req.params.id);
    if (!noticia)
      return res.status(404).json({ message: "Noticia no encontrada" });

    // Extraer el path de la imagen de la URL de Firebase
    if (noticia.imagen) {
      const imageRef = ref(storage, noticia.imagen);
      try {
        // Eliminar la imagen de Firebase Storage
        await deleteObject(imageRef);
      } catch (error) {
        console.error("Error al eliminar la imagen de Firebase:", error);
        console.log(imageRef);
        return res
          .status(500)
          .json({ message: "Error al eliminar la imagen asociada" });
      }
    }

    await NoticiasModels.findByIdAndDelete(req.params.id);
    if (!noticia)
      return res.status(500).json({ message: "Noticia no encontrada" });
    res.json(noticia);
  } catch (error) {
    return res.status(500).json({ message: "Error eliminar noticia " });
  }
};

export const updateNoticia = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ message: "Error al subir la imagen" });
    }

    try {
      // Buscar la noticia existente
      const noticiaExistente = await NoticiasModels.findById(req.params.id);

      if (!noticiaExistente) {
        return res.status(404).json({ message: "Noticia no encontrada" });
      }

      const { title, description, content, categoria } = req.body;

      // Usar la URL de la imagen existente si no se sube una nueva
      let imageUrl = noticiaExistente.imagen;

      // Si se sube una nueva imagen, procesarla y obtener la URL
      if (req.file) {
        const storageRef = ref(storage, `noticias/${req.file.originalname}`);
        try {
          // Subir la nueva imagen
          const snapshot = await uploadBytes(storageRef, req.file.buffer);
          imageUrl = await getDownloadURL(snapshot.ref);

          // Si existe una imagen anterior, eliminarla
          if (noticiaExistente.imagen) {
            const oldImageRef = ref(storage, noticiaExistente.imagen);
            try {
              await deleteObject(oldImageRef);
            } catch (error) {
              console.error("Error al eliminar la imagen anterior:", error);
              return res.status(500).json({
                message:
                  "Error al eliminar la imagen anterior del almacenamiento",
              });
            }
          }
        } catch (error) {
          return res
            .status(500)
            .json({ message: "Error al obtener URL de la nueva imagen" });
        }
      }

      // Actualizar la noticia con los datos nuevos o existentes
      const noticiaActualizada = await NoticiasModels.findByIdAndUpdate(
        req.params.id,
        {
          title,
          description,
          content,
          categoria,
          imagen: imageUrl, // Usar la URL nueva o existente
        },
        { new: true } // Devuelve el documento actualizado
      );
      io.emit("noticia-actualizada", {
        noticia: noticiaActualizada, // Este es el objeto de la noticia actualizada
      });

      res.json({
        message: "Noticia actualizada exitosamente",
        noticia: noticiaActualizada,
      });
    } catch (error) {
      console.error("Error al actualizar noticia:", error);
      return res.status(500).json({ message: "Error al actualizar noticias" });
    }
  });
};

//Funcion para incrementar los likes y guardar el usuario que ya le dio me gusta
export const incrementarLikes = async (req, res) => {
  const userId = req.user.id;

  try {
    const noticia = await NoticiasModels.findById(req.params.id);
    if (!noticia)
      return res.status(404).json({ message: "Noticia no encontrada" });

    // Comprobar si el usuario ya dio "me gusta"
    const yaLeDioLike = noticia.usuariosLikes.includes(userId);

    if (yaLeDioLike) {
      // Si ya le dio "me gusta", quitamos el like y disminuimos el contador
      noticia.usuariosLikes.pull(userId);
      noticia.likes -= 1;
    } else {
      // Si no le dio "me gusta", lo agregamos a la lista y aumentamos el contador
      noticia.usuariosLikes.push(userId);
      noticia.likes += 1;
    }

    await noticia.save();

    res.json(noticia); // Responder con la noticia actualizada
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar me gusta" });
  }
};

//Metodos para llamar al home la noticia mas reciente, las 3 que le siguen, y 3 con mas likes

export const getNoticiaReciente = async (req, res) => {
  try {
    const newNotica = await NoticiasModels.findOne()
      .sort({ fechaCreacion: -1 })
      .populate("categoria", "title");
    res.json(newNotica);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener una nueva noticia" });
  }
};

export const get3NoticiasRecientes = async (req, res) => {
  try {
    const othersNews = await NoticiasModels.find()
      .sort({ fechaCreacion: -1 })
      .skip(1)
      .limit(3)
      .populate("categoria", "title");
    res.json(othersNews);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener las noticias" });
  }
};

export const getNoticiasMasLikes = async (req, res) => {
  try {
    const masLikes = await NoticiasModels.find()
      .sort({ likes: -1 })
      .limit(3)
      .populate("categoria", "title");
    res.json(masLikes);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener las noticias" });
  }
};
