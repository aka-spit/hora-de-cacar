/**
 * Hora de Caçar — sistema para Foundry VTT (v13/v14).
 * Ponto de entrada: registra modelos, documentos, fichas, combate e os botões do chat.
 */
import { SYSTEM_ID, HDC } from "./config.mjs";
import * as models from "./models.mjs";
import { HDCActor } from "./actor.mjs";
import { HDCCombat, registrarHooksCombate } from "./combat.mjs";
import { CacadorSheet, PnjSheet, CriaturaSheet, HDCItemSheet } from "./sheets.mjs";
import { forcar, alvosAtuais, atorDoUsuario, cartaoSimples, rolarFormula, mostrarDados, esc } from "./dice.mjs";
import { CRITICOS } from "./criticos.mjs";
import { abrirCriacao } from "./criacao.mjs";
import { yzeCombatAtivo, integrarYearZeroCombat, estadoYzec } from "./yze-combat.mjs";

const A = `systems/${SYSTEM_ID}/assets/icons`;
const ICONES = {
  arma: `${A}/item-revolver.svg`,
  protecao: `${A}/item-kevlar-vest.svg`,
  equipamento: `${A}/item-toolbox.svg`,
  talento: `${A}/talento-star-medal.svg`,
  marca: "icons/svg/blood.svg",
  rito: `${A}/rito-prayer.svg`,
  cacador: "icons/svg/mystery-man.svg",
  pnj: `${A}/pnj-person.svg`,
  criatura: `${A}/criatura-ghost.svg`
};

