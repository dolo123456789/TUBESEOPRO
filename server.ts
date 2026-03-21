import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import axios from "axios";

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

const SPECIAL_EMAILS = [
  "adamadiop709@gmail.com",
  "adjisanoudolo1@gmail.com",
  "infosportmedia7@gmail.com"
];

const isProduction = process.env.NODE_ENV === "production";

async function startServer() {
  console.log("Starting server...");
  try {
    const app = express();
    const PORT = 3000;

    app.use(express.json());

    // Helper to get base URL without trailing slash
    const getBaseUrl = () => {
      const url = process.env.APP_URL || `http://localhost:${PORT}`;
      return url.endsWith('/') ? url.slice(0, -1) : url;
    };

    // IP Tracking and Security Middleware
    app.use(async (req, res, next) => {
      const email = req.headers["x-user-email"] as string;
      if (!email) return next();

      const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
      try {
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", email).get();

        if (snapshot.empty) {
          // New user, register
          const isSpecial = SPECIAL_EMAILS.includes(email);
          await usersRef.add({
            email,
            ipAddress,
            isBanned: false,
            isPro: isSpecial,
            proExpiresAt: isSpecial ? "9999-12-31T23:59:59.999Z" : null,
            lastLoginAt: new Date().toISOString(),
          });
          await logSecurityAction(email, ipAddress, "REGISTRATION", `New user registered${isSpecial ? ' (Special Pro Access)' : ''}`);
          return next();
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();
        const isSpecial = SPECIAL_EMAILS.includes(email);

        if (userData.isBanned) {
          await logSecurityAction(email, ipAddress, "BANNED_ACCESS_ATTEMPT", "Banned user access attempt");
          return res.status(403).json({ 
            error: "Account banned.",
            message: "Your account has been banned due to security policy violations. Please contact support at adjisanoudolo1@gmail.com for assistance."
          });
        }

        // Ensure isPro field exists for existing users
        const updates: any = {
          lastLoginAt: new Date().toISOString(),
          lastIpAddress: ipAddress 
        };
        
        if (isSpecial && !userData.isPro) {
          updates.isPro = true;
          updates.proExpiresAt = "9999-12-31T23:59:59.999Z";
          await logSecurityAction(email, ipAddress, "SPECIAL_PRO_UPGRADE", "Special user upgraded to Pro automatically");
        } else if (userData.isPro === undefined) {
          updates.isPro = false;
        }

        // Update last login and current IP
        await userDoc.ref.update(updates);
        
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

    // PayTech Integration
    const PAYTECH_API_KEY = process.env.PAYTECH_API_KEY;
    const PAYTECH_API_SECRET = process.env.PAYTECH_API_SECRET;

    console.log("PayTech Config Check:", {
      hasKey: !!PAYTECH_API_KEY,
      hasSecret: !!PAYTECH_API_SECRET,
      env: process.env.PAYTECH_ENV || "test"
    });

    app.post("/api/paytech/create-payment", async (req, res) => {
      const { email, planName, amount } = req.body;
      if (!email || !amount) {
        return res.status(400).json({ error: "Email and amount are required" });
      }

      if (!PAYTECH_API_KEY || !PAYTECH_API_SECRET) {
        console.error("PayTech API keys are missing in environment variables");
        return res.status(500).json({ error: "Payment system configuration error. Please contact administrator." });
      }

      try {
        // Handle special free activation for special emails
        if (SPECIAL_EMAILS.includes(email) && amount === 0) {
          const usersRef = db.collection("users");
          const snapshot = await usersRef.where("email", "==", email).get();
          if (!snapshot.empty) {
            await snapshot.docs[0].ref.update({
              isPro: true,
              proExpiresAt: "9999-12-31T23:59:59.999Z"
            });
            await logSecurityAction(email, "ADMIN", "FREE_PRO_ACTIVATION", "Special user activated Pro for life for free");
            return res.json({ success: true, message: "Pro activated for life" });
          }
        }

        const baseUrl = getBaseUrl();
        const successUrl = `${baseUrl}/api/paytech/success?email=${encodeURIComponent(email)}`;
        const cancelUrl = `${baseUrl}/api/paytech/cancel`;
        const ipnUrl = `${baseUrl}/api/paytech/ipn`;

        const payload = {
          item_name: `YouTube SEO Pro - ${planName}`,
          item_price: Number(amount),
          currency: "XOF",
          ref_command: `PRO_${Date.now()}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          command_name: `Paiement Pro pour ${email}`,
          env: process.env.PAYTECH_ENV || "test",
          success_url: successUrl,
          cancel_url: cancelUrl,
          ipn_url: ipnUrl,
          custom_field: JSON.stringify({ email, planName })
        };

        console.log("Initiating PayTech payment with payload:", JSON.stringify(payload, null, 2));

        const response = await axios.post("https://paytech.sn/api/payment/request-payment", payload, {
          headers: {
            API_KEY: PAYTECH_API_KEY,
            API_SECRET: PAYTECH_API_SECRET,
            "Content-Type": "application/json"
          }
        });

        if (response.data.success === 1) {
          res.json({ redirect_url: response.data.redirect_url });
        } else {
          console.error("PayTech API returned failure:", response.data);
          res.status(500).json({ 
            error: "Failed to initiate payment", 
            details: response.data.errors || response.data.message || "Unknown PayTech error" 
          });
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = error.response?.data || error.message;
        console.error("PayTech request error:", errorDetails);
        res.status(500).json({ 
          error: "Erreur PayTech: " + errorMessage, 
          details: errorDetails 
        });
      }
    });

    app.get("/api/paytech/success", async (req, res) => {
      const { email } = req.query;
      if (typeof email !== 'string') return res.redirect('/?payment=error');

      try {
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", email).get();

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          await userDoc.ref.update({
            isPro: true,
            proExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days (3 months)
          });
          await logSecurityAction(email, "SYSTEM", "PAYMENT_SUCCESS", "User upgraded to Pro via PayTech");
        }

        res.redirect('/?payment=success');
      } catch (error) {
        console.error("Payment success handling error:", error);
        res.redirect('/?payment=error');
      }
    });

    app.get("/api/paytech/cancel", (req, res) => {
      res.redirect('/?payment=cancelled');
    });

    app.post("/api/paytech/ipn", async (req, res) => {
      console.log("Received PayTech IPN:", req.body);
      const { type_event, custom_field, ref_command, item_price } = req.body;

      if (type_event === "sale_complete") {
        try {
          const { email } = JSON.parse(custom_field || "{}");
          if (email) {
            const usersRef = db.collection("users");
            const snapshot = await usersRef.where("email", "==", email).get();

            if (!snapshot.empty) {
              const userDoc = snapshot.docs[0];
              await userDoc.ref.update({
                isPro: true,
                proExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
              });
              await logSecurityAction(email, "IPN", "PAYMENT_CONFIRMED", `Payment confirmed via IPN for ${item_price} XOF (Ref: ${ref_command})`);
            }
          }
        } catch (error) {
          console.error("IPN processing error:", error);
        }
      }

      // Always return 200 to PayTech
      res.status(200).send("OK");
    });

    app.get("/api/user/status", async (req, res) => {
      const email = req.headers["x-user-email"] as string;
      if (!email) return res.status(401).json({ error: "Unauthorized" });

      try {
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("email", "==", email).get();

        if (snapshot.empty) {
          return res.json({ isPro: false });
        }

        const userData = snapshot.docs[0].data();
        res.json({ 
          isPro: userData.isPro || false,
          proExpiresAt: userData.proExpiresAt || null
        });
      } catch (error) {
        console.error("Status check error:", error);
        res.status(500).json({ error: "Internal server error" });
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
