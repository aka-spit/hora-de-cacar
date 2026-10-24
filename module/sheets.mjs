/**
 * Fichas (ApplicationV2) de Atores e Itens.
 */
import { SYSTEM_ID, HDC } from "./config.mjs";
import { rolarFormula, mostrarDados, cartaoSimples, esc } from "./dice.mjs";
import { abrirCriacao } from "./criacao.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2, ItemSheetV2 } = foundry.applications.sheets;
const T = (p) => `systems/${SYSTEM_ID}/templates/${p}`;

export const opcoes = (obj, atual) =>
  Object.entries(obj).map(([k, v]) => ({ value: k, label: typeof v === "string" ? v : v.label, selected: String(k) === String(atual) }));

function pontos(valor, max, campo) {
  return Array.from({ length: max }, (_, i) => ({ n: i + 1, on: i < valor, campo }));
}

export function abrirImagem(doc, campo = "img") {
  const FP = foundry.applications.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
  const fp = new FP({ type: "image", current: foundry.utils.getProperty(doc, campo), callback: (path) => doc.update({ [campo]: path }) });
  return fp.browse();
}

/* ============================================ */
/*  Base de ator                                */
/* ============================================ */

export class HDCActorSheetBase extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["hora-de-cacar", "hdc-sheet", "actor"],
    position: { width: 820, height: 880 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      aba: HDCActorSheetBase.#onAba,
      editarImagem: HDCActorSheetBase.#onEditarImagem,
      criarItem: HDCActorSheetBase.#onCriarItem,
      editarItem: HDCActorSheetBase.#onEditarItem,
      apagarItem: HDCActorSheetBase.#onApagarItem,
      alternarItem: HDCActorSheetBase.#onAlternarItem,
      mostrarItem: HDCActorSheetBase.#onMostrarItem,
      ataque: HDCActorSheetBase.#onAtaque,
      itemPoder: HDCActorSheetBase.#onItemPoder
    }
  };

  _aba = null;

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const actor = this.document;
    const porTipo = (t) => actor.items.filter((i) => i.type === t).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
    Object.assign(ctx, {
      actor,
      system: actor.system,
      source: actor.system._source ?? actor.system,
      editavel: this.isEditable,
      config: HDC,
      armas: porTipo("arma").map((i) => ({ item: i, s: i.system, periciaLabel: HDC.pericias[i.system.pericia]?.label ?? i.system.pericia })),
      protecoes: porTipo("protecao"),
      equipamentos: porTipo("equipamento"),
      talentos: porTipo("talento"),
      marcas: porTipo("marca"),
      ritos: porTipo("rito")
    });
    return ctx;
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    const abas = this.element.querySelectorAll("[data-aba-conteudo]");
    if (!abas.length) return;
    const atual = this._aba ?? abas[0].dataset.abaConteudo;
    this._mostrarAba(atual);
  }

  _mostrarAba(id) {
    this._aba = id;
    this.element.querySelectorAll("[data-action='aba']").forEach((b) => b.classList.toggle("ativa", b.dataset.aba === id));
    this.element.querySelectorAll("[data-aba-conteudo]").forEach((s) => (s.hidden = s.dataset.abaConteudo !== id));
  }

  _item(target) {
    const id = target.closest("[data-item-id]")?.dataset.itemId;
    return this.document.items.get(id);
  }

  static #onAba(event, target) { this._mostrarAba(target.dataset.aba); }
  static #onEditarImagem(event, target) { if (this.isEditable) abrirImagem(this.document, target.dataset.edit || "img"); }
  static async #onCriarItem(event, target) {
    const type = target.dataset.type;
    const nomes = { arma: "Nova arma", protecao: "Nova proteção", equipamento: "Novo equipamento", talento: "Novo talento", marca: "Novo Defeito", rito: "Novo rito" };
    const [item] = await this.document.createEmbeddedDocuments("Item", [{ name: nomes[type] ?? "Novo item", type }]);
    item?.sheet.render(true);
  }
  static #onEditarItem(event, target) { this._item(target)?.sheet.render(true); }
  static async #onApagarItem(event, target) {
    const item = this._item(target);
    if (!item) return;
    const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "Apagar item" }, content: `<p>Apagar <b>${esc(item.name)}</b>?</p>`, rejectClose: false });
    if (ok) await item.delete();
  }
  static async #onAlternarItem(event, target) {
    const item = this._item(target);
    const campo = target.dataset.campo;
    if (item && campo) await item.update({ [`system.${campo}`]: !foundry.utils.getProperty(item.system, campo) });
  }
  static async #onMostrarItem(event, target) {
    const item = this._item(target);
    if (!item) return;
    const s = item.system;
    const det = [];
    if (item.type === "arma") det.push(`Dano ${s.dano} · Alcance ${s.alcance} · Bônus ${s.bonus >= 0 ? "+" : ""}${s.bonus} · ${HDC.pericias[s.pericia]?.label ?? ""}`);
    if (item.type === "marca") det.push(`${HDC.tiposMarca[s.tipo]} ${s.natureza === "fisica" ? "físico" : "mental"}: ${s.pericia} ${s.mod > 0 ? "+" : ""}${s.mod}${s.origem ? " · " + s.origem : ""}`);
    await cartaoSimples({ actor: this.document, titulo: item.name, html: `${det.map((d) => `<p><b>${esc(d)}</b></p>`).join("")}<p>${esc(s.descricao ?? "")}</p>` });
  }
  static async #onAtaque(event, target) {
    const item = this._item(target);
    if (item) await this.document.rolarAtaque(item);
  }
  static async #onItemPoder(event, target) {
    const item = this._item(target);
    if (!item) return;
    const r = await rolarFormula("1d6");
    await mostrarDados(r);
    const falhou = r.total === 1;
    await cartaoSimples({ actor: this.document, titulo: `Item de poder: ${item.name}`, roll: r, html: `<div class="hdc-dice"><span class="hdc-die ${falhou ? "" : "sucesso"}">${r.total}</span></div><p>${falhou ? "<b>Falhou!</b> O item acaba ou quebra." : "Funciona."}</p>` });
  }
}

