import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import paydunya from "paydunya";
import dotenv from "dotenv";

dotenv.config();

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

  // Paydunya Checkout
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const invoice = new paydunya.CheckoutInvoice();
      invoice.addItem("TubeSEOPro Plan", 1, 2400, 2400);
      invoice.setTotalAmount(2400);
      invoice.setDescription("Abonnement TubeSEOPro");
      invoice.setCallbackUrl(`${process.env.APP_URL}/?success=true`);
      invoice.setCancelUrl(`${process.env.APP_URL}/?canceled=true`);

      if (await invoice.create()) {
        res.json({ url: invoice.getInvoiceUrl() });
      } else {
        res.status(500).json({ error: invoice.response_text });
      }
    } catch (error) {
      console.error("Paydunya error:", error);
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
