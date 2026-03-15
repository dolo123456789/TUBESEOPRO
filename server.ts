import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import paydunya from "paydunya";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}
const db = getFirestore();

const isProduction = process.env.NODE_ENV === "production";

paydunya.setup({
  master_key: process.env.PAYDUNYA_MASTER_KEY || "",
  public_key: process.env.PAYDUNYA_PUBLIC_KEY || "",
  private_key: process.env.PAYDUNYA_PRIVATE_KEY || "",
  token: process.env.PAYDUNYA_TOKEN || "",
  mode: isProduction ? "live" : "test",
});

paydunya.Store.name = "TubeSEOPro";
paydunya.Store.tagline = "L'outil SEO ultime pour YouTube";
paydunya.Store.phoneNumber = "33123456789";
paydunya.Store.postalAddress = "Dakar, Sénégal";
paydunya.Store.websiteUrl = process.env.APP_URL || "";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper to get base URL without trailing slash
  const getBaseUrl = () => {
    const url = process.env.APP_URL || `http://localhost:${PORT}`;
    return url.endsWith('/') ? url.slice(0, -1) : url;
  };

  // IP Tracking and Auto-Ban Middleware
  app.use(async (req, res, next) => {
    const email = req.headers["x-user-email"] as string;
    if (!email) return next();

    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    try {
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
    } catch (error) {
      console.error("Auth middleware error:", error);
      next();
    }
  });

  async function logSecurityAction(email: string, ipAddress: string, action: string, details: string) {
    try {
      await db.collection("securityLogs").add({
        email,
        ipAddress,
        action,
        timestamp: new Date().toISOString(),
        details,
      });
    } catch (e) {
      console.error("Logging error:", e);
    }
  }

  // Paydunya Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    const email = (req.headers["x-user-email"] as string) || "anonymous";
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const baseUrl = getBaseUrl();

    try {
      const invoice = new paydunya.CheckoutInvoice();
      invoice.addItem("TubeSEOPro Plan (24€ pour 3 mois)", 1, 2400, 2400);
      invoice.setTotalAmount(2400);
      invoice.setDescription("Abonnement TubeSEOPro (24€ pour les 3 premiers mois, puis 24€/mois)");
      invoice.setCallbackUrl(`${baseUrl}/?success=true`);
      invoice.setCancelUrl(`${baseUrl}/?canceled=true`);

      // Handle Paydunya's callback-based API
      const createInvoice = () => {
        return new Promise((resolve, reject) => {
          invoice.create((success: boolean) => {
            if (success) {
              resolve(invoice.getInvoiceUrl());
            } else {
              reject(invoice.response_text || "Erreur lors de la création de la facture");
            }
          });
        });
      };

      const url = await createInvoice();
      await logSecurityAction(email, ipAddress, "PAYMENT", "Checkout session created (3 months initial)");
      res.json({ url });
    } catch (error) {
      console.error("Paydunya error:", error);
      await logSecurityAction(email, ipAddress, "PAYMENT", "Checkout creation error: " + error);
      res.status(500).json({ error: typeof error === 'string' ? error : "Failed to create checkout session" });
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