/* ============================================ */
/*  Caçador                                     */
/* ============================================ */

export class CacadorSheet extends HDCActorSheetBase {
  static DEFAULT_OPTIONS = {
    classes: ["hora-de-cacar", "hdc-sheet", "actor", "cacador"],
    actions: {
      valor: CacadorSheet.#onValor,
      condicao: CacadorSheet.#onCondicao,
      quebrado: CacadorSheet.#onQuebrado,
      rolarAtributo: CacadorSheet.#onRolarAtributo,
      rolarPericia: CacadorSheet.#onRolarPericia,
      medo: CacadorSheet.#onMedo,
      diario: CacadorSheet.#onDiario,
      recursos: CacadorSheet.#onRecursos,
      protecao: CacadorSheet.#onProtecao,
      recuperacao: CacadorSheet.#onRecuperacao,
      critico: CacadorSheet.#onCritico,
      desabafar: CacadorSheet.#onDesabafar,
      novaSessao: CacadorSheet.#onNovaSessao,
      criacao: CacadorSheet.#onCriacao,
      cadeado: CacadorSheet.#onCadeado
    }
  };

  static PARTS = { ficha: { template: T("actor/cacador.hbs"), scrollable: [".hdc-corpo"] } };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const s = this.document.system;
    const ocupacaoPrincipal = s.perfil.ocupacao;
    ctx.atributos = Object.entries(HDC.atributos).map(([k, a]) => ({
      key: k,
      label: a.label,
      value: s.atributos[k].value,
      pontos: pontos(s.atributos[k].value, 5, `atributos.${k}.value`),
      pericias: Object.entries(HDC.pericias)
        .filter(([, p]) => p.atributo === k)
        .map(([pk, p]) => ({ key: pk, label: p.label, value: s.pericias[pk].value, pontos: pontos(s.pericias[pk].value, 5, `pericias.${pk}.value`), vantagem: s.vantagem.pericia === pk }))
    }));
    const caixas = (tipo) => {
      const max = s.condicoes[tipo].max;
      const nomes = [...HDC.condicoes[tipo].nomes];
      if (max > 3) nomes.push("Durão");
      return nomes.map((nome, i) => ({ n: i + 1, nome, on: s.condicoes[tipo].value > i, tipo }));
    };
    ctx.condFisica = caixas("fisica");
    ctx.condMental = caixas("mental");
    ctx.xpPontos = pontos(Math.min(s.xp.value, 10), 10, "xp.value");
    ctx.opcoesFaixa = opcoes(HDC.faixas, s.perfil.faixa);
    ctx.opcoesPericiaVantagem = [{ value: "", label: "—", selected: !s.vantagem.pericia }, ...opcoes(HDC.opcoesPericias(), s.vantagem.pericia)];
    ctx.padraoVida = HDC.recursos[s.recursos.value] ?? "";
    ctx.recursosPontos = pontos(s.recursos.value, 8, "recursos.value");
    ctx.cargaTxt = `${s.carga} / ${s.capacidade}`;
    ctx.sobrecargaTxt = s.sobrecarga === 2 ? "Muito acima: uma zona a cada duas rodadas" : s.sobrecarga === 1 ? "Sobrecarga: −2 Atletismo e Subterfúgio" : "";
    ctx.perguntasXP = HDC.perguntasXP;
    ctx.travado = s.travado;
    ctx.podeDestravar = !s.travado || game.user.isGM || !game.settings.get(SYSTEM_ID, "soNarradorDestrava");
    return ctx;
  }

  static async #onValor(event, target) {
    const campo = target.dataset.campo;
    if (this.document.system.travado && (campo.startsWith("atributos.") || campo.startsWith("pericias."))) {
      return ui.notifications.warn("Ficha trancada: atributos e perícias não podem ser alterados. Clique no cadeado para destravar.");
    }
    const n = Number(target.dataset.n);
    const atual = foundry.utils.getProperty(this.document.system, campo);
    let novo = atual === n ? n - 1 : n;
    if (campo.startsWith("atributos.") || campo.startsWith("recursos.")) novo = Math.max(1, novo);
    await this.document.update({ [`system.${campo}`]: novo });
  }
  static async #onCondicao(event, target) {
    const tipo = target.dataset.tipo;
    const n = Number(target.dataset.n);
    const atual = this.document.system.condicoes[tipo].value;
    await this.document.update({ [`system.condicoes.${tipo}.value`]: atual === n ? n - 1 : n });
  }
  static async #onQuebrado(event, target) {
    const k = target.dataset.tipo === "fisica" ? "quebradoFisico" : "quebradoMental";
    await this.document.update({ [`system.condicoes.${k}`]: !this.document.system.condicoes[k] });
  }
  static #onRolarAtributo(event, target) { this.document.rolarTeste({ atributo: target.dataset.atributo }); }
  static #onRolarPericia(event, target) { this.document.rolarTeste({ pericia: target.dataset.pericia }); }
  static #onMedo() { this.document.rolarMedo(1); }
  static #onDiario() { this.document.rolarDiario(); }
  static #onRecursos() { this.document.rolarRecursos(); }
  static #onProtecao() { this.document.rolarProtecao(); }
  static #onRecuperacao(event, target) { this.document.rolarRecuperacao(target.dataset.tipo); }
  static #onCritico(event, target) { this.document.rolarCritico(target.dataset.tipo); }
  static #onDesabafar() { this.document.desabafar(); }
  static #onNovaSessao() { this.document.novaSessao(); }
  static #onCriacao() {
    if (this.document.system.travado && !game.user.isGM) return ui.notifications.warn("Ficha trancada. Peça ao Narrador para destravar antes de refazer a criação.");
    abrirCriacao(this.document);
  }
  static async #onCadeado() {
    const travado = this.document.system.travado;
    if (travado && !game.user.isGM && game.settings.get(SYSTEM_ID, "soNarradorDestrava")) {
      return ui.notifications.warn("Só o Narrador pode destravar esta ficha.");
    }
    await this.document.update({ "system.travado": !travado }, { hdcCadeado: true });
  }
}

