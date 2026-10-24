/**
 * Fichas do QG e do Carro (Cap. 6 e 7).
 */
import { SYSTEM_ID, HDC } from "./config.mjs";
import { MELHORIAS, TIPOS_MELHORIA, PERGUNTAS_DESENVOLVIMENTO, EXEMPLOS_AMEACA, VETERANOS, VEICULOS, QUALIDADES, ESTADOS_CARRO, PERSEGUICAO, problemaDeViagem } from "./config-qg.mjs";
import { HDCActorSheetBase, opcoes } from "./sheets.mjs";
import { rolarFormula, rolarD6, mostrarDados, cartaoSimples, esc, atorDoUsuario } from "./dice.mjs";

const { DialogV2 } = foundry.applications.api;
const T = (p) => `systems/${SYSTEM_ID}/templates/${p}`;

/* ============================================ */
/*  QG                                          */
/* ============================================ */

export class QgSheet extends HDCActorSheetBase {
  static DEFAULT_OPTIONS = {
    classes: ["hora-de-cacar", "hdc-sheet", "actor", "qg"],
    position: { width: 860, height: 880 },
    actions: {
      melhoria: QgSheet.#onMelhoria,
      fatia: QgSheet.#onFatia,
      pontos: QgSheet.#onPontos,
      perguntas: QgSheet.#onPerguntas,
      novaVolta: QgSheet.#onNovaVolta,
      rolarAmeaca: QgSheet.#onRolarAmeaca,
      veteranoD6: QgSheet.#onVeteranoD6,
      ameacaSugerida: QgSheet.#onAmeacaSugerida,
      editarPlanta: QgSheet.#onEditarPlanta
    }
  };
  static PARTS = { ficha: { template: T("actor/qg.hbs"), scrollable: [".hdc-corpo"] } };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const s = this.document.system;
    ctx.grupos = Object.entries(TIPOS_MELHORIA).map(([tipo, label]) => ({
      label,
      itens: Object.entries(MELHORIAS).filter(([, m]) => m.tipo === tipo).map(([k, m]) => ({
        key: k, ...m, on: s.melhorias[k],
        preTxt: m.pre === "" ? "" : MELHORIAS[m.pre] ? `requer ${MELHORIAS[m.pre].label}` : m.pre,
        custoTxt: m.custo ? `${m.custo} pt` : "—"
      }))
    }));
    ctx.ameacas = [1, 2, 3, 4, 5, 6].map((n) => ({ n, a: s.ameacas[`a${n}`], campo: `system.ameacas.a${n}`, fatias: [1, 2, 3].map((f) => ({ f, on: s.ameacas[`a${n}`].fatias >= f })) }));
    ctx.pontos = Array.from({ length: Math.max(10, s.desenvolvimento) }, (_, i) => ({ n: i + 1, on: i < s.desenvolvimento }));
    ctx.temPlanta = !!s.planta;
    return ctx;
  }

  /** Compra/marca uma Melhoria. */
  static async #onMelhoria(event, target) {
    const k = target.dataset.key;
    const m = MELHORIAS[k];
    const s = this.document.system;
    if (s.melhorias[k]) return this.document.update({ [`system.melhorias.${k}`]: false });

    const avisos = [];
    if (m.pre && MELHORIAS[m.pre] && !s.melhorias[m.pre]) avisos.push(`Pré-requisito: ${MELHORIAS[m.pre].label}.`);
    if (m.pre.startsWith("Recursos")) avisos.push(`Pré-requisito: algum PJ com ${m.pre} ou mais.`);
    if (m.custo > s.desenvolvimento) avisos.push(`Custa ${m.custo} pontos e o grupo tem ${s.desenvolvimento}.`);

    const escolha = await DialogV2.wait({
      window: { title: `Melhoria: ${m.label}` },
      content: `<p><b>${esc(m.label)}</b> (${m.custo} ponto(s) de Desenvolvimento)</p><p>${esc(m.efeito)}</p>${avisos.map((a) => `<p class="hdc-aviso">${esc(a)}</p>`).join("")}
        <p class="hint">Comprar desconta os pontos e o Narrador rola a ameaça em segredo (dados = custo + 1 por outra Melhoria comprada nesta volta${s.redutorAmeaca ? `, −${s.redutorAmeaca} pela Sentinela/Quarto do pânico` : ""}).</p>`,
      buttons: [
        { action: "comprar", label: "Comprar", icon: "fas fa-hammer", default: true },
        { action: "marcar", label: "Só marcar" },
        { action: "cancelar", label: "Cancelar" }
      ],
      rejectClose: false
    });
    if (!escolha || escolha === "cancelar") return;
    if (escolha === "marcar") return this.document.update({ [`system.melhorias.${k}`]: true });

    const dados = Math.max(0, m.custo + s.comprasVolta - s.redutorAmeaca);
    await this.document.update({
      [`system.melhorias.${k}`]: true,
      "system.desenvolvimento": Math.max(0, s.desenvolvimento - m.custo),
      "system.comprasVolta": s.comprasVolta + 1
    });
    await cartaoSimples({ actor: this.document, titulo: `QG: ${m.label}`, html: `<p>O grupo comprou <b>${esc(m.label)}</b>. ${esc(m.efeito)}</p>` });
    if (dados > 0) await QgSheet.rolarAmeaca(this.document, m.label, dados);
  }

  /** Rolagem secreta de ameaça (só o Narrador vê). */
  static async rolarAmeaca(qg, origem, dados) {
    const { roll, resultados } = await rolarD6(dados);
    const seis = resultados.filter((r) => r === 6).length;
    const sugestao = EXEMPLOS_AMEACA[Math.floor(Math.random() * EXEMPLOS_AMEACA.length)];
    await cartaoSimples({
      actor: qg, soNarrador: true, roll,
      titulo: `Ameaça ao QG (${origem})`,
      html: `<div class="hdc-dice">${resultados.map((r) => `<span class="hdc-die ${r === 6 ? "sucesso" : ""}">${r}</span>`).join("")}</div>
        <p>${seis ? `<b>Surge uma ameaça!</b> Dê um nome a ela e crie um relógio de três fatias${seis > 1 ? `, com ${seis - 1} fatia(s) já pintada(s)` : ""}. Ligue-a aos segredos sombrios e aos casos anteriores.<br>Ideia: <i>${esc(sugestao)}</i>` : "Nenhuma ameaça desta vez."}</p>`
    });
    if (seis) {
      const s = qg.system;
      const livre = [1, 2, 3, 4, 5, 6].find((n) => !s.ameacas[`a${n}`].nome);
      if (livre) await qg.update({ [`system.ameacas.a${livre}`]: { nome: `(nova ameaça: ${origem})`, fatias: Math.min(3, seis - 1) } });
    }
  }

  static async #onRolarAmeaca() {
    const r = await DialogV2.wait({
      window: { title: "Rolar ameaça ao QG" },
      content: `<div class="hdc-roll-dialog"><div class="form-group"><label>Dados</label><input type="number" name="dados" value="1" min="1"></div></div>`,
      buttons: [{ action: "ok", label: "Rolar", default: true, callback: (e, b) => Number(b.form.elements.dados.value) || 1 }],
      rejectClose: false
    });
    if (typeof r === "number") await QgSheet.rolarAmeaca(this.document, "rolagem manual", r);
  }

  static async #onFatia(event, target) {
    const n = target.dataset.n, f = Number(target.dataset.f);
    const atual = this.document.system.ameacas[`a${n}`].fatias;
    const novo = atual === f ? f - 1 : f;
    await this.document.update({ [`system.ameacas.a${n}.fatias`]: novo });
    if (novo === 3) {
      const nome = this.document.system.ameacas[`a${n}`].nome || "Ameaça";
      await cartaoSimples({ actor: this.document, soNarrador: true, titulo: `${nome} chegou ao QG`, html: `<p>A terceira fatia foi pintada: a ameaça chega ao QG e vira o próximo caso (ou parte dele).</p>` });
    }
  }

  static async #onPontos(event, target) {
    const n = Number(target.dataset.n);
    const atual = this.document.system.desenvolvimento;
    await this.document.update({ "system.desenvolvimento": atual === n ? n - 1 : n });
  }

  static async #onPerguntas() {
    const html = `<div class="hdc-roll-dialog"><p>O grupo responde junto; cada "sim" vale 1 ponto de Desenvolvimento.</p>
      ${PERGUNTAS_DESENVOLVIMENTO.map((p, i) => `<label class="opt"><input type="checkbox" name="p${i}"> ${esc(p)}</label>`).join("")}</div>`;
    const r = await DialogV2.wait({
      window: { title: "Pontos de Desenvolvimento" },
      content: html,
      buttons: [{ action: "ok", label: "Somar pontos", default: true, callback: (e, b) => PERGUNTAS_DESENVOLVIMENTO.filter((_, i) => b.form.elements[`p${i}`].checked) }, { action: "cancelar", label: "Cancelar" }],
      rejectClose: false
    });
    if (!Array.isArray(r)) return;
    const s = this.document.system;
    await this.document.update({ "system.desenvolvimento": s.desenvolvimento + r.length, "system.comprasVolta": 0 });
    await cartaoSimples({ actor: this.document, titulo: "Volta ao QG: Desenvolvimento", html: `<p>+${r.length} ponto(s). Total guardado: <b>${s.desenvolvimento + r.length}</b>.</p>${r.length ? `<ul>${r.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}
      <p class="hdc-nota">Ordem da volta ao QG: 1. Recuperação de Defeitos e Revelações · 2. Desenvolvimento · 3. Melhorias · 4. Ameaças · 5. Equipamento guardado (cada PJ guarda um item novo).</p>` });
  }

  static async #onNovaVolta() {
    await this.document.update({ "system.comprasVolta": 0 });
    ui.notifications.info("Nova volta ao QG: o contador de Melhorias compradas foi zerado.");
  }

  static async #onVeteranoD6() {
    const r = await rolarFormula("1d6");
    await mostrarDados(r);
    await this.document.update({ "system.veterano": VETERANOS[r.total - 1] });
  }

  static async #onAmeacaSugerida(event, target) {
    const n = target.dataset.n;
    const ideia = EXEMPLOS_AMEACA[Math.floor(Math.random() * EXEMPLOS_AMEACA.length)];
    await this.document.update({ [`system.ameacas.a${n}.nome`]: ideia });
  }

  static #onEditarPlanta() {
    const FP = foundry.applications.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
    new FP({ type: "image", current: this.document.system.planta, callback: (path) => this.document.update({ "system.planta": path }) }).browse();
  }
}

/* ============================================ */
/*  CARRO                                       */
/* ============================================ */

export class VeiculoSheet extends HDCActorSheetBase {
  static DEFAULT_OPTIONS = {
    classes: ["hora-de-cacar", "hdc-sheet", "actor", "veiculo"],
    position: { width: 760, height: 820 },
    actions: {
      qualidade: VeiculoSheet.#onQualidade,
      estado: VeiculoSheet.#onEstado,
      aplicarTipo: VeiculoSheet.#onAplicarTipo,
      viagem: VeiculoSheet.#onViagem,
      pilotar: VeiculoSheet.#onPilotar,
      conserto: VeiculoSheet.#onConserto,
      corrida: VeiculoSheet.#onCorrida,
      zerarCorrida: VeiculoSheet.#onZerarCorrida
    }
  };
  static PARTS = { ficha: { template: T("actor/veiculo.hbs"), scrollable: [".hdc-corpo"] } };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const s = this.document.system;
    ctx.opcoesTipo = opcoes(VEICULOS, s.tipo);
    ctx.qualidades = [1, 2, 3, 4].map((q) => ({ q, on: s.qualidade >= q, label: QUALIDADES[q].label }));
    ctx.qualidadeTxt = `${QUALIDADES[s.qualidade].label} · ${QUALIDADES[s.qualidade].descr}`;
    ctx.estados = Object.entries(ESTADOS_CARRO).map(([k, v]) => ({ k, v, on: s.estado === k }));
    ctx.opcoesDistancia = opcoes(PERSEGUICAO, s.perseguicao.distancia);
    const d = s.perseguicao.distancia;
    ctx.corrida = {
      nos: Array.from({ length: d }, (_, i) => ({ i: i + 1, on: s.perseguicao.nos > i })),
      eles: Array.from({ length: d }, (_, i) => ({ i: i + 1, on: s.perseguicao.eles > i })),
      fim: s.perseguicao.nos >= d ? "Vocês completaram primeiro." : s.perseguicao.eles >= d ? "Eles completaram primeiro." : ""
    };
    ctx.itensPortaMalas = this.document.items.contents;
    ctx.cargaTxt = `${s.cargaUsada} / ${s.carga}`;
    ctx.sobrecarga = s.cargaUsada > s.carga;
    return ctx;
  }

  static async #onQualidade(event, target) {
    const q = Number(target.dataset.q);
    await this.document.update({ "system.qualidade": q });
  }
  static async #onEstado(event, target) { await this.document.update({ "system.estado": target.dataset.k }); }

  static async #onAplicarTipo() {
    const v = VEICULOS[this.document.system.tipo];
    if (!v) return;
    await this.document.update({ "system.qualidade": v.qualidade, "system.bonus": v.bonus, "system.assentos": v.assentos, "system.carga": v.carga, "system.manutencao": v.manutencao });
    ui.notifications.info(`Valores típicos de ${v.label} aplicados.`);
  }

  /** Rolagem de viagem: 2D6 + qualidade (Cap. 6). */
  static async #onViagem() {
    const s = this.document.system;
    const q = QUALIDADES[s.qualidade];
    const r0 = await DialogV2.wait({
      window: { title: `Rolagem de viagem: ${this.document.name}` },
      content: `<div class="hdc-roll-dialog"><p>2D6 do motorista, ${esc(q.label)}${q.duas ? " (rola duas vezes e fica com a melhor)" : q.mod ? ` (${q.mod > 0 ? "+" : ""}${q.mod})` : ""}.</p>
        <label class="opt"><input type="checkbox" name="mecanico"> Mecânico no Pessoal do QG (+1)</label>
        <label class="opt"><input type="checkbox" name="garagem"> Garagem no QG (consertos custam 1 a menos)</label></div>`,
      buttons: [{ action: "ok", label: "Rolar", icon: "fas fa-road", default: true, callback: (e, b) => ({ mec: b.form.elements.mecanico.checked, gar: b.form.elements.garagem.checked }) }, { action: "cancelar", label: "Cancelar" }],
      rejectClose: false
    });
    if (!r0 || typeof r0 !== "object") return;
    let roll = await rolarFormula("2d6");
    await mostrarDados(roll);
    let base = roll.total;
    let nota = "";
    if (q.duas) {
      const r2 = await rolarFormula("2d6");
      await mostrarDados(r2);
      nota = `Excelente: ${roll.total} e ${r2.total}, fica com a melhor. `;
      base = Math.max(roll.total, r2.total);
    }
    const mod = (q.duas ? 0 : q.mod) + (r0.mec ? 1 : 0);
    const soma = Math.max(2, base + mod);
    let d6 = null;
    let rd6 = null;
    if (soma <= 5) { rd6 = await rolarFormula("1d6"); await mostrarDados(rd6); d6 = rd6.total; }
    const p = problemaDeViagem(soma, d6 ?? 6);
    const custo = Math.max(0, p.custo - (r0.gar && p.custo ? 1 : 0));
    const botoes = p.estado ? `<div class="hdc-botoes"><button type="button" data-hdc="carro-estado" data-uuid="${this.document.uuid}" data-estado="${p.estado}"><i class="fas fa-car-burst"></i> Marcar carro como ${p.estado}</button>
      ${p.conserto ? `<button type="button" data-hdc="carro-conserto" data-dif="${p.conserto}"><i class="fas fa-wrench"></i> Consertar na estrada (Manufatura, ${p.conserto})</button>` : ""}</div>`
      : p.conserto ? `<div class="hdc-botoes"><button type="button" data-hdc="carro-conserto" data-dif="${p.conserto}"><i class="fas fa-wrench"></i> Consertar na estrada (Manufatura, ${p.conserto})</button></div>` : "";
    await cartaoSimples({
      actor: this.document, roll,
      titulo: `Viagem: ${this.document.name}`,
      html: `<div class="hdc-resultado"><span class="n">${soma}</span> <span class="dif">2D6 ${base}${mod ? ` ${mod > 0 ? "+" : ""}${mod}` : ""}${d6 ? ` · 1d6 = ${d6}` : ""}</span></div>
        ${nota ? `<p class="hdc-nota">${esc(nota)}</p>` : ""}
        <p><b>${esc(p.titulo)}</b>${custo ? ` · custo: disponibilidade ${custo}` : ""}</p><p>${esc(p.efeito)}</p>
        ${custo ? `<p class="hdc-nota">Pague na hora com o Capital ou na próxima rolagem de Recursos. Um problema não pago deixa o carro avariado ou quebrado.</p>` : ""}${botoes}`
    });
  }

  /** Teste de Pilotagem do Caçador do usuário, com o bônus deste carro. */
  static async #onPilotar() {
    const motorista = atorDoUsuario();
    if (!motorista || motorista.type !== "cacador") return ui.notifications.warn("Selecione o token do seu Caçador (ou defina seu personagem) para dirigir.");
    const s = this.document.system;
    if (!s.anda) return ui.notifications.warn(`${this.document.name} está quebrado e não anda.`);
    const partes = s.bonusEfetivo ? [{ label: this.document.name, valor: s.bonusEfetivo }] : [];
    return motorista.rolarTeste({ pericia: "pilotagem", titulo: `Pilotagem: ${this.document.name}`, partesExtras: partes,
      nota: `${s.estado === "avariado" ? "Carro avariado: sem bônus. " : ""}${s.notaTipo}` });
  }

  static async #onConserto() {
    const motorista = atorDoUsuario();
    if (!motorista || motorista.type !== "cacador") return ui.notifications.warn("Selecione o token do seu Caçador.");
    return motorista.rolarTeste({ pericia: "manufatura", titulo: `Conserto na estrada: ${this.document.name}`, dificuldade: 2,
      nota: "Precisa de caixa de ferramentas. 1 sucesso para pneu e bateria, 2 para peça quebrada, 3 para câmbio ou motor. O sucesso não paga o conserto: só faz o carro andar até a próxima cidade, avariado." });
  }

  static async #onCorrida(event, target) {
    const lado = target.dataset.lado;
    const i = Number(target.dataset.i);
    const atual = this.document.system.perseguicao[lado];
    await this.document.update({ [`system.perseguicao.${lado}`]: atual === i ? i - 1 : i });
  }
  static async #onZerarCorrida() { await this.document.update({ "system.perseguicao.nos": 0, "system.perseguicao.eles": 0 }); }
}
