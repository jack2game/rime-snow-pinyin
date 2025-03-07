import { copyFileSync, readdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const FILELIST = [
  "snow_pinyin.schema.yaml",
  "snow_pinyin.dict.yaml",
  "snow_pinyin.base.dict.yaml",
  "snow_pinyin.ext.dict.yaml",
  "snow_pinyin.tencent.dict.yaml",
  "snow_sipin.schema.yaml",
  "snow_sipin.fixed.txt",
  "snow_sanpin.schema.yaml",
  "snow_sanpin.fixed.txt",
  "snow_yipin.schema.yaml",
  "snow_yipin.fixed.txt",
  "snow_jiandao.schema.yaml",
  "snow_jiandao.fixed.txt",
  "snow_jiandao_jianpin.schema.yaml",
  "snow_stroke.schema.yaml",
];

function deploy(path: string) {
  for (const file of FILELIST) {
    copyFileSync(`./${file}`, `${path}/${file}`);
  }
  for (const file of readdirSync("./lua/snow/")) {
    copyFileSync(`./lua/snow/${file}`, `${path}/lua/snow/${file}`);
  }
}

function retrieve(path: string) {
  for (const file of FILELIST) {
    copyFileSync(`${path}/${file}`, `./${file}`);
  }
  for (const file of readdirSync(`${path}/lua/snow/`)) {
    copyFileSync(`${path}/lua/snow/${file}`, `./lua/snow/${file}`);
  }
}

let [command, path] = process.argv.slice(2);
path = path || join(homedir(), "Library", "Rime");

if (command === "deploy") {
  deploy(path);
} else if (command === "retrieve") {
  retrieve(path);
}
