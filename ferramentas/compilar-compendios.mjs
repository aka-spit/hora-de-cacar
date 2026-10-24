// Recompila os compêndios a partir dos JSONs em ./compendios-json
// Uso (na pasta ferramentas):  npm i @foundryvtt/foundryvtt-cli  &&  node compilar-compendios.mjs
// Feche o Foundry antes (o LevelDB fica travado enquanto o mundo está aberto).
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import fs from "node:fs";
import path from "node:path";
const aqui = path.dirname(new URL(import.meta.url).pathname);
for (const p of fs.readdirSync(path.join(aqui, "compendios-json"))) {
  const destino = path.join(aqui, "..", "packs", p);
  fs.rmSync(destino, { recursive: true, force: true });
  await compilePack(path.join(aqui, "compendios-json", p), destino, { log: true });
}
