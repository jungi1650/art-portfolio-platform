import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./lib/prisma.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import parentRoutes from "./routes/parent.js";
import portfolioRoutes from "./routes/portfolio.js";
import communityRoutes from "./routes/community.js";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/community", communityRoutes);

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, db: true, message: "backend and db connected" });
  } catch (error) {
    res.status(500).json({
      ok: false,
      db: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});