import { readFileSync } from "node:fs";

const checklist = readFileSync(new URL("../docs/phase-checklist.md", import.meta.url), "utf8");
const lines = checklist.split("\n").filter((line) => line.startsWith("- ["));
const complete = lines.filter((line) => line.startsWith("- [x]")).length;
const active = lines.find((line) => line.startsWith("- [ ]"));

console.log(`Rasa phase checklist: ${complete}/${lines.length} completed`);
console.log(active ? `Current gated tick: ${active}` : "Current gated tick not found");
