/**
 * Rolagens do Year Zero Engine adaptadas para Hora de Caçar.
 *  - Parada de d6; cada 6 é um sucesso.
 *  - Forçar: uma vez por teste, marca uma condição do tipo do atributo e rola de novo os dados que não deram 6.
 *  - Quebrado: nenhum teste tem sucesso até ser tratado.
 */
import { SYSTEM_ID, HDC } from "./config.mjs";

const { DialogV2 } = foundry.applications.api;

/* -------------------------------------------- */
/*  Utilidades                                  */
/* -------------------------------------------- */

export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/**
 * Aplica o modo de visibilidade escolhido no chat (público, só GM, cego, só eu).
 * v14 renomeou ChatMessage.applyRollMode → ChatMessage.applyMode (o antigo ficou obsoleto).
 */
export function aplicarModo(chatData) {
  if (typeof ChatMessage.applyMode === "function") return ChatMessage.applyMode(chatData) ?? chatData;
  const modo = game.settings.get("core", "rollMode");
  return ChatMessage.applyRollMode(chatData, modo) ?? chatData;
}

export async function rolarD6(n) {
  const roll = await new Roll(`${Math.max(1, n)}d6`).evaluate();
  const resultados = roll.dice[0].results.map((r) => r.result);
  return { roll, resultados };
}

export async function rolarFormula(formula) {
  const roll = await new Roll(formula).evaluate();
  return roll;
}

export async function mostrarDados(roll) {
  if (game.dice3d) {
    try { await game.dice3d.showForRoll(roll, game.user, true); } catch (e) { /* ignora */ }
  }
}

function contar(resultados) {
  return resultados.filter((r) => r === 6).length;
}

function htmlDados(resultados, forcados = [], foiForcado = false) {
  const um = (r, cls = "") => `<span class="hdc-die ${r === 6 ? "sucesso" : ""} ${cls}">${r}</span>`;
  let h = `<div class="hdc-dice">${resultados.map((r) => um(r, foiForcado && r !== 6 ? "riscado" : "")).join("")}</div>`;
  if (forcados.length) h += `<div class="hdc-dice forcados"><span class="rot">Forçado:</span>${forcados.map((r) => um(r, "f")).join("")}</div>`;
  return h;
}

/** Ator "atual" do usuário: personagem atribuído ou token selecionado. */
export function atorDoUsuario() {
  const tok = canvas?.tokens?.controlled?.[0];
  return tok?.actor ?? game.user.character ?? null;
}

/** Alvos para aplicar efeitos: tokens marcados como alvo, senão selecionados. */
export function alvosAtuais() {
  const alvos = [...(game.user.targets ?? [])].map((t) => t.actor).filter(Boolean);
  if (alvos.length) return alvos;
  return (canvas?.tokens?.controlled ?? []).map((t) => t.actor).filter(Boolean);
}

/* -------------------------------------------- */
/*  Diálogo de teste                            */
/* -------------------------------------------- */

/**
 * Mostra o diálogo de modificadores e devolve as escolhas, ou null se cancelado.
 * @param {Actor} actor
 * @param {object} cfg  { titulo, periciaKey, atributoKey, base (dados antes de mods), partes:[{label,valor}], dificuldade, extrasHTML }
 */
