import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import quizRouter from "./routes/quiz";
import statsRouter from "./routes/stats";

const app = express();
const PORT = process.env.PORT ?? 3001;
const IS_PROD = process.env.NODE_ENV === "production";

// In development allow Vite dev server origin
if (!IS_PROD) {
  app.use(cors({ origin: "http://localhost:5173" }));
}

app.use(express.json());

app.use("/api/quiz", quizRouter);
app.use("/api/stats", statsRouter);

// Serve React build in production
if (IS_PROD) {
  // cwd = /app/server/ (because start script does "cd server && ...")
  const clientDist = path.resolve(process.cwd(), "../client/dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
