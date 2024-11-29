import mongoose from "mongoose";
import ComentariosModels from "./comentarios.models.js";
import RespuestasModels from "./respuestas.models.js";

const noticiaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  content: { type: String, required: true },
  imagen: { type: String, required: true },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categoria",
    required: true,
  },
  fechaCreacion: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  usuariosLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Agregar lista de usuarios que dieron "me gusta"
  compartidos: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Middleware pre-remove para eliminar comentarios y respuestas en cascada
noticiaSchema.pre("findOneAndDelete", async function (next) {
  const noticiaId = this.getQuery()._id;
  try {
    // Encontrar comentarios relacionados
    const comentarios = await ComentariosModels.find({ noticia: noticiaId });
    const comentarioIds = comentarios.map((comentario) => comentario._id);

    // Eliminar comentarios de la noticia
    await ComentariosModels.deleteMany({ noticia: noticiaId });
    // Eliminar respuestas asociadas a esos comentarios
    await RespuestasModels.deleteMany({ comentario: { $in: comentarioIds } });

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Noticia", noticiaSchema);
