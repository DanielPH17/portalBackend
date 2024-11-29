import mongoose from "mongoose";
import commentPostModels from "./commentPost.models.js";
import responsePostModels from "./responsePost.models.js";

const postSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: { type: String },
  imagen: { type: String },
  compartidos: { type: Number, default: 0 },
  fechaPost: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  usuariosLikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

postSchema.pre("findOneAndDelete", async function (next) {
  const postId = this.getQuery()._id;
  try {
    const comentarios = await commentPostModels.find({ post: postId });
    const comentarioIds = comentarios.map((comentario) => comentario._id);

    await commentPostModels.deleteMany({ post: postId });
    await responsePostModels.deleteMany({ comentario: { $in: comentarioIds } });
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Post", postSchema);