/* ============================================ */
/*  PNJ                                         */
/* ============================================ */

export class PnjSheet extends HDCActorSheetBase {
  static DEFAULT_OPTIONS = {
    classes: ["hora-de-cacar", "hdc-sheet", "actor", "pnj"],
    position: { width: 640, height: 640 },
    actions: {
      rolarPnj: PnjSheet.#onRolar,
      danoPnj: PnjSheet.#onDano
    }
  };
  static PARTS = { ficha: { template: T("actor/pnj.hbs"), scrollable: [".hdc-corpo"] } };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const r = this.document.system.resistencia;
    const trilha = (k) => Array.from({ length: Math.max(r[k].max + 1, r[k].dano) }, (_, i) => ({ n: i + 1, on: r[k].dano > i, alem: i >= r[k].max, tipo: k }));
    ctx.trilhaFisica = trilha("fisica");
    ctx.trilhaMental = trilha("mental");
    ctx.opcoesRes = [1, 2, 3].map((v) => ({ value: v, label: String(v) }));
    return ctx;
  }

  static #onRolar(event, target) { this.document.rolarDados(target.dataset.nome, Number(target.dataset.dados)); }
  static async #onDano(event, target) {
    const k = target.dataset.tipo;
    const n = Number(target.dataset.n);
    const atual = this.document.system.resistencia[k].dano;
    await this.document.update({ [`system.resistencia.${k}.dano`]: atual === n ? n - 1 : n });
  }
}

