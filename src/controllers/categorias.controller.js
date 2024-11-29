import CategoriasModels from "../models/categorias.models.js";

export const getCategorias = async (req, res) => {
  try {
    const categorias = await CategoriasModels.find();
    res.json(categorias);
  } catch (error) {
    return res.status(500).json({ message: "Algo salio mal" });
  }
};

export const getCategoria = async (req, res) => {
  try {
    const categoria = await CategoriasModels.findById(req.params.id);
    if (!categoria)
      return res.status(404).json({ message: "Categoria con encontrada" });
    res.json(categoria);
  } catch (error) {
    return res.status(404).json({ message: "Categoria con encontrada" });
  }
};

export const createCategorias = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newCategoria = new CategoriasModels({
      title,
      description,
    });
    const saveCategoria = await newCategoria.save();
    res.json(saveCategoria);
  } catch (error) {
    return res.status(500).json({ message: "Algo salio mal" });
  }
};

export const deleteCategorias = async (req, res) => {
  try {
    const categoria = await CategoriasModels.findByIdAndDelete(req.params.id);
    if (!categoria) return res.status(404).json({ message: "Task not found" });
    res.json(categoria);
  } catch (error) {
    return res.status(404).json({ message: "Categoria con encontrada" });
  }
};

export const updateCategorias = async (req, res) => {
  try {
    const categoria = await CategoriasModels.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!categoria) return res.status(404).json({ message: "Task not found" });
    res.json(categoria);
  } catch (error) {
    return res.status(404).json({ message: "Categoria con encontrada" });
  }
};
