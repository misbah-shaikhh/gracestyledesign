const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');

// ADD NEW PRODUCT
router.post('/', async (req, res) => {
    try {
        const data = req.body;
        if (!data.name || !data.category || !data.originalPrice)
            return res.status(400).json({ message: "Name, category, and originalPrice are required" });

        data.description = data.description || {};
        data.variants = Array.isArray(data.variants) ? data.variants : [];
        data.productId = `PID${Date.now()}`;

        const newProduct = new Product(data);
        await newProduct.save();

        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET low stock products (stock <= 15)
router.get("/low-stock", async (req, res) => {
    try {
        const products = await Product.find({ totalStock: { $lte: 15 } })
            .populate('category')   // 🔥 ADD THIS
            .sort({ name: 1 });
        res.json(products); // returns an array
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('category')
            .sort({ createdAt: -1 });
        res.status(200).json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching products" });
    }
});

const Order = require("../models/orders"); // 🔥 add this

// GET BESTSELLING PRODUCTS
router.get("/bestsellers", async (req, res) => {
  try {
    const orders = await Order.find();

    const productMap = {};

    // 🔥 count quantity sold
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.productId.toString();

        if (!productMap[key]) {
          productMap[key] = 0;
        }

        productMap[key] += item.quantity;
      });
    });

    // 🔥 sort by highest sold
    const sortedIds = Object.entries(productMap)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    // 🔥 fetch full product details
    const products = await Product.find({
      _id: { $in: sortedIds }
    });

    // 🔥 preserve order (important!)
    const sortedProducts = sortedIds.map(id =>
      products.find(p => p._id.toString() === id)
    ).filter(Boolean);

    res.json(sortedProducts);

  } catch (err) {
    console.error("Bestsellers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET SINGLE PRODUCT BY ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid product ID" });

        const product = await Product.findById(id).populate('category');
        if (!product) return res.status(404).json({ message: "Product not found" });

        product.description = product.description || {};
        product.variants = Array.isArray(product.variants) ? product.variants : [];

        res.status(200).json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// UPDATE PRODUCT
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ message: "Invalid product ID" });

        const data = req.body;
        data.description = data.description || {};
        data.variants = Array.isArray(data.variants) ? data.variants : [];

        const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

        res.status(200).json(updatedProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

router.get("/test", (req, res) => {
    res.json({ message: "Product routes are working" });
});



module.exports = router;