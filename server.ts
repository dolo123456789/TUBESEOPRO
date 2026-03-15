import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import paydunya from "paydunya";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

import { readFileSync } from "fs";

dotenv.config();

const firebaseConfig = JSON.parse(readFileSync("./firebase-applet-config.json", "utf-8"));

// Initialize Firebase Admin
if (!admin.apps.length) {
  console.log("Initializing Firebase Admin with project:", firebaseConfig.projectId);
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
const db = getFirestore(firebaseConfig.firestoreDatabaseId);

const isProduction = process.env.NODE_ENV === "production";

async function getPaydunyaConfig() {
  const config = {
    master_key: process.env.PAYDUNYA_MASTER_KEY || "",
    public_key: process.env.PAYDUNYA_PUBLIC_KEY || "",
    private_key: process.env.PAYDUNYA_PRIVATE_KEY || "",
    token: process.env.PAYDUNYA_TOKEN || "",
    mode: (process.env.PAYDUNYA_MODE as 'test' | 'live') || (isProduction ? "live" : "test"),
  };

  // If keys are missing, try to fetch from Firestore
  if (!config.master_key || !config.public_key || !config.private_key || !config.token) {
    try {
      console.log("Fetching Paydunya config from Firestore...");
      const docSnap = await db.collection("app_config").doc("paydunya").get();
      if (docSnap.exists) {
        const data = docSnap.data();
        config.master_key = config.master_key || data?.master_key || "";
        config.public_key = config.public_key || data?.public_key || "";
        config.private_key = config.private_key || data?.private_key || "";
        config.token = config.token || data?.token || "";
        config.mode = config.mode || data?.mode || (isProduction ? "live" : "test");
      }
    } catch (e) {
      console.error("Error fetching Paydunya config from Firestore:", e);
    }
  }
  return config;
}

async function setupPaydunya() {
  try {
    const config = await getPaydunyaConfig();
    console.log("Setting up Paydunya with keys:", {
      master_key: config.master_key ? "PRESENT (starts with " + config.master_key.substring(0, 5) + "...)" : "MISSING",
      public_key: config.public_key ? "PRESENT" : "MISSING",
      private_key: config.private_key ? "PRESENT" : "MISSING",
      token: config.token ? "PRESENT" : "MISSING",
    });
    
    if (!config.master_key || !config.public_key || !config.private_key || !config.token) {
      console.warn("Paydunya configuration is incomplete!");
    }

    paydunya.setup({
      master_key: config.master_key,
      public_key: config.public_key,
      private_key: config.private_key,
      token: config.token,
      mode: config.mode,
    });

    paydunya.Store.name = "TubeSEOPro";
    paydunya.Store.tagline = "L'outil SEO ultime pour YouTube";
    paydunya.Store.phoneNumber = "33123456789";
    paydunya.Store.postalAddress = "Dakar, Sénégal";
    paydunya.Store.websiteUrl = process.env.APP_URL || "";
  } catch (error) {
    console.error("Paydunya setup failed:", error);
  }
}

async function startServer() {
  console.log("Starting server...");
  try {
    // Initial setup - wrap in try/catch to ensure server starts listening
    try {
      await setupPaydunya();
    } catch (e) {
      console.error("Initial Paydunya setup failed, server will still start:", e);
    }
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
        // Refresh config from Firestore if needed
        await setupPaydunya();
        
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
                console.error("Paydunya invoice creation failed. Response:", invoice.response_text);
                console.error("Full invoice object (partial):", {
                  status: invoice.status,
                  response_code: invoice.response_code,
                  response_text: invoice.response_text
                });
                reject(invoice.response_text || "Erreur lors de la création de la facture. Vérifiez vos clés API.");
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
      console.log("Setting up Vite middleware...");
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
  } catch (error) {
    console.error("Server failed to start:", error);
  }
}

startServer();