/* ============================================ */
/*  Criatura                                    */
/* ============================================ */

export class CriaturaSheet extends HDCActorSheetBase {
  static DEFAULT_OPTIONS = {
    classes: ["hora-de-cacar", "hdc-sheet", "actor", "criatura"],
    position: { width: 780, height: 860 },
    actions: {
      ataqueCriatura: CriaturaSheet.#onAtaque,
      ataqueAleatorio: CriaturaSheet.#onAtaqueAleatorio,
      rolarCriatura: CriaturaSheet.#onRolar,
      medoCriatura: CriaturaSheet.#onMedo,
      comportamento: CriaturaSheet.#onComportamento,
      golpeCritico: CriaturaSheet.#onGolpeCritico,
      curarVida: CriaturaSheet.#onCurar
    }
  };
  static PARTS = { ficha: { template: T("actor/criatura.hbs"), scrollable: [".hdc-corpo"] } };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const s = this.document.system;
    ctx.opcoesNatureza = opcoes(HDC.naturezas, s.natureza);
    ctx.opcoesIntensidade = opcoes(HDC.intensidades, s.intensidade);
    ctx.opcoesModId = opcoes(HDC.modIdentificacao, s.modId);
    ctx.ataques = [1, 2, 3, 4, 5, 6].map((n) => {
      const a = s.ataques[`a${n}`];
      return { n, a, campo: `system.ataques.a${n}`, opcoesTipo: opcoes(HDC.tiposAtaque, a.tipo), ultimo: s.ultimoAtaque === n };
    });
    ctx.ehAssombracao = s.natureza === "assombracao";
    ctx.naturezaLabel = HDC.naturezas[s.natureza]?.label ?? "";
    return ctx;
  }

  static #onAtaque(event, target) { this.document.ataqueCriatura(Number(target.dataset.n)); }
  static #onAtaqueAleatorio() { this.document.ataqueCriatura(null); }
  static #onRolar(event, target) {
    const k = target.dataset.attr;
    this.document.rolarDados(k === "agilidade" ? "AGILIDADE" : "PERCEPÇÃO", this.document.system[k]);
  }
  static async #onMedo() {
    const s = this.document.system;
    const pavor = s.pavorAtual;
    await cartaoSimples({
      actor: this.document,
      titulo: `${this.document.name} aparece!`,
      html: `<p>Teste de Medo, Pavor ${pavor}${s.jaVista ? " (encontros seguintes)" : " (primeiro encontro do caso)"}.</p><div class="hdc-botoes"><button type="button" data-hdc="medo" data-pavor="${pavor}" data-origem="${esc(this.document.name)}"><i class="fas fa-ghost"></i> Fazer teste de Medo</button></div>`
    });
    if (!s.jaVista) await this.document.update({ "system.jaVista": true });
  }
  static async #onComportamento() {
    const r = await rolarFormula("1d6");
    await mostrarDados(r);
    const c = this.document.system.comportamento;
    const txt = r.total <= 3 ? c.r13 : r.total <= 5 ? c.r45 : c.r6;
    await cartaoSimples({ actor: this.document, titulo: "Comportamento", roll: r, html: `<div class="hdc-dice"><span class="hdc-die">${r.total}</span></div><p>${esc(txt || "—")}</p>` });
  }
  static async #onGolpeCritico() {
    const r = await rolarFormula("1d6");
    await mostrarDados(r);
    await cartaoSimples({ actor: this.document, titulo: "Golpe crítico em criatura", roll: r, html: `<div class="hdc-dice"><span class="hdc-die">${r.total}</span></div><p>${esc(HDC.golpeCriticoCriatura[r.total])}</p>` });
  }
  static async #onCurar() {
    await this.document.update({ "system.vida.value": this.document.system.vida.max });
  }
}

