const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Payment = require("../models/payment");
const Order = require("../models/orders");
const Product = require("../models/product"); // 🔥 ADD THIS
const Review = require("../models/review");

const PDFDocument = require("pdfkit");
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

async function generateInvoicePDF(payment) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // =========================
      // HEADER
      // =========================
      doc
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("GRACE STYLE", { align: "left" });

      doc
        .fontSize(12)
        .font("Helvetica")
        .text("INVOICE", { align: "right" });

      doc.moveDown();

      // =========================
      // ORDER INFO
      // =========================
      doc.fontSize(10);
      doc.text(`Transaction ID: ${payment.transactionId}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.text(`Payment: Cash on Delivery`);

      doc.moveDown();

      // =========================
      // CUSTOMER
      // =========================
      doc.font("Helvetica-Bold").text("Customer Details");
      doc.font("Helvetica");
      doc.text(payment.userId.name);
      doc.text(payment.userId.email);

      doc.moveDown();

      // =========================
      // ADDRESS
      // =========================
      doc.font("Helvetica-Bold").text("Shipping Address");
      doc.font("Helvetica");
      doc.text(payment.orderId?.addressId?.street || "");
      doc.text(
        `${payment.orderId?.addressId?.city || ""}, ${payment.orderId?.addressId?.state || ""} - ${payment.orderId?.addressId?.pincode || ""}`
      );

      doc.moveDown();

      // =========================
      // TABLE HEADER
      // =========================
      doc.font("Helvetica-Bold");
      doc.text("Item", 40, doc.y, { continued: true });
      doc.text("Size", 200, doc.y, { continued: true });
      doc.text("Color", 250, doc.y, { continued: true });
      doc.text("Qty", 320, doc.y, { continued: true });
      doc.text("Price", 370, doc.y, { continued: true });
      doc.text("Total", 450);

      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

      // =========================
      // ITEMS
      // =========================
      doc.font("Helvetica");

      payment.items.forEach((item) => {
        doc.moveDown(0.5);

        doc.text(item.name, 40, doc.y, { continued: true });
        doc.text(item.size, 200, doc.y, { continued: true });
        doc.text(item.color, 250, doc.y, { continued: true });
        doc.text(item.quantity.toString(), 320, doc.y, { continued: true });
        doc.text(`₹${item.price}`, 370, doc.y, { continued: true });
        doc.text(`₹${item.price * item.quantity}`, 450);
      });

      doc.moveDown();
      doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

      const DELIVERY_FEE = 100;

      // ✅ calculate subtotal from items
      const subtotal = payment.items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
      // =========================
      // TOTAL
      // =========================
      doc.moveDown();

      // Subtotal
      doc.font("Helvetica").fontSize(12);
      doc.text(`Subtotal: ₹${subtotal}`, { align: "right" });

      // Delivery
      doc.text(`Delivery Fee: ₹${DELIVERY_FEE}`, { align: "right" });

      // Final Total
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(14);
      doc.text(`Total: ₹${payment.totalAmount}`, { align: "right" });

      // =========================
      // FOOTER
      // =========================
      doc.moveDown(2);
      doc.fontSize(10).font("Helvetica").text(
        "Thank you for shopping with GRACE STYLE ❤️",
        { align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/* ---------------- GET ALL USERS (ADMIN) ---------------- */

router.get("/users", async (req, res) => {

  try {

    const users = await User.find({ role: "customer" }, "name email phone");
    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({
          userId: user._id
        });

        return {
          ...user.toObject(),
          orderCount
        };
      })
    );
    res.status(200).json({
      total: users.length,
      users: usersWithOrders
    });

  } catch (error) {

    console.error("Fetch Users Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }

});

// for new users (admin dashboard)
router.get("/dashboard-stats", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. NEW CUSTOMERS
    const newCustomers = await User.countDocuments({
      role: "customer",
      created_at: { $gte: startOfMonth }
    });

    // 2. NEW ORDERS
    const newOrders = await Order.countDocuments({
      orderDate: { $gte: startOfMonth }
    });

    // 3. PAYMENTS (ONLY SUCCESSFUL)
    const payments = await Payment.find({
      paymentStatus: "Received"
    });

    // IMPORTANT FIX: ensure number safety
    const totalSales = payments.reduce((sum, p) => {
      return sum + (Number(p.totalAmount) || 0);
    }, 0);


    // 4. LOW STOCK ALERTS
    const lowStockAlerts = await Product.countDocuments({
      totalStock: { $lte: 10 }
    });

    // FINAL RESPONSE (clean + safe)
    return res.status(200).json({
      success: true,
      newCustomers: newCustomers || 0,
      newOrders: newOrders || 0,
      totalSales: totalSales || 0,
      lowStockAlerts: lowStockAlerts || 0
    });

  } catch (error) {
    console.error("Dashboard Stats Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      newCustomers: 0,
      newOrders: 0,
      totalSales: 0,
      lowStockAlerts: 0
    });
  }
});

/* ---------------- GET ALL ORDERS (ADMIN) ---------------- */

router.get("/orders", async (req, res) => {
  try {

    const orders = await Order.find()
      .populate("addressId")
      .populate("items.productId")
      .sort({ orderDate: -1 });

    res.status(200).json({
      total: orders.length,
      orders
    });

  } catch (error) {

    console.error("Fetch Orders Error:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Shipped",
      "Delivered",
      "Cancelled"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.status;

    // ==============================
    // 🚫 HARD RULES (BLOCK CHANGES)
    // ==============================

    // ❌ Cannot change if already Cancelled
    if (previousStatus === "Cancelled") {
      return res.status(400).json({
        message: "Cancelled orders cannot be modified"
      });
    }

    // ❌ Cannot change if already Delivered
    if (previousStatus === "Delivered") {
      return res.status(400).json({
        message: "Delivered orders cannot be modified"
      });
    }

    // ❌ Cannot cancel after shipped
    if (previousStatus === "Shipped" && status === "Cancelled") {
      return res.status(400).json({
        message: "Shipped orders cannot be cancelled"
      });
    }

    // ==============================
    // ✅ UPDATE STATUS
    // ==============================
    order.status = status;
    await order.save();

    // ==============================
    // 🔥 STOCK LOGIC (ONLY VALID CASES)
    // ==============================

    // CANCEL → RESTORE STOCK
    if (status === "Cancelled") {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (!product) continue;

        const variant = product.variants.find(v =>
          v.color === item.color && v.size === item.size
        );

        if (variant) {
          variant.stock += item.quantity;
        }

        await product.save();
      }

      await Payment.findOneAndUpdate(
        { orderId: order._id },
        { paymentStatus: "Failed" }
      );
    }

    // DELIVERED → PAYMENT RECEIVED
    if (status === "Delivered") {
      order.deliveredAt = new Date(); // ✅ ADD THIS
      await order.save();
      const payment = await Payment.findOne({ orderId: order._id });

      if (payment) {
        payment.paymentStatus = "Received";
        await payment.save();
      }
    }

    res.json({
      message: "Status updated successfully",
      order
    });

  } catch (err) {
    console.error("Status update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// payment table 
router.get("/payments", async (req, res) => {
  try {

    const payments = await Payment.find()
      .populate("userId", "name email")
      .populate("orderId")
      .sort({ createdAt: -1 });

    res.json({ payments });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


router.put("/payments/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Received", "Failed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const payment = await Payment.findById(req.params.id)
      .populate("userId")
      .populate("orderId");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const previousStatus = payment.paymentStatus;

    // ==============================
    // 🚫 HARD RULES
    // ==============================

    // ❌ Once FAILED → locked forever
    if (previousStatus === "Failed") {
      return res.status(400).json({
        message: "Failed payments cannot be modified"
      });
    }

    // ❌ Once RECEIVED → locked forever
    if (previousStatus === "Received") {
      return res.status(400).json({
        message: "Completed payments cannot be modified"
      });
    }

    // ==============================
    // ✅ VALID TRANSITIONS
    // ==============================
    // Only Pending → Received / Failed allowed

    if (previousStatus === "Pending") {
      if (!["Received", "Failed"].includes(status)) {
        return res.status(400).json({
          message: "Pending payments can only be marked as Received or Failed"
        });
      }
    }

    // ==============================
    // ✅ UPDATE STATUS
    // ==============================
    payment.paymentStatus = status;
    await payment.save();

    // ==============================
    // 📄 SEND INVOICE
    // ==============================
    if (status === "Received") {
      const userEmail = payment.userId.email;
      console.log("Send invoice to:", userEmail);

      // later → call resend here
    }

    res.json({ message: "Payment updated", payment });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/payments/stats", async (req, res) => {
  try {

    const payments = await Payment.find({ paymentStatus: "Received" });

    const totalRevenue = payments.reduce(
      (sum, p) => sum + p.totalAmount,
      0
    );

    const successfulPayments = payments.length;

    const failedPayments = await Payment.countDocuments({
      paymentStatus: "Failed"
    });

    res.json({
      totalRevenue,
      successfulPayments,
      failedPayments
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// invoice 

router.get("/payments/:id/invoice", async (req, res) => {
  try {

    const payment = await Payment.findById(req.params.id)
      .populate("userId")
      .populate({
        path: "orderId",
        populate: { path: "addressId" } // 🔥 IMPORTANT
      });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // 🔐 BASIC SECURITY
    if (req.query.token !== payment.transactionId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const pdfBuffer = await generateInvoicePDF(payment);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=invoice-${payment.transactionId}.pdf`
    });

    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Invoice generation failed" });
  }
});

