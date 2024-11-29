import mongoose from "mongoose";
import ResponsePostModels from "./responsePost.models.js";

const commentPostSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comentario: { type: String, required: true },
  fechaComentario: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  usuariosLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

commentPostSchema.pre("findOneAndDelete", async function (next) {
  const comentarioId = this.getQuery()._id;
  try {
    await ResponsePostModels.deleteMany({ comentario: comentarioId });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("CommentPost", commentPostSchema);