export async function dialogoTeste(actor, cfg) {
  const opcoes = [];
  const sys = actor?.system ?? {};
  const pk = cfg.periciaKey;
  const pLabel = HDC.pericias[pk]?.label;

  if (actor?.type === "cacador") {
    // Vantagem da Estrada
    if (sys.vantagem?.pericia && sys.vantagem.pericia === pk && !sys.vantagem.usada)
      opcoes.push({ id: "vantagem", label: `Vantagem: ${sys.vantagem.descricao || pLabel} (+2, uma vez por sessão)`, valor: 2 });
    // Registrar (diário)
    if (!sys.diario?.registrarUsado)
      opcoes.push({ id: "registrar", label: "Registrar: ler uma entrada do diário em voz alta (+2, uma vez por sessão)", valor: 2 });
    // Itens do ator ligados à perícia
    for (const it of actor.items) {
      const s = it.system;
      if (it.type === "talento" && s.bonus && s.pericia === pk)
        opcoes.push({ id: `item-${it.id}`, label: `Talento ${it.name} (${s.bonus > 0 ? "+" : ""}${s.bonus})`, valor: s.bonus, itemId: it.id });
      if (it.type === "equipamento" && s.bonus && s.pericia === pk)
        opcoes.push({ id: `item-${it.id}`, label: `${it.name} (${s.bonus > 0 ? "+" : ""}${s.bonus}${s.uso ? ", " + s.uso : ""})`, valor: s.bonus, itemId: it.id });
      if (it.type === "marca" && pLabel && HDC.normalizar(s.pericia) === HDC.normalizar(pLabel)) {
        if (s.tipo === "revelacao") opcoes.push({ id: `item-${it.id}`, label: `Revelação ${it.name} (+${s.mod}, uma vez por sessão)`, valor: Math.abs(s.mod), itemId: it.id, marcaUso: true });
        else opcoes.push({ id: `item-${it.id}`, label: `Defeito ${it.name} (${s.mod}) — só se o Narrador ativou`, valor: -Math.abs(s.mod), itemId: it.id });
      }
    }
  }
  for (const o of cfg.opcoesExtras ?? []) opcoes.push(o);

  const partes = (cfg.partes ?? []).map((p) => `<li>${esc(p.label)}: <b>${p.valor >= 0 ? "+" : ""}${p.valor}</b></li>`).join("");
  const dif = cfg.dificuldade ?? 1;
  const content = `
  <div class="hdc-roll-dialog">
    <ul class="partes">${partes}</ul>
    <div class="form-group"><label>Dificuldade</label>
      <select name="dificuldade">${Object.entries(HDC.dificuldades).map(([k, v]) => `<option value="${k}" ${Number(k) === dif ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="form-group"><label>Ajuda de outros PJs</label>
      <select name="ajuda"><option value="0">Nenhuma</option><option value="1">+1</option><option value="2">+2</option><option value="3">+3</option></select></div>
    <div class="form-group"><label>Outros modificadores</label>
      <input type="number" name="mod" value="0" step="1"></div>
    ${opcoes.map((o) => `<label class="opt"><input type="checkbox" name="${o.id}" ${o.marcado ? "checked" : ""}> ${esc(o.label)}</label>`).join("")}
    ${cfg.extrasHTML ?? ""}
  </div>`;

  const res = await DialogV2.wait({
    window: { title: cfg.titulo ?? "Teste" },
    classes: ["hdc-dialog"],
    content,
    buttons: [
      {
        action: "rolar",
        label: "Rolar",
        icon: "fas fa-dice-six",
        default: true,
        callback: (event, button) => {
          const f = button.form.elements;
          const usados = opcoes.filter((o) => f[o.id]?.checked);
          return {
            dificuldade: Number(f.dificuldade.value) || 1,
            ajuda: Number(f.ajuda.value) || 0,
            mod: Number(f.mod.value) || 0,
            usados,
            form: f
          };
        }
      },
      { action: "cancelar", label: "Cancelar" }
    ],
    rejectClose: false
  });
  if (!res || res === "cancelar") return null;
  return res;
}

/* -------------------------------------------- */
/*  Teste principal                             */
/* -------------------------------------------- */

/**
 * Faz um teste de parada de dados e manda para o chat.
 * @param {object} o
 * @param {Actor} o.actor
 * @param {string} o.titulo
 * @param {number} o.dados          total de dados (já com modificadores)
 * @param {Array}  o.partes         [{label, valor}] para mostrar a conta
 * @param {number} o.dificuldade
 * @param {string|null} o.tipoCondicao  "fisica" | "mental" | null (define o que Forçar marca)
 * @param {boolean} o.podeForcar
 * @param {object} o.ataque         {nome, dano, danoTexto, alvoCriatura}
 * @param {object} o.medo           {pavor}
 * @param {string} o.nota
 */
export async function teste(o) {
  const actor = o.actor;
  const dados = Math.max(1, Math.round(o.dados));
  const { roll, resultados } = await rolarD6(dados);

  const quebrado = actor?.type === "cacador" && actor.system.quebrado;
  const flags = {
    tipo: "teste",
    actorUuid: actor?.uuid ?? null,
    titulo: o.titulo,
    dados,
    partes: o.partes ?? [],
    dificuldade: o.dificuldade ?? 1,
    tipoCondicao: o.tipoCondicao ?? null,
    podeForcar: o.podeForcar ?? actor?.type === "cacador",
    resultados,
    forcados: [],
    forcado: false,
    quebrado,
    ataque: o.ataque ?? null,
    medo: o.medo ?? null,
    nota: o.nota ?? ""
  };

  const chatData = {
    speaker: ChatMessage.getSpeaker({ actor }),
    content: renderCartao(flags),
    rolls: [roll],
    flags: { [SYSTEM_ID]: flags }
  };
  return ChatMessage.create(aplicarModo(chatData));
}

/** Monta o HTML do cartão de teste a partir das flags. */
export function renderCartao(f) {
  const todos = f.resultados.filter((r) => r === 6).concat(f.forcados);
  const sucessos = f.quebrado ? 0 : contar(todos);
  const ok = sucessos >= f.dificuldade;
  const extras = Math.max(0, sucessos - f.dificuldade);
  const partes = (f.partes ?? []).map((p) => `${esc(p.label)} ${p.valor >= 0 ? "+" : ""}${p.valor}`).join(" · ");

  let corpo = "";
  if (f.quebrado) corpo += `<p class="hdc-aviso">Quebrado: nenhum teste tem sucesso até alguém tratar o Caçador.</p>`;

  if (f.ataque) {
    const a = f.ataque;
    if (ok && a.dano !== null && a.dano !== undefined) {
      const total = a.dano + extras;
      corpo += `<div class="hdc-dano">Dano: <b>${total}</b> <small>(arma ${a.dano} + ${extras} extra${extras === 1 ? "" : "s"}, antes de esquiva/aparar e proteção)</small></div>`;
      corpo += `<div class="hdc-botoes"><button type="button" data-hdc="aplicar-dano" data-dano="${total}" data-tipo="${a.tipoDano ?? "fisico"}"><i class="fas fa-heart-crack"></i> Aplicar dano aos alvos</button>`;
      if (sucessos >= 3) corpo += `<button type="button" data-hdc="golpe-critico"><i class="fas fa-burst"></i> Golpe crítico em criatura</button>`;
      corpo += `</div>`;
    } else if (ok && a.danoTexto) {
      corpo += `<div class="hdc-dano">Efeito: <b>${esc(a.danoTexto)}</b></div>`;
    }
  }

  if (f.medo) {
    if (!ok && !f.quebrado) {
      corpo += `<p>Falhou no Medo: fica <b>Aterrorizado</b> por 1D3 rodadas e sofre 1 condição mental. Reações: ${HDC.reacoesAterrorizado.join(", ")}.</p>`;
      corpo += `<div class="hdc-botoes"><button type="button" data-hdc="falha-medo"><i class="fas fa-ghost"></i> Aplicar falha de Medo</button></div>`;
    } else if (ok) {
      corpo += `<p>Sente medo, mas age normalmente e não é mais afetado por esta criatura.</p>`;
    }
  }

  if (f.nota) corpo += `<p class="hdc-nota">${esc(f.nota)}</p>`;

  let botoes = "";
  if (f.podeForcar && !f.forcado && !f.quebrado && f.resultados.some((r) => r !== 6)) {
    botoes = `<div class="hdc-botoes forcar"><button type="button" data-hdc="forcar"><i class="fas fa-fire"></i> Forçar (marca condição ${f.tipoCondicao === "mental" ? "mental" : "física"})</button>
      <button type="button" data-hdc="forcar-livre" title="Teimoso / Sortudo / regra da mesa: rola de novo sem marcar condição"><i class="fas fa-rotate"></i> Sem condição</button></div>`;
  }

  return `
  <div class="hdc-card ${ok ? "ok" : "falha"}">
    <header><h3>${esc(f.titulo)}</h3><div class="conta">${f.dados} dados${partes ? ` · <small>${partes}</small>` : ""}</div></header>
    ${htmlDados(f.resultados, f.forcado ? (f.forcadosTodos ?? []) : [], f.forcado)}
    <div class="hdc-resultado"><span class="n">${sucessos}</span> sucesso${sucessos === 1 ? "" : "s"}
      <span class="dif">/ ${f.dificuldade} necessário${f.dificuldade === 1 ? "" : "s"}</span>
      <span class="veredito">${ok ? (extras ? `Sucesso · ${extras} extra${extras === 1 ? "" : "s"}` : "Sucesso") : "Falha"}</span>
    </div>
    ${f.forcado ? `<div class="hdc-tag">Teste forçado${f.forcadoLivre ? " (sem condição)" : ""}</div>` : ""}
    ${corpo}
    ${botoes}
  </div>`;
}

/* -------------------------------------------- */
/*  Forçar                                      */
/* -------------------------------------------- */

export async function forcar(message, { livre = false } = {}) {
  const f = foundry.utils.deepClone(message.flags?.[SYSTEM_ID]);
  if (!f || f.forcado) return ui.notifications.warn("Este teste já foi forçado.");
  const actor = f.actorUuid ? await fromUuid(f.actorUuid) : null;
  if (actor && !actor.isOwner) return ui.notifications.warn("Só o dono do personagem pode forçar.");

  const tipo = f.tipoCondicao ?? "fisica";
  if (actor?.type === "cacador") {
    const qb = tipo === "fisica" ? actor.system.condicoes.quebradoFisico : actor.system.condicoes.quebradoMental;
    if (qb) return ui.notifications.warn("Não dá para forçar quando já está Quebrado nesse tipo de condição.");
  }

  const relancar = f.resultados.filter((r) => r !== 6).length;
  if (!relancar) return ui.notifications.info("Todos os dados já deram 6.");

  const { roll, resultados } = await rolarD6(relancar);
  await mostrarDados(roll);

  f.forcado = true;
  f.forcadoLivre = livre;
  f.forcadosTodos = resultados;
  f.forcados = resultados.filter((r) => r === 6);
  // Os dados forçados substituem os que não deram 6.
  await message.update({ content: renderCartao(f), [`flags.${SYSTEM_ID}`]: f });

  // A condição vem depois da rolagem (pode deixar Quebrado justamente por ter conseguido).
  if (!livre && actor?.type === "cacador") await actor.marcarCondicao(tipo, 1, { motivo: "forçou o teste" });
}

/* -------------------------------------------- */
/*  Outras rolagens                             */
/* -------------------------------------------- */

/** Cartão simples (texto + dados opcionais). */
export async function cartaoSimples({ actor, titulo, html, roll = null, flags = {} }) {
  const chatData = {
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `<div class="hdc-card simples"><header><h3>${esc(titulo)}</h3></header>${html}</div>`,
    flags: { [SYSTEM_ID]: { tipo: "simples", actorUuid: actor?.uuid ?? null, ...flags } }
  };
  if (roll) {
    chatData.rolls = [roll];
    return ChatMessage.create(aplicarModo(chatData));
  }
  return ChatMessage.create(chatData);
}

/** Rolagem de D66 (dezena e unidade). */
export async function rolarD66() {
  const roll = await new Roll("1d6 + 1d6").evaluate();
  const [a, b] = roll.dice.map((d) => d.results[0].result);
  return { roll, valor: a * 10 + b };
}

/** Rolagem de dados "nus" (criaturas, PNJs, Recursos, proteção...). Conta 6s. */
export async function paradaSimples({ actor, titulo, dados, nota = "", extraHTML = "", dificuldade = null }) {
  const { roll, resultados } = await rolarD6(dados);
  const s = contar(resultados);
  const dif = dificuldade ? ` <span class="dif">/ ${dificuldade}</span> <span class="veredito">${s >= dificuldade ? "Sucesso" : "Falha"}</span>` : "";
  const html = `${htmlDados(resultados)}<div class="hdc-resultado"><span class="n">${s}</span> sucesso${s === 1 ? "" : "s"}${dif}</div>${nota ? `<p class="hdc-nota">${nota}</p>` : ""}${extraHTML}`;
  await cartaoSimples({ actor, titulo: `${titulo} (${dados} dados)`, html, roll });
  return s;
}
