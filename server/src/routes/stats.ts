import { Router, Request, Response } from "express";
import prisma from "../db";

const router = Router();

// GET /api/stats
router.get("/", async (_req: Request, res: Response) => {
  const [totalWords, mastered, difficult, avgResult] = await Promise.all([
    prisma.word.count(),
    prisma.word.count({ where: { priority: { lte: 3 } } }),
    prisma.word.count({ where: { priority: { gte: 15 } } }),
    prisma.word.aggregate({ _avg: { priority: true } }),
  ]);

  const learning = totalWords - mastered - difficult;

  res.json({
    totalWords,
    mastered,
    learning,
    difficult,
    avgPriority: Math.round((avgResult._avg.priority ?? 10) * 10) / 10,
  });
});

// GET /api/stats/words?page=1&limit=50&sort=priority&order=desc
router.get("/words", async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? "50", 10)));
  const sortField = (req.query.sort as string) ?? "priority";
  const order = (req.query.order as string) === "asc" ? "asc" : "desc";

  const validSorts = ["priority", "correctCount", "wrongCount", "english", "hungarian"];
  const sort = validSorts.includes(sortField) ? sortField : "priority";

  const [words, total] = await Promise.all([
    prisma.word.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
    }),
    prisma.word.count(),
  ]);

  res.json({ words, total, page, limit });
});

export default router;
