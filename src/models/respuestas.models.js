import mongoose from "mongoose";

// Esquema para respuestas
const responsePostSchema = new mongoose.Schema({
  comentario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comentario", //Referencia al modelo de comentario
    required: true,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Referencia al modelo de usuario
    required: true,
  },
  respuesta: {
    type: String,
    required: true,
  },
  fechaRespuesta: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  usuariosLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Agregar lista de usuarios que dieron "me gusta"
});
export default mongoose.model("Respuesta", responsePostSchema);
