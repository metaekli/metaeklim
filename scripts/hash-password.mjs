import { scryptSync, randomBytes } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const salt = randomBytes(16);
const derived = scryptSync(password, salt, 64);
console.log(`${salt.toString("hex")}:${derived.toString("hex")}`);
