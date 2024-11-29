import mongoose from "mongoose";
import RespuestasModels from "./respuestas.models.js";

const comentarioSchema = new mongoose.Schema({
  noticia: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Noticia",
    required: true,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comentario: { type: String, required: true },
  fechaComentario: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  usuariosLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Agregar lista de usuarios que dieron "me gusta"
});

// Middleware pre-remove para eliminar respuestas en cascada
comentarioSchema.pre("findOneAndDelete", async function (next) {
  const comentarioId = this.getQuery()._id;
  try {
    // Eliminar respuestas relacionadas con el comentario
    await RespuestasModels.deleteMany({ comentario: comentarioId });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Comentario", comentarioSchema);
