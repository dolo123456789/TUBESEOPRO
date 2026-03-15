import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import paydunya from "paydunya";
import dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

// Initialize Firebase Admin
// Note: In this environment, applicationDefault() should work.
import admin from "firebase-admin";
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const db = getFirestore();

paydunya.setup({
  master_key: process.env.PAYDUNYA_MASTER_KEY || "",
  public_key: process.env.PAYDUNYA_PUBLIC_KEY || "",
  private_key: process.env.PAYDUNYA_PRIVATE_KEY || "",
  token: process.env.PAYDUNYA_TOKEN || "",
  mode: "test", // or "live"
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // IP Tracking and Auto-Ban Middleware
  app.use(async (req, res, next) => {
    const email = req.headers["x-user-email"] as string;
    if (!email) return next();

    const ipAddress = req.ip;
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", email).get();

    if (snapshot.empty) {
      // New user, register IP
      await usersRef.add({
        email,
        ipAddress,
        isBanned: false,
        lastLoginAt: new Date().toISOString(),
      });
      await logSecurityAction(email, ipAddress, "CONNECTION_ATTEMPT", "New user registration");
      return next();
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    if (userData.isBanned) {
      await logSecurityAction(email, ipAddress, "CONNECTION_ATTEMPT", "Banned user access attempt");
      return res.status(403).json({ 
        error: "Account banned.",
        message: "Your account has been banned due to security policy violations. Please contact support at adjisanoudolo1@gmail.com for assistance."
      });
    }

    if (userData.ipAddress && userData.ipAddress !== ipAddress) {
      // IP mismatch, ban user
      await userDoc.ref.update({ isBanned: true });
      await logSecurityAction(email, ipAddress, "CONNECTION_ATTEMPT", "Banned due to IP mismatch");
      return res.status(403).json({ 
        error: "Account banned due to IP mismatch.",
        message: "Your account has been banned due to security policy violations (IP mismatch). Please contact support at adjisanoudolo1@gmail.com for assistance."
      });
    }

    // Update last login
    await userDoc.ref.update({ lastLoginAt: new Date().toISOString() });
    await logSecurityAction(email, ipAddress, "CONNECTION_ATTEMPT", "Successful login");
    next();
  });

  async function logSecurityAction(email: string, ipAddress: string, action: string, details: string) {
    await db.collection("securityLogs").add({
      email,
      ipAddress,
      action,
      timestamp: new Date().toISOString(),
      details,
    });
  }

  // Paydunya Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    const email = req.headers["x-user-email"] as string;
    const ipAddress = req.ip;
    try {
      const invoice = new paydunya.CheckoutInvoice();
      // Initial 3-month period at 24€
      invoice.addItem("TubeSEOPro Plan (24€ pour 3 mois)", 1, 2400, 2400);
      invoice.setTotalAmount(2400);
      invoice.setDescription("Abonnement TubeSEOPro (24€ pour les 3 premiers mois, puis 24€/mois)");
      invoice.setCallbackUrl(`${process.env.APP_URL}/?success=true`);
      invoice.setCancelUrl(`${process.env.APP_URL}/?canceled=true`);

      // NOTE: Recurring monthly billing after 3 months needs to be handled
      // via Paydunya's recurring payments API or manually.

      if (await invoice.create()) {
        await logSecurityAction(email, ipAddress, "PAYMENT", "Checkout session created (3 months initial)");
        res.json({ url: invoice.getInvoiceUrl() });
      } else {
        await logSecurityAction(email, ipAddress, "PAYMENT", "Checkout creation failed: " + invoice.response_text);
        res.status(500).json({ error: invoice.response_text });
      }
    } catch (error) {
      console.error("Paydunya error:", error);
      await logSecurityAction(email, ipAddress, "PAYMENT", "Checkout creation error");
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
