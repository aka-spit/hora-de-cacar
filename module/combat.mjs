/**
 * Iniciativa por cartas (Cap. 5): cartas de 1 a 10, tiradas uma vez no começo; age do menor para o maior.
 * Criaturas tiram uma carta por ponto de Ferocidade (Cap. 11).
 */
import { SYSTEM_ID, HDC } from "./config.mjs";
import { cartaoSimples, esc } from "./dice.mjs";

/** Escolhe uma carta do "baralho" atual, olhando as que já saíram neste combate. */
function tirarCarta(usadas) {
  const contagem = Array.from({ length: 10 }, (_, i) => usadas.filter((u) => u === i + 1).length);
  const min = Math.min(...contagem);
  const disponiveis = contagem.map((c, i) => (c === min ? i + 1 : null)).filter(Boolean);
  return disponiveis[Math.floor(Math.random() * disponiveis.length)];
}

export class HDCCombat extends Combat {
  /** Menor carta primeiro. Empate: PJ antes de PNJ/criatura. Sem carta vai para o fim. */
  _sortCombatants(a, b) {
    const ia = Number.isNumeric(a.initiative) ? a.initiative : Infinity;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : Infinity;
    if (ia !== ib) return ia - ib;
    const pa = a.actor?.type === "cacador" ? 0 : 1;
    const pb = b.actor?.type === "cacador" ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return (a.name ?? "").localeCompare(b.name ?? "");
  }

  async rollInitiative(ids, { updateTurn = true } = {}) {
    ids = typeof ids === "string" ? [ids] : ids;
    const currentId = this.combatant?.id;
    const usadas = this.combatants.map((c) => c.initiative).filter((v) => Number.isNumeric(v));
    const updates = [];
    const linhas = [];

    for (const id of ids) {
      const c = this.combatants.get(id);
      if (!c?.isOwner) continue;
      let carta = tirarCarta(usadas);
      usadas.push(carta);
      let nota = "";
      // Talento: Reflexos de Quem Já Foi Emboscado — tira duas e fica com a menor.
      const reflexos = c.actor?.items?.some((i) => i.type === "talento" && HDC.normalizar(i.name).startsWith(HDC.normalizar("Reflexos de Quem")));
      if (reflexos) {
        const outra = tirarCarta(usadas);
        usadas.push(outra);
        nota = ` (tirou ${carta} e ${outra}, fica com a menor)`;
        // A carta descartada volta para o baralho.
        usadas.splice(usadas.lastIndexOf(Math.max(carta, outra)), 1);
        carta = Math.min(carta, outra);
      }
      updates.push({ _id: id, initiative: carta });
      linhas.push(`<li><b>${esc(c.name)}</b>: carta ${carta}${nota}</li>`);
    }
    if (!updates.length) return this;
    await this.updateEmbeddedDocuments("Combatant", updates);

    if (updateTurn && currentId && game.user.isGM) {
      const idx = this.turns.findIndex((t) => t.id === currentId);
      if (idx >= 0) await this.update({ turn: idx });
    }
    await cartaoSimples({ actor: null, titulo: "Iniciativa (cartas de 1 a 10)", html: `<ul class="hdc-ini">${linhas.join("")}</ul><p class="hdc-nota">Age do menor para o maior. A carta vale para o combate inteiro. Dois PJs podem trocar cartas no começo de uma rodada.</p>` });
    return this;
  }
}

/** Ao entrar no combate, uma criatura ganha uma entrada extra por ponto de Ferocidade acima de 1. */
export function registrarHooksCombate() {
  Hooks.on("createCombatant", async (combatant, options, userId) => {
    if (userId !== game.user.id || options?.hdcExtra) return;
    const actor = combatant.actor;
    if (actor?.type !== "criatura") return;
    const fer = actor.system.ferocidade ?? 1;
    if (fer <= 1) return;
    const combat = combatant.parent;
    const ja = combat.combatants.filter((c) => c.tokenId === combatant.tokenId && c.actorId === combatant.actorId).length;
    const faltam = fer - ja;
    if (faltam <= 0) return;
    const base = combatant.name ?? actor.name;
    const novos = Array.from({ length: faltam }, (_, i) => ({
      tokenId: combatant.tokenId,
      sceneId: combatant.sceneId,
      actorId: combatant.actorId,
      hidden: combatant.hidden,
      name: `${base} (${ja + i + 1})`
    }));
    await combat.createEmbeddedDocuments("Combatant", novos, { hdcExtra: true });
  });
}
