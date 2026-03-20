import { Router, Request, Response } from "express";
import prisma from "../db";
import { pickWeightedWord } from "../lib/weightedRandom";

const router = Router();

type Direction = "en-hu" | "hu-en" | "both";

// GET /api/quiz/next?direction=en-hu|hu-en|both
router.get("/next", async (req: Request, res: Response) => {
  const rawDir = (req.query.direction as string) ?? "both";
  const validDirs: Direction[] = ["en-hu", "hu-en", "both"];
  const requestedDir: Direction = validDirs.includes(rawDir as Direction)
    ? (rawDir as Direction)
    : "both";

  const direction: "en-hu" | "hu-en" =
    requestedDir === "both"
      ? Math.random() < 0.5
        ? "en-hu"
        : "hu-en"
      : requestedDir;

  const words = await prisma.word.findMany({ select: { id: true, priority: true } });
  if (words.length === 0) {
    res.status(404).json({ error: "No words in database" });
    return;
  }

  const wordId = pickWeightedWord(words);
  const word = await prisma.word.findUnique({ where: { id: wordId } });
  if (!word) {
    res.status(500).json({ error: "Word not found" });
    return;
  }

  const prompt = direction === "en-hu" ? word.english : word.hungarian;

  res.json({ wordId: word.id, prompt, direction, priority: word.priority });
});

// POST /api/quiz/answer
router.post("/answer", async (req: Request, res: Response) => {
  const { wordId, answer, direction } = req.body as {
    wordId: number;
    answer: string;
    direction: "en-hu" | "hu-en";
  };

  if (!wordId || answer === undefined || !direction) {
    res.status(400).json({ error: "Missing wordId, answer, or direction" });
    return;
  }

  const word = await prisma.word.findUnique({ where: { id: Number(wordId) } });
  if (!word) {
    res.status(404).json({ error: "Word not found" });
    return;
  }

  const correctAnswer = direction === "en-hu" ? word.hungarian : word.english;
  const correct =
    answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  const newPriority = correct
    ? Math.max(1, word.priority - 1)
    : Math.min(20, word.priority + 2);

  const updated = await prisma.word.update({
    where: { id: word.id },
    data: {
      priority: newPriority,
      correctCount: correct ? { increment: 1 } : undefined,
      wrongCount: !correct ? { increment: 1 } : undefined,
      lastSeenAt: new Date(),
    },
  });

  res.json({
    correct,
    correctAnswer,
    newPriority: updated.priority,
    correctCount: updated.correctCount,
    wrongCount: updated.wrongCount,
  });
});

export default router;
