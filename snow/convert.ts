import { readFileSync, writeFileSync } from "fs";

const codes = new Map<string, string[]>();
const raw = readFileSync("单字全码.txt", "utf8").trim().split("\n");

for (const line of raw) {
  const [word, code] = line.split("\t");
  codes.set(code, (codes.get(code) ?? []).concat(word));
}

writeFileSync(
  "snow_jiandao.fixed.txt",
  Array.from(codes.entries())
    .map(([code, words]) => `${code}\t${words.join(" ")}`)
    .join("\n"),
)