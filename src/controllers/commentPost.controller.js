import CommentsPostModels from "../models/commentPost.models.js";
import postModels from "../models/post.models.js";

export const getAllPostComents = async (req, res) => {
  try {
    const commentPost = await CommentsPostModels.find().sort({
      fechaComentario: -1,
    });
    res.json(commentPost);
  } catch (error) {
    return res.status(500).json({ message: "Algo salio mal" });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const commentPost = await CommentsPostModels.find({ post: req.params.post })
      .populate("usuario", "username fotoDePerfil")
      .sort({ fechaComentario: -1 });
    res.json(commentPost);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener comentarios" });
  }
};

export const createPostComment = async (req, res) => {
  const { comentario, post } = req.body;

  try {
    const nuevoPost = await postModels.findById(post);
    if (!nuevoPost)
      return res.status(404).json({ message: "Post no encontrado" });

    const nuevoPostComment = new CommentsPostModels({
      post: post,
      usuario: req.user.id,
      comentario,
    });

    const savePostComment = await nuevoPostComment.save();
    res.json(savePostComment);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear comentario" });
  }
};

export const deletePostComment = async (req, res) => {
  try {
    const commentPost = await CommentsPostModels.findByIdAndDelete(
      req.params.id
    );
    if (!commentPost)
      return res.status(404).json({ message: "Comentario no encontrado" });
    return res
      .status(200)
      .json({ message: "Comentario eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Erro al eliminar comentario" });
  }
};

export const updatePostComment = async (req, res) => {
  try {
    const commentPost = await CommentsPostModels.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!commentPost)
      return res.status(404).json({ message: "Comentario no encontrado" });
    res.json(commentPost);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar comentario " });
  }
};

export const incrementarLikes = async (req, res) => {
  const userId = req.user.id;
  try {
    const commentPost = await CommentsPostModels.findById(req.params.id);
    if (!commentPost)
      return res.status(404).json({ message: "Comentario no encontrado" });

    const yaLeDioLike = commentPost.usuariosLikes.includes(userId);
    if (yaLeDioLike) {
      commentPost.usuariosLikes.pull(userId);
      commentPost.likes -= 1;
    } else {
      commentPost.usuariosLikes.push(userId);
      commentPost.likes += 1;
    }

    await commentPost.save();
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar me gusta" });
  }
};
