import fs from "node:fs";
const content = fs.readFileSync("d:\\panda-ai\\panda-ai\\skills\\gog\\SKILL.md", "utf8");
console.log("First 10 chars:");
for (let i = 0; i < Math.min(10, content.length); i++) {
  console.log(`char ${i}: code=${content.charCodeAt(i)}, char=${JSON.stringify(content[i])}`);
}