router.post("/payments/:id/send-invoice", async (req, res) => {
  try {

    const payment = await Payment.findById(req.params.id)
      .populate("userId")
      .populate({
        path: "orderId",
        populate: { path: "addressId" }
      });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus !== "Received") {
      return res.status(400).json({
        message: "Invoice can only be sent after payment is received"
      });
    }

    // 🔗 Invoice link (optional but good)
    const invoiceUrl = `https://gsd-backend-i5gj.onrender.com/api/admin/payments/${payment._id}/invoice?token=${payment.transactionId}`;

    // 📄 Generate PDF
    const pdfBuffer = await generateInvoicePDF(payment);

    // 🚀 SEND EMAIL USING RESEND
    await resend.emails.send({
      from: "onboarding@resend.dev", // later change to your domain
      to: payment.userId.email,
      subject: "Your Invoice - Grace Style 💖",

      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Payment Confirmed ✅</h2>
          
          <p>Hello ${payment.userId.name},</p>
          
          <p>Your payment of <b>₹${payment.totalAmount}</b> has been successfully received.</p>
          
          <p>You can download your invoice below:</p>
          
          <a href="${invoiceUrl}" 
             style="display:inline-block; padding:10px 15px; background:black; color:white; text-decoration:none;">
             Download Invoice
          </a>

          <br/><br/>
          <p>Thank you for shopping with us 💖</p>
        </div>
      `,

      attachments: [
        {
          filename: `invoice-${payment.transactionId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    res.json({ message: "Invoice sent successfully" });

  } catch (err) {
    console.error("Email Error:", err);
    res.status(500).json({ message: "Email error" });
  }
});

// dashboard bestsellers
router.get("/bestsellers", async (req, res) => {
  try {
    const orders = await Order.find();

    const productMap = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.productId.toString();

        if (!productMap[key]) {
          productMap[key] = {
            name: item.name,
            count: 0
          };
        }

        productMap[key].count += item.quantity;
      });
    });

    const bestsellers = Object.values(productMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    res.json({ bestsellers });

  } catch (err) {
    console.error("Bestsellers error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all reviews (admin)
router.get("/admin", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("userId", "name")
      .populate("productId", "name images");

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;