Hooks.once("init", () => {
  console.log(`${SYSTEM_ID} | Iniciando Hora de Caçar`);
  CONFIG.HDC = HDC;

  // Documentos e modelos
  CONFIG.Actor.documentClass = HDCActor;
  // Com o módulo Year Zero Combat ativo, ele cuida do combate (cartas, ações lenta/rápida).
  // Sem ele, o sistema usa a própria iniciativa por cartas.
  if (!yzeCombatAtivo()) CONFIG.Combat.documentClass = HDCCombat;
  Object.assign(CONFIG.Actor.dataModels, {
    cacador: models.CacadorData,
    pnj: models.PnjData,
    criatura: models.CriaturaData
  });
  Object.assign(CONFIG.Item.dataModels, {
    arma: models.ArmaData,
    protecao: models.ProtecaoData,
    equipamento: models.EquipamentoData,
    talento: models.TalentoData,
    marca: models.MarcaData,
    rito: models.RitoData
  });

  CONFIG.Actor.trackableAttributes = {
    cacador: { bar: [], value: ["condicoes.fisica.value", "condicoes.mental.value", "xp.value"] },
    pnj: { bar: [], value: ["resistencia.fisica.dano", "resistencia.mental.dano"] },
    criatura: { bar: ["vida"], value: ["armadura", "ferocidade"] }
  };

  // Iniciativa por cartas (fallback se algo chamar a fórmula diretamente)
  CONFIG.Combat.initiative = { formula: "1d10", decimals: 0 };

  // Fichas
  const Actors = foundry.documents.collections?.Actors ?? globalThis.Actors;
  const Items = foundry.documents.collections?.Items ?? globalThis.Items;
  try { Actors.unregisterSheet("core", foundry.appv1?.sheets?.ActorSheet ?? globalThis.ActorSheet); } catch (e) { /* ok */ }
  try { Items.unregisterSheet("core", foundry.appv1?.sheets?.ItemSheet ?? globalThis.ItemSheet); } catch (e) { /* ok */ }
  Actors.registerSheet(SYSTEM_ID, CacadorSheet, { types: ["cacador"], makeDefault: true, label: "Dossiê de Caçador" });
  Actors.registerSheet(SYSTEM_ID, PnjSheet, { types: ["pnj"], makeDefault: true, label: "Ficha de PNJ" });
  Actors.registerSheet(SYSTEM_ID, CriaturaSheet, { types: ["criatura"], makeDefault: true, label: "Ficha de Criatura" });
  Items.registerSheet(SYSTEM_ID, HDCItemSheet, { makeDefault: true, label: "Ficha de Item" });

  if (yzeCombatAtivo()) integrarYearZeroCombat();
  else registrarHooksCombate();
  game.settings.register(SYSTEM_ID, "boasVindas", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(SYSTEM_ID, "soNarradorDestrava", {
    name: "Só o Narrador destrava fichas",
    hint: "Com a ficha de Caçador trancada (cadeado), jogadores não conseguem destravar nem mudar atributos e perícias.",
    scope: "world", config: true, type: Boolean, default: true
  });
  game.settings.register(SYSTEM_ID, "abrirCriacao", {
    name: "Abrir a criação guiada em Caçadores novos",
    hint: "Quando alguém cria um Caçador em branco, o assistente de criação abre sozinho.",
    scope: "client", config: true, type: Boolean, default: true
  });

  const loadTemplates = foundry.applications.handlebars?.loadTemplates ?? globalThis.loadTemplates;
  loadTemplates([
    `systems/${SYSTEM_ID}/templates/actor/cacador.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/pnj.hbs`,
    `systems/${SYSTEM_ID}/templates/actor/criatura.hbs`,
    `systems/${SYSTEM_ID}/templates/item/item.hbs`
  ]);

  // API pública para macros: game.horaDeCacar.medo(2), etc.
  game.horaDeCacar = {
    HDC,
    CRITICOS,
    medo: (pavor = 1) => atorDoUsuario()?.rolarMedo(pavor),
    teste: (pericia) => atorDoUsuario()?.rolarTeste({ pericia }),
    novaSessaoTodos: async () => {
      if (!game.user.isGM) return;
      for (const a of game.actors.filter((x) => x.type === "cacador")) await a.novaSessao();
    },
    autoteste,
    criar: (actor) => abrirCriacao(actor ?? atorDoUsuario())
  };
});

/**
 * Autoteste para rodar dentro do Foundry (Narrador): cria atores de teste, abre as fichas,
 * exercita condições, dano e críticos, e mostra um relatório no chat e no console (F12).
 * Uso: game.horaDeCacar.autoteste()
 */
async function autoteste() {
  if (!game.user.isGM) return ui.notifications.warn("Rode o autoteste como Narrador.");
  const r = [];
  const ok = (cond, msg) => { r.push(`${cond ? "✅" : "❌"} ${msg}`); if (!cond) console.error(`${SYSTEM_ID} | FALHOU: ${msg}`); };
  const tenta = async (msg, fn) => { try { const v = await fn(); ok(v !== false, msg); return v; } catch (e) { console.error(e); ok(false, `${msg} — ${e.message}`); } };

  const pasta = await Folder.create({ name: "Autoteste Hora de Caçar", type: "Actor" });
  const cac = await tenta("Criar Caçador", () => Actor.create({ name: "Rita (teste)", type: "cacador", folder: pasta.id,
    system: { atributos: { forca: { value: 3 }, agilidade: { value: 4 }, raciocinio: { value: 3 }, empatia: { value: 4 } }, pericias: { pontaria: { value: 3 } }, recursos: { value: 3 } } }, { hdcSemAssistente: true }));
  const pnj = await tenta("Criar PNJ", () => Actor.create({ name: "Capanga (teste)", type: "pnj", folder: pasta.id, system: { pericias: "Combate 6, Força Bruta 4", resistencia: { fisica: { max: 2 } } } }));
  const cri = await tenta("Criar Criatura", () => Actor.create({ name: "Lobisomem (teste)", type: "criatura", folder: pasta.id, system: { ferocidade: 2, vida: { value: 9, max: 9 }, armadura: 1, ataques: { a1: { nome: "Garras", tipo: "fisico", dados: 8, dano: 2 } } } }));
  if (!cac || !pnj || !cri) return cartaoSimples({ actor: null, titulo: "Autoteste", html: `<p>${r.join("<br>")}</p>` });

  await tenta("Adicionar arma e talento Durão ao Caçador", () => cac.createEmbeddedDocuments("Item", [
    { name: "Pistola", type: "arma", system: { dano: "2", alcance: "0a1", bonus: 2, pericia: "pontaria" } },
    { name: "Durão", type: "talento" }
  ]));
  ok(cac.system.condicoes.fisica.max === 4, "Durão cria a 4ª caixa física");
  ok(cac.system.capital === 1, "Capital = Recursos − 2");

  for (const a of [cac, pnj, cri]) {
    await tenta(`Abrir ficha de ${a.type}`, async () => { await a.sheet.render({ force: true }); await new Promise((res) => setTimeout(res, 400)); const el = a.sheet.element; await a.sheet.close(); return !!el; });
  }
  const item = cac.items.find((i) => i.type === "arma");
  await tenta("Abrir ficha de item", async () => { await item.sheet.render({ force: true }); await new Promise((res) => setTimeout(res, 300)); await item.sheet.close(); });

  await cac.marcarCondicao("fisica", 2, { motivo: "autoteste" });
  ok(cac.system.condicoes.fisica.value === 2, "Marcar 2 condições físicas");
  ok(cac.calcularParada("agilidade", "pontaria").partes.some((p) => p.valor === -2), "Condições tiram dados da parada");
  await cac.marcarCondicao("fisica", 3, { motivo: "autoteste" });
  ok(cac.system.condicoes.quebradoFisico, "Passar da última caixa deixa Quebrado");
  ok(cac.items.some((i) => i.type === "marca"), "Ferimento crítico criou o Defeito/Revelação");
  await cac.curarCondicao("fisica", 5);
  ok(!cac.system.condicoes.quebradoFisico && cac.system.condicoes.fisica.value === 0, "Cura remove Quebrado e condições");

  await pnj.aplicarDano(3);
  ok(pnj.system.foraDeCena.fisica, "PNJ sai da cena quando o dano passa da Resistência");
  await cri.aplicarDano(3);
  ok(cri.system.vida.value === 7, "Criatura: dano 3 − Armadura 1 = −2 Vida");
  await cri.aplicarDano(3, { ignorarArmadura: true });
  ok(cri.system.vida.value === 4, "Fraqueza ignora a Armadura");
  await tenta("Ataque característico da criatura", () => cri.ataqueCriatura(1));

  ok(cri.system.iniciativa.velocidade === 2, "Ferocidade 2 vira 2 entradas de iniciativa");
  const yz = estadoYzec();
  if (yz) {
    ok(yz.speed === "system.iniciativa.velocidade", `Year Zero Combat lê a Ferocidade (${yz.speed || "vazio"})`);
    ok(yz.draw === "system.iniciativa.cartas", `Year Zero Combat lê as cartas extras (${yz.draw || "vazio"})`);
    ok(Number(yz.ordem) === 1, "Year Zero Combat em ordem crescente (menor carta age primeiro)");
    r.push(`ℹ️ Combate controlado pelo módulo Year Zero Combat (${yz.classeCombate}). Teste à mão: crie um encontro, comece o combate e veja a criatura entrar 2 vezes.`);
  } else await tenta("Iniciativa por cartas e Ferocidade", async () => {
    const combat = await Combat.create({ scene: canvas.scene?.id ?? null, active: false });
    await combat.createEmbeddedDocuments("Combatant", [{ actorId: cac.id, name: cac.name }, { actorId: cri.id, name: cri.name }]);
    await new Promise((res) => setTimeout(res, 500));
    const entradasCri = combat.combatants.filter((c) => c.actorId === cri.id).length;
    await combat.rollAll();
    const cartas = combat.combatants.map((c) => c.initiative);
    const ordem = combat.turns.map((t) => t.initiative);
    await combat.delete();
    ok(entradasCri === 2, `Criatura com Ferocidade 2 entrou 2 vezes (entrou ${entradasCri})`);
    ok(cartas.every((c) => c >= 1 && c <= 10) && new Set(cartas).size === cartas.length, `Cartas de 1 a 10 sem repetir (${cartas.join(", ")})`);
    return ordem.every((v, i, a) => i === 0 || a[i - 1] <= v);
  });

  ok(typeof abrirCriacao === "function", "Assistente de criação carregado");

  const falhas = r.filter((x) => x.startsWith("❌")).length;
  await cartaoSimples({ actor: null, titulo: `Autoteste: ${falhas ? falhas + " falha(s)" : "tudo certo"}`, html: `<p>${r.join("<br>")}</p><p class="hdc-nota">Os atores de teste estão na pasta "Autoteste Hora de Caçar". Pode apagar a pasta depois.</p>` });
  console.log(`${SYSTEM_ID} | Autoteste\n${r.join("\n")}`);
  return falhas === 0;
}

/* Cadeado: bloqueia mudanças em atributos e perícias de fichas trancadas, venham de onde vierem. */
Hooks.on("preUpdateActor", (actor, changes, options, userId) => {
  if (actor.type !== "cacador" || game.user.isGM || options?.hdcCriacao) return;
  const sys = changes.system ?? {};
  const travadoAgora = actor.system.travado;
  // Jogador tentando destravar quando só o Narrador pode.
  if (travadoAgora && sys.travado === false && game.settings.get(SYSTEM_ID, "soNarradorDestrava")) {
    delete sys.travado;
    ui.notifications.warn("Só o Narrador pode destravar esta ficha.");
  }
  const vaiFicarTravado = sys.travado ?? travadoAgora;
  if (vaiFicarTravado && (sys.atributos || sys.pericias)) {
    delete sys.atributos;
    delete sys.pericias;
    ui.notifications.warn("Ficha trancada: atributos e perícias não foram alterados.");
  }
});

/* Caçador novo em branco: abre a criação guiada para quem criou. */
Hooks.on("createActor", (actor, options, userId) => {
  if (userId !== game.user.id || actor.type !== "cacador" || options?.hdcSemAssistente) return;
  if (actor.system.perfil?.ocupacao || actor.getFlag(SYSTEM_ID, "criado")) return;
  if (!game.settings.get(SYSTEM_ID, "abrirCriacao")) return;
  setTimeout(() => abrirCriacao(actor), 250);
});

/* Ícones padrão por tipo */
Hooks.on("preCreateItem", (item, data) => {
  if (!data.img || data.img === "icons/svg/item-bag.svg") {
    const img = ICONES[item.type];
    if (img && img !== data.img) item.updateSource({ img });
  }
});
Hooks.on("preCreateActor", (actor, data) => {
  if (!data.img || data.img === "icons/svg/mystery-man.svg") {
    const img = ICONES[actor.type];
    if (img && img !== data.img) actor.updateSource({ img });
  }
});

/* -------------------------------------------- */
/*  Botões nos cartões do chat                  */
/* -------------------------------------------- */

Hooks.on("renderChatMessageHTML", (message, html) => {
  const f = message.flags?.[SYSTEM_ID];
  if (!f) return;
  const root = html instanceof HTMLElement ? html : html[0];
  if (!root) return;

  // Só o dono do personagem vê o botão de Forçar.
  const dono = f.actorUuid ? fromUuidSync(f.actorUuid)?.isOwner : game.user.isGM;
  if (!dono) root.querySelectorAll(".hdc-botoes.forcar").forEach((el) => el.remove());

  root.querySelectorAll("[data-hdc]").forEach((btn) => {
    btn.addEventListener("click", async (ev) => {
      ev.preventDefault();
      btn.disabled = true;
      try {
        await acaoChat(btn.dataset.hdc, btn.dataset, message);
      } finally {
        btn.disabled = false;
      }
    });
  });
});

async function acaoChat(acao, d, message) {
  const f = message.flags?.[SYSTEM_ID] ?? {};
  const autor = f.actorUuid ? await fromUuid(f.actorUuid) : null;

  switch (acao) {
    case "forcar": return forcar(message);
    case "forcar-livre": return forcar(message, { livre: true });

    case "aplicar-dano": {
      const alvos = alvosAtuais();
      if (!alvos.length) return ui.notifications.warn("Marque um alvo (T) ou selecione um token.");
      const res = await foundry.applications.api.DialogV2.wait({
        window: { title: "Aplicar dano" },
        content: `<div class="hdc-roll-dialog">
          <p>Alvos: <b>${alvos.map((a) => esc(a.name)).join(", ")}</b></p>
          <div class="form-group"><label>Dano (já descontando esquiva/aparar e proteção)</label><input type="number" name="dano" value="${Number(d.dano) || 0}" min="0"></div>
          <div class="form-group"><label>Tipo</label><select name="tipo"><option value="fisico" ${d.tipo !== "mental" ? "selected" : ""}>Físico</option><option value="mental" ${d.tipo === "mental" ? "selected" : ""}>Mental</option></select></div>
          <label class="opt"><input type="checkbox" name="fraqueza"> Usou a fraqueza (criatura: ignora Armadura)</label>
        </div>`,
        buttons: [{ action: "ok", label: "Aplicar", default: true, callback: (e, b) => ({ dano: Number(b.form.elements.dano.value) || 0, tipo: b.form.elements.tipo.value, fraqueza: b.form.elements.fraqueza.checked }) }, { action: "cancelar", label: "Cancelar" }],
        rejectClose: false
      });
      if (!res || typeof res !== "object") return;
      for (const a of alvos) {
        if (!a.isOwner) { ui.notifications.warn(`Sem permissão para alterar ${a.name}. Peça ao Narrador.`); continue; }
        await a.aplicarDano(res.dano, { tipo: res.tipo, ignorarArmadura: res.fraqueza, motivo: f.titulo });
      }
      return;
    }

    case "golpe-critico": {
      const r = await rolarFormula("1d6");
      await mostrarDados(r);
      return cartaoSimples({ actor: autor, titulo: "Golpe crítico em criatura", roll: r, html: `<div class="hdc-dice"><span class="hdc-die">${r.total}</span></div><p>${esc(HDC.golpeCriticoCriatura[r.total])}</p>` });
    }

    case "falha-medo": {
      if (!autor?.isOwner) return ui.notifications.warn("Só o dono do personagem aplica a falha.");
      const r = await rolarFormula("1d3");
      await mostrarDados(r);
      await cartaoSimples({ actor: autor, titulo: `${autor.name} está Aterrorizado`, roll: r, html: `<p>Por <b>${r.total}</b> rodada(s). Escolha uma reação: <b>Fugir</b> (todas as ações para escapar), <b>Congelar</b> (nenhuma ação), <b>Desmaiar</b> (inconsciente) ou <b>Atacar</b> (o alvo hostil mais próximo, sem ação rápida).</p>` });
      return autor.marcarCondicao("mental", 1, { motivo: "falhou no Medo" });
    }

    case "medo": {
      const a = atorDoUsuario();
      if (!a || a.type !== "cacador") return ui.notifications.warn("Selecione o token do seu Caçador (ou defina seu personagem nas configurações de usuário).");
      return a.rolarMedo(Number(d.pavor) || 1, d.origem ?? "");
    }

    case "resistir": {
      const a = atorDoUsuario();
      if (!a || a.type !== "cacador") return ui.notifications.warn("Selecione o token do seu Caçador.");
      const nota = d.mental ? `Ataque mental de ${d.mental} condição(ões): cada sucesso reduz uma. Aplique o restante com o botão de dano ou na ficha.` : "Para evitar a Maldição, precisa de pelo menos tantos sucessos quanto a criatura.";
      return a.rolarTeste({ pericia: d.pericia, titulo: `Resistir: ${HDC.pericias[d.pericia]?.label ?? d.pericia}`, nota });
    }
  }
}

/* Mensagem de boas-vindas para o Narrador no primeiro uso */
Hooks.once("ready", () => {
  if (!game.user.isGM) return;
  const chave = "boasVindas";
  if (!game.settings.get(SYSTEM_ID, chave)) {
    cartaoSimples({
      actor: null,
      titulo: "Hora de Caçar",
      html: `<p>Sistema carregado. Dicas rápidas:</p><ul>
        <li>Clique no nome de um atributo ou perícia na ficha para rolar.</li>
        <li>No cartão do chat, use <b>Forçar</b> para rolar de novo os dados que não deram 6 (marca uma condição).</li>
        <li>Compêndios: Talentos, Arsenal e Monstronomicon (amostra).</li>
        <li>Iniciativa: o rastreador de combate tira cartas de 1 a 10 e ordena do menor para o maior.</li></ul>`
    });
    game.settings.set(SYSTEM_ID, chave, true);
  }
});
