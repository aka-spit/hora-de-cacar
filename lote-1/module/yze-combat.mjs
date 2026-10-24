/**
 * Integração com o módulo "Year Zero Engine: Combat" (id: yze-combat).
 * https://github.com/fvtt-fria-ligan/yearzero-combat-fvtt
 *
 * O módulo substitui Combat, Combatant, Cards e o rastreador de combate do Foundry e já faz:
 *  - iniciativa por cartas de 1 a 10 (baralho de verdade, com pilha de descarte), do menor para o maior;
 *  - várias entradas por token ("speed") → aqui é a Ferocidade das criaturas;
 *  - tirar várias cartas e ficar com a melhor ("draw size") → aqui é o talento Reflexos de Quem Já Foi Emboscado;
 *  - ações lenta e rápida como efeitos de status, troca de cartas, grupos de iniciativa.
 *
 * Com o módulo ativo, o sistema NÃO registra a própria classe de Combate (para não brigar com ele)
 * e só informa onde ler esses valores. Sem o módulo, o sistema usa combat.mjs.
 */
import { SYSTEM_ID } from "./config.mjs";

export const YZEC_ID = "yze-combat";

export function yzeCombatAtivo() {
  return !!game.modules?.get(YZEC_ID)?.active;
}

/** Valores que o sistema passa ao módulo (chaves de configuração do módulo). */
export const CONFIG_YZEC = {
  // Quantas entradas no combate (Ferocidade das criaturas; 1 para Caçadores e PNJs).
  actorSpeedAttribute: "system.iniciativa.velocidade",
  // Quantas cartas tirar (2 com Reflexos de Quem Já Foi Emboscado).
  actorDrawSizeAttribute: "system.iniciativa.cartas",
  // Menor carta age primeiro (Cap. 5).
  initSortOrder: 1,
  // Criaturas com Ferocidade > 1 ganham as entradas extras ao começar o combate.
  duplicateCombatantOnCombatStart: true,
  // "Fica com a melhor (a mais baixa)": escolhe sozinho.
  autoSelectBestCard: true,
  // Uma ação lenta e uma rápida por rodada (Cap. 5).
  slowAndFastActions: true
};

export function integrarYearZeroCombat() {
  console.log(`${SYSTEM_ID} | Year Zero Combat ativo: o combate fica com o módulo.`);

  Hooks.once("yzeCombatReady", async (yzec) => {
    if (!game.user.isGM) return;
    try {
      // Na primeira vez no mundo, grava a configuração completa.
      await yzec.register(CONFIG_YZEC);
      // Garante os caminhos de velocidade e cartas mesmo se o mundo já tinha sido configurado antes.
      for (const chave of ["actorSpeedAttribute", "actorDrawSizeAttribute"]) {
        const atual = game.settings.get(YZEC_ID, chave);
        if (atual !== CONFIG_YZEC[chave]) await game.settings.set(YZEC_ID, chave, CONFIG_YZEC[chave]);
      }
    } catch (e) {
      console.error(`${SYSTEM_ID} | Falha ao configurar o Year Zero Combat`, e);
    }
  });
}

/** Diagnóstico para o autoteste. */
export function estadoYzec() {
  if (!yzeCombatAtivo()) return null;
  const ler = (k) => { try { return game.settings.get(YZEC_ID, k); } catch (e) { return undefined; } };
  return {
    speed: ler("actorSpeedAttribute"),
    draw: ler("actorDrawSizeAttribute"),
    ordem: ler("initSortOrder"),
    classeCombate: CONFIG.Combat.documentClass?.name
  };
}
