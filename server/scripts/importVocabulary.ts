import "dotenv/config";
import * as ExcelJS from "exceljs";
import * as path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client";

const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.word.count();
  if (existing > 0) {
    console.log(`DB already has ${existing} words, skipping import.`);
    return;
  }

  const xlsxPath = path.resolve(__dirname, "../../vocabulary.xlsx");
  console.log(`Reading: ${xlsxPath}`);

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);

  const sheet = workbook.worksheets[0];
  const words: { english: string; hungarian: string }[] = [];

  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const english = String(row.getCell(1).value ?? "").trim();
    const hungarian = String(row.getCell(2).value ?? "").trim();
    if (english && hungarian) {
      words.push({ english, hungarian });
    }
  });

  console.log(`Found ${words.length} word pairs. Importing...`);

  // Use raw SQL INSERT OR IGNORE for idempotency (SQLite specific)
  let imported = 0;
  const BATCH = 500;
  for (let i = 0; i < words.length; i += BATCH) {
    const batch = words.slice(i, i + BATCH);
    await prisma.$transaction(
      batch.map((w) =>
        prisma.$executeRaw`INSERT OR IGNORE INTO Word (english, hungarian, priority, correctCount, wrongCount) VALUES (${w.english}, ${w.hungarian}, 10, 0, 0)`
      )
    );
    imported += batch.length;
    console.log(`  ${imported}/${words.length}`);
  }

  const total = await prisma.word.count();
  console.log(`Done. Total words in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
