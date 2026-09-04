import fs from "fs";
import path from "path";
import { PaymentRecord } from "../types/payment";

/**
 * v1 persistence: a single JSON file. Good enough for manual verification
 * and low volume; swap for a real database when that becomes the
 * bottleneck (see context/context.md section 5).
 */
const DATA_DIR = path.join(__dirname, "..", "..", "data");
const DATA_FILE = path.join(DATA_DIR, "payments.json");

function ensureDataFile(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf-8");
  }
}

function readAll(): PaymentRecord[] {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as PaymentRecord[];
}

function writeAll(records: PaymentRecord[]): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), "utf-8");
}

export const paymentStore = {
  getAll(): PaymentRecord[] {
    return readAll();
  },

  findByReference(reference: string): PaymentRecord | undefined {
    return readAll().find((p) => p.reference === reference);
  },

  upsert(record: PaymentRecord): PaymentRecord {
    const records = readAll();
    const index = records.findIndex((p) => p.reference === record.reference);
    if (index === -1) {
      records.push(record);
    } else {
      records[index] = record;
    }
    writeAll(records);
    return record;
  },
};
