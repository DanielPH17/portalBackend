import ResponsePostModels from "../models/responsePost.models.js";
import CommentPostModels from "../models/commentPost.models.js";

export const getAllPostResp = async (req, res) => {
  try {
    const respuestas = await ResponsePostModels.find()
      .populate("usuario", "username fotoDePerfil")
      .sort({
        fechaRespuesta: -1,
      });
    res.json(respuestas);
  } catch (error) {
    res.status(500).json({ message: "Algo salio mal" });
  }
};

export const getPostRespuestas = async (req, res) => {
  try {
    const respuestas = await ResponsePostModels.find({
      comentario: req.params.comentario,
    }).populate("usuario", "username fotoDePerfil");
    res.json(respuestas);
  } catch (error) {
    res.status(500).json({ message: "Algo salio mal" });
  }
};

export const createPostRespuesta = async (req, res) => {
  const { respuesta, comentario } = req.body;

  try {
    const nuevoComentario = await CommentPostModels.findById(comentario);
    if (!nuevoComentario)
      return res
        .status(404)
        .json({ message: "El comentario no ha sido encontrado" });

    const nuevaRespuesta = new ResponsePostModels({
      comentario: comentario,
      usuario: req.user.id,
      respuesta,
    });

    const saveRespuesta = await nuevaRespuesta.save();
    res.json(saveRespuesta);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear el comentario" });
  }
};

export const deletePostRespuesta = async (req, res) => {
  try {
    const respuesta = await ResponsePostModels.findByIdAndDelete(req.params.id);
    if (!respuesta)
      return res.status(404).json({ message: "Respuesta no encontrada" });

    return res.json({ message: "Respuesta eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar comentario " });
  }
};

export const updatePostRespuesta = async (req, res) => {
  try {
    const respuesta = await ResponsePostModels.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!respuesta)
      return res.status(404).json({ message: "Respuesta no encontrada" });

    res.json(respuesta);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar respuesta " });
  }
};
export const incrementarLikes = async (req, res) => {
  const userId = req.user.id;
  try {
    const respuesta = await ResponsePostModels.findById(req.params.id);
    if (!respuesta)
      return res.status(404).json({ message: "Respuesta no encontrada" });

    const yaLeDioLike = respuesta.usuariosLikes.includes(userId);
    if (yaLeDioLike) {
      respuesta.usuariosLikes.pull(userId);
      respuesta.likes -= 1;
    } else {
      respuesta.usuariosLikes.push(userId);
      respuesta.likes += 1;
    }

    await respuesta.save();
    res.json(respuesta);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar me gusta" });
  }
};
