import ComentariosModels from "../models/comentarios.models.js";
import NoticiasModels from "../models/noticias.models.js";

export const getAllComents = async (req, res) => {
  try {
    const comentarios = await ComentariosModels.find().sort({
      fechaComentario: -1,
    });
    res.json(comentarios);
  } catch (error) {
    return res.status(500).json({ message: "Algo salio mal " });
  }
};

export const getComentarios = async (req, res) => {
  try {
    const comentarios = await ComentariosModels.find({
      noticia: req.params.noticia,
    })
      .populate("usuario", "username fotoDePerfil")
      .sort({
        fechaComentario: -1,
      });
    res.json(comentarios);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener los comentarios" });
  }
};

export const createComentario = async (req, res) => {
  const { comentario, noticia } = req.body;

  try {
    const nuevaNoticia = await NoticiasModels.findById(noticia);
    if (!nuevaNoticia)
      return res.status(404).json({ message: "Noticia no encontrada" });

    const nuevoComentario = new ComentariosModels({
      noticia: noticia,
      usuario: req.user.id,
      comentario,
    });

    const saveComentario = await nuevoComentario.save();
    res.json(saveComentario);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear comentario" });
  }
};

export const deleteComentario = async (req, res) => {
  try {
    const comentario = await ComentariosModels.findByIdAndDelete(req.params.id);
    if (!comentario)
      return res.status(404).json({ message: "Comentario no encontrado" });

    res.status(200).json({ message: "Comentario eliminado correctamente" });
    //await comentario.remove()
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar comentario" });
  }
};

export const updateComentario = async (req, res) => {
  try {
    const comentario = await ComentariosModels.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!comentario)
      return res.status(404).json({ message: "Comentario no encontrado " });
    res.json(comentario);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar comentario" });
  }
};

export const incrementarLikes = async (req, res) => {
  const userId = req.user.id;
  try {
    const comentario = await ComentariosModels.findById(req.params.id);
    if (!comentario)
      return res.status(404).json({ message: "Comentario no encontrado" });

    const yaLeDioLike = comentario.usuariosLikes.includes(userId);
    if (yaLeDioLike) {
      comentario.usuariosLikes.pull(userId);
      comentario.likes -= 1;
    } else {
      comentario.usuariosLikes.push(userId);
      comentario.likes += 1;
    }

    await comentario.save();
    res.json(comentario);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar me gusta" });
  }
};
