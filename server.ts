import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
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
          await usersRef.add({
            email,
            ipAddress,
            isBanned: false,
            lastLoginAt: new Date().toISOString(),
          });
          await logSecurityAction(email, ipAddress, "REGISTRATION", "New user registered");
          return next();
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        if (userData.isBanned) {
          await logSecurityAction(email, ipAddress, "BANNED_ACCESS_ATTEMPT", "Banned user access attempt");
          return res.status(403).json({ 
            error: "Account banned.",
            message: "Your account has been banned due to security policy violations. Please contact support at adjisanoudolo1@gmail.com for assistance."
          });
        }

        // Update last login and current IP (without banning on mismatch)
        await userDoc.ref.update({ 
          lastLoginAt: new Date().toISOString(),
          lastIpAddress: ipAddress 
        });
        
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