/* ============================================ */
/*  Itens                                       */
/* ============================================ */

export class HDCItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["hora-de-cacar", "hdc-sheet", "item"],
    position: { width: 520, height: 560 },
    window: { resizable: true },
    form: { submitOnChange: true },
    actions: {
      editarImagem: HDCItemSheet.#onEditarImagem
    }
  };
  static PARTS = { ficha: { template: T("item/item.hbs") } };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const item = this.document;
    const s = item.system;
    const per = [{ value: "", label: "—", selected: !s.pericia }, ...opcoes(HDC.opcoesPericias(), s.pericia)];
    Object.assign(ctx, {
      item,
      system: s,
      editavel: this.isEditable,
      tipoLabel: { arma: "Arma", protecao: "Proteção", equipamento: "Equipamento", talento: "Talento", marca: "Defeito / Revelação", rito: "Rito" }[item.type],
      isArma: item.type === "arma",
      isProtecao: item.type === "protecao",
      isEquipamento: item.type === "equipamento",
      isTalento: item.type === "talento",
      isMarca: item.type === "marca",
      isRito: item.type === "rito",
      temPeso: ["arma", "protecao", "equipamento"].includes(item.type),
      opcoesPericia: per,
      opcoesPeso: opcoes(HDC.pesos, s.peso),
      opcoesTipoMarca: opcoes(HDC.tiposMarca, s.tipo),
      opcoesNatureza: opcoes({ fisica: "Física", mental: "Mental" }, s.natureza),
      opcoesTipoRito: opcoes(HDC.tiposRito, s.tipo),
      opcoesCategoria: opcoes({ ocupacao: "De ocupação", geral: "Geral" }, s.categoria),
      opcoesLimite: opcoes({ "": "Sem limite", sessao: "Uma vez por sessão", caso: "Uma vez por caso", temporada: "Uma vez por temporada", combate: "Uma vez por combate" }, s.limite)
    });
    return ctx;
  }

  static #onEditarImagem() { if (this.isEditable) abrirImagem(this.document, "img"); }
}
