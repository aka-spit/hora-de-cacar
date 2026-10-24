/**
 * Assistente de criação de Caçador (Cap. 2), com os mesmos passos da ficha HTML do livro.
 * Sem gerador aleatório de personagem: o jogador escolhe tudo. As tabelas d6 de personalidade
 * continuam podendo ser roladas, porque o livro diz "role ou escolha".
 */
import { SYSTEM_ID, HDC } from "./config.mjs";
import { OCUPACOES, LEMBRANCAS, IDIOMAS, EQUIP_ARSENAL, EQUIP_PODER } from "./dados-criacao.mjs";
import { esc } from "./dice.mjs";

const { ApplicationV2 } = foundry.applications.api;

const FAIXAS = [
  { key: "jovem", nome: "Jovem", min: 17, max: 25, attr: 15, per: 10 },
  { key: "meiaIdade", nome: "Meia-idade", min: 26, max: 50, attr: 14, per: 12 },
  { key: "idoso", nome: "Idoso", min: 51, max: 80, attr: 13, per: 14 }
];
const ATTRS = Object.keys(HDC.atributos);
const PERICIAS = Object.keys(HDC.pericias);
const NOMES_TABELA = { mot: "Motivação", pc: "Primeiro Contato", seg: "Segredo sombrio" };

function estadoInicial(actor) {
  return {
    occ: null, esp: null, faixa: null,
    nome: actor?.name && !/^(novo|new|caçador|actor)/i.test(actor.name) ? actor.name : "",
    idade: "", fachada: "", jogador: game.user?.name ?? "",
    attr: Object.fromEntries(ATTRS.map((a) => [a, 2])),
    sk: Object.fromEntries(PERICIAS.map((s) => [s, 0])),
    rec: null, nativo: "Português", segundo: "", tal: null,
    mot: "", pc: "", viu: "", perdeu: "", nunca: "", seg: "",
    rels: [{ pj: "", txt: "" }], diario: "", lem: "", lemTxt: "", equip: null, desc: ""
  };
}

export class CriacaoCacador extends ApplicationV2 {
  constructor(actor, options = {}) {
    super({ id: `hdc-criacao-${actor.id}`, ...options });
    this.actor = actor;
    this.W = estadoInicial(actor);
    this.passo = 0;
    this.maxVisto = 0;
    this.mensagem = "";
  }

  static DEFAULT_OPTIONS = {
    classes: ["hora-de-cacar", "hdc-criacao"],
    tag: "div",
    window: { title: "Criar Caçador", icon: "fas fa-user-pen", resizable: true },
    position: { width: 940, height: 760 },
    actions: {
      ir: CriacaoCacador.#onIr,
      avancar: CriacaoCacador.#onAvancar,
      voltar: CriacaoCacador.#onVoltar,
      ocupacao: CriacaoCacador.#onOcupacao,
      especialidade: CriacaoCacador.#onEspecialidade,
      faixa: CriacaoCacador.#onFaixa,
      ajustar: CriacaoCacador.#onAjustar,
      talento: CriacaoCacador.#onTalento,
      tabela: CriacaoCacador.#onTabela,
      rolarTabela: CriacaoCacador.#onRolarTabela,
      lembranca: CriacaoCacador.#onLembranca,
      rolarLembranca: CriacaoCacador.#onRolarLembranca,
      equip: CriacaoCacador.#onEquip,
      addRel: CriacaoCacador.#onAddRel,
      delRel: CriacaoCacador.#onDelRel,
      rolarRel: CriacaoCacador.#onRolarRel
    }
  };

  get title() { return `Criar Caçador: ${this.actor.name}`; }

  /* ---------------- Regras ---------------- */

  get O() { return this.W.occ != null ? OCUPACOES[this.W.occ] : null; }
  get F() { return this.W.faixa != null ? FAIXAS[this.W.faixa] : null; }
  maxAttr(a) { return this.O?.atributo === a ? 5 : 4; }
  maxSk(s) { return this.O?.pericia === s ? 3 : 2; }
  attrLeft() { return this.F ? this.F.attr - ATTRS.reduce((t, a) => t + this.W.attr[a], 0) : 0; }
  skLeft() {
    if (!this.F) return 0;
    const gastos = PERICIAS.reduce((t, s) => t + this.W.sk[s], 0);
    const rec = this.O && this.W.rec != null ? this.W.rec - this.O.rmin : 0;
    return this.F.per - gastos - rec;
  }
  /** Mantém tudo dentro dos limites quando muda ocupação ou faixa. */
  ajustarLimites() {
    for (const a of ATTRS) this.W.attr[a] = Math.max(2, Math.min(this.maxAttr(a), this.W.attr[a]));
    for (const s of PERICIAS) this.W.sk[s] = Math.max(0, Math.min(this.maxSk(s), this.W.sk[s]));
    if (this.O) this.W.rec = Math.max(this.O.rmin, Math.min(this.O.rmax, this.W.rec ?? this.O.rmin));
    if (this.W.attr.raciocinio < 3) this.W.segundo = "";
  }

  get passos() {
    const W = this.W;
    return [
      { t: "Ocupação e especialidade", l: "O que o seu Caçador fazia antes de tudo mudar. A ocupação define o atributo e a perícia principais, os talentos possíveis, os Recursos e o equipamento inicial.", r: () => this.rOcupacao(), v: () => (W.occ == null ? "Escolha uma ocupação." : W.esp == null ? "Escolha uma especialidade." : "") },
      { t: "Idade e nome", l: "A idade muda o equilíbrio entre corpo e experiência: jovem tem mais pontos de atributo, idoso tem mais pontos de perícia.", r: () => this.rIdade(), v: () => (W.faixa == null ? "Escolha a faixa de idade." : !W.nome.trim() ? "Dê um nome ao Caçador." : this.idadeForaDaFaixa() ? `A idade precisa estar entre ${this.F.min} e ${this.F.max}.` : "") },
      { t: "Atributos", l: "Cada atributo vale de 2 a 4. O atributo principal da ocupação (★) pode chegar a 5. Distribua exatamente os pontos da sua faixa de idade.", r: () => this.rAtributos(), v: () => this.faltaTxt(this.attrLeft(), "atributo") },
      { t: "Perícias e Recursos", l: "Na criação, nenhuma perícia passa de 2, exceto a principal da ocupação (★), que pode chegar a 3. Recursos começam no mínimo da ocupação; cada nível acima custa 1 ponto de perícia.", r: () => this.rPericias(), v: () => this.faltaTxt(this.skLeft(), "perícia") },
      { t: "Idiomas e talento", l: "Todo Caçador fala o idioma nativo. Com RACIOCÍNIO 3 ou mais, fala também um segundo idioma vivo. Escolha um dos dois talentos da sua especialidade.", r: () => this.rTalento(), v: () => (W.tal == null ? "Escolha um talento." : W.attr.raciocinio >= 3 && !W.segundo ? "Escolha o segundo idioma." : "") },
      { t: "Motivação e Primeiro Contato", l: "Por que você continua? E qual foi o encontro que abriu os seus olhos? Escolha na tabela da ocupação, role 1d6 ou escreva o seu.", r: () => this.rMotivacao(), v: () => (!W.mot.trim() ? "Defina a motivação." : !W.pc.trim() ? "Defina o Primeiro Contato." : "") },
      { t: "Segredo e relacionamentos", l: "O segredo sombrio é contado só ao Narrador. Para cada outro PJ, escreva o que o seu Caçador sente por ele e confirme com o outro jogador.", r: () => this.rSegredo(), v: () => (!W.seg.trim() ? "Defina o segredo sombrio." : "") },
      { t: "Diário e lembrança", l: "A primeira página do diário e o objeto da vida de antes que o Caçador guarda nas páginas.", r: () => this.rDiario(), v: () => (!W.lemTxt ? "Escolha uma lembrança." : "") },
      { t: "Equipamento e descrição", l: "Escolha um dos itens iniciais da ocupação. Celular, roupas, documentos e lanterna barata o Caçador já tem. Depois, descreva como ele aparece para a mesa.", r: () => this.rEquip(), v: () => (W.equip == null ? "Escolha o equipamento inicial." : "") },
      { t: "Revisão", l: "Confira tudo. Ao confirmar, a ficha é preenchida e o talento e o equipamento entram como itens.", r: () => this.rRevisao(), v: () => "" }
    ];
  }

  idadeForaDaFaixa() {
    const v = Number(this.W.idade);
    if (!this.W.idade || !this.F) return false;
    return !Number.isFinite(v) || v < this.F.min || v > this.F.max;
  }
  faltaTxt(n, o) { return n > 0 ? `Ainda faltam ${n} ponto(s) de ${o}.` : n < 0 ? `Você passou ${-n} ponto(s) de ${o}.` : ""; }

  /* ---------------- Render ---------------- */

  async _renderHTML() {
    const passos = this.passos;
    const p = passos[this.passo];
    const nav = passos.map((s, i) => {
      const feito = i < this.passo || (i <= this.maxVisto && !s.v());
      const pode = i <= this.maxVisto || i === this.passo;
      return `<li><button type="button" data-action="ir" data-i="${i}" class="${i === this.passo ? "atual" : ""} ${feito ? "feito" : ""}" ${pode ? "" : "disabled"}>${i + 1}. ${esc(s.t)}</button></li>`;
    }).join("");
    const ultimo = this.passo === passos.length - 1;
    return `
      <div class="hdc-wiz">
        <nav class="wiz-nav"><h3>Criar Caçador</h3><ol>${nav}</ol></nav>
        <section class="wiz-corpo">
          <h2>${this.passo + 1}. ${esc(p.t)}</h2>
          <p class="wiz-lead">${esc(p.l)}</p>
          <div class="wiz-conteudo">${p.r()}</div>
          <footer class="wiz-rodape">
            <button type="button" class="botao" data-action="voltar" ${this.passo === 0 ? "disabled" : ""}>← Voltar</button>
            <span class="wiz-msg">${esc(this.mensagem)}</span>
            <button type="button" class="botao vermelho" data-action="avancar">${ultimo ? "Preencher a ficha" : "Avançar →"}</button>
          </footer>
        </section>
      </div>`;
  }

  _replaceHTML(result, content) {
    content.innerHTML = result;
    // Campos de texto atualizam o estado sem redesenhar (não perde o foco).
    content.querySelectorAll("[data-w]").forEach((el) => {
      const ev = el.tagName === "SELECT" ? "change" : "input";
      el.addEventListener(ev, () => {
        const k = el.dataset.w;
        this.W[k] = el.value;
        if (k === "nativo" && this.W.segundo === el.value) { this.W.segundo = ""; this.render(); }
      });
    });
    content.querySelectorAll("[data-rel]").forEach((el) => {
      el.addEventListener("input", () => { this.W.rels[Number(el.dataset.rel)][el.dataset.campo] = el.value; });
    });
  }

  /* ---------------- Peças ---------------- */

  campo(rot, k, tipo = "text", dica = "") {
    const v = esc(this.W[k] ?? "");
    const input = tipo === "textarea" ? `<textarea data-w="${k}" rows="3" placeholder="${esc(dica)}">${v}</textarea>` : `<input type="${tipo}" data-w="${k}" value="${v}" placeholder="${esc(dica)}">`;
    return `<label class="f"><span>${esc(rot)}</span>${input}</label>`;
  }
  stepper(valor, min, max, chave) {
    return `<span class="stepper"><button type="button" data-action="ajustar" data-k="${chave}" data-d="-1" ${valor <= min ? "disabled" : ""}>−</button><b>${valor}</b><button type="button" data-action="ajustar" data-k="${chave}" data-d="1" ${valor >= max ? "disabled" : ""}>+</button></span>`;
  }
  tabela(rot, k, linhas) {
    return `<div class="wiz-tabela"><h4>1d6 · ${esc(rot)} <button type="button" class="botao mini" data-action="rolarTabela" data-tab="${k}"><i class="fas fa-dice-six"></i> Rolar</button></h4>
      ${linhas.map((t, i) => `<button type="button" class="opcao ${this.W[k] === t ? "sel" : ""}" data-action="tabela" data-tab="${k}" data-i="${i}"><span>${i + 1}</span>${esc(t)}</button>`).join("")}
      <label class="f"><span>Ou escreva o seu</span><textarea data-w="${k}" rows="2">${esc(this.W[k])}</textarea></label></div>`;
  }

  rOcupacao() {
    const W = this.W;
    const cartas = OCUPACOES.map((o, i) => `<button type="button" class="carta ${W.occ === i ? "sel" : ""}" data-action="ocupacao" data-i="${i}">
      <b>${esc(o.nome)}</b><i>“${esc(o.frase)}”</i><small>${HDC.atributos[o.atributo].label} · ${HDC.pericias[o.pericia].label} · Recursos ${o.rmin}–${o.rmax}</small></button>`).join("");
    let det = "";
    if (this.O) {
      det = `<p class="wiz-lead">${esc(this.O.desc)}</p><div class="postits">${this.O.especialidades.map((e, i) => `<button type="button" class="postit ${W.esp === i ? "sel" : ""}" data-action="especialidade" data-i="${i}">
        <b>${esc(e.nome)}</b><span>${esc(e.desc)}</span>${e.talentos.map((t) => `<span class="tl"><u>${esc(t.nome)}</u>: ${esc(t.desc)}</span>`).join("")}</button>`).join("")}</div>`;
    }
    return `<div class="cartas">${cartas}</div>${det}`;
  }

  rIdade() {
    const W = this.W;
    const cartas = FAIXAS.map((f, i) => `<button type="button" class="carta ${W.faixa === i ? "sel" : ""}" data-action="faixa" data-i="${i}"><b>${f.nome}</b><i>${f.min}${i === 2 ? "+" : " a " + f.max} anos</i><small>${f.attr} pontos de atributo · ${f.per} de perícia</small></button>`).join("");
    return `<div class="cartas tres">${cartas}</div><div class="linha c2">
      ${this.campo("Nome", "nome", "text", "Ex.: Rita Torres")}${this.campo("Idade", "idade", "number", this.F ? `${this.F.min} a ${this.F.max}` : "")}
      ${this.campo("Fachada / codinome", "fachada", "text", "A identidade falsa preferida")}${this.campo("Jogador", "jogador", "text", "Seu nome")}</div>`;
  }

  rAtributos() {
    const left = this.attrLeft();
    return `<p class="contador">Faixa: <b>${this.F?.nome ?? "—"}</b> · Pontos restantes: <b class="${left < 0 ? "ruim" : ""}">${left}</b></p>
      <div class="steppers grande">${ATTRS.map((a) => `<div class="srow ${this.O?.atributo === a ? "principal" : ""}"><span>${HDC.atributos[a].label}${this.O?.atributo === a ? " ★" : ""}</span>${this.stepper(this.W.attr[a], 2, this.maxAttr(a), "a:" + a)}</div>`).join("")}</div>
      <p class="dica">FORÇA: músculo e resistência · AGILIDADE: reflexo e precisão · RACIOCÍNIO: memória, estudo e o oculto · EMPATIA: atenção, convencer e resistir ao medo.</p>`;
  }

  rPericias() {
    const o = this.O;
    const left = this.skLeft();
    const cols = ATTRS.map((a) => `<div class="scol"><h4>${HDC.atributos[a].label} <small>${this.W.attr[a]}</small></h4>
      ${PERICIAS.filter((s) => HDC.pericias[s].atributo === a).map((s) => `<div class="srow ${o?.pericia === s ? "principal" : ""}"><span>${HDC.pericias[s].label}${o?.pericia === s ? " ★" : ""}</span>${this.stepper(this.W.sk[s], 0, this.maxSk(s), "s:" + s)}</div>`).join("")}</div>`).join("");
    const rec = o ? `<div class="wiz-recursos"><h4>Recursos ${this.stepper(this.W.rec, o.rmin, o.rmax, "r:r")}</h4><span>${esc(HDC.recursos[this.W.rec])}</span>
      <p class="dica">Faixa da ocupação: ${o.rmin} a ${o.rmax}. Cada nível acima de ${o.rmin} custa 1 ponto de perícia.</p></div>` : "";
    return `<p class="contador">Pontos restantes: <b class="${left < 0 ? "ruim" : ""}">${left}</b> de ${this.F?.per ?? 0}</p><div class="steppers">${cols}</div>${rec}`;
  }

  rTalento() {
    const W = this.W, o = this.O, e = o.especialidades[W.esp];
    const dois = W.attr.raciocinio >= 3;
    const opt = (lista, atual, vazio) => (vazio ? `<option value="">— escolha —</option>` : "") + lista.map((x) => `<option ${x === atual ? "selected" : ""}>${esc(x)}</option>`).join("");
    return `<div class="linha c2">
        <label class="f"><span>Idioma nativo</span><select data-w="nativo">${opt(IDIOMAS, W.nativo)}</select></label>
        ${dois ? `<label class="f"><span>Segundo idioma (RACIOCÍNIO 3+)</span><select data-w="segundo">${opt(IDIOMAS.filter((x) => x !== W.nativo), W.segundo, true)}</select></label>`
          : `<p class="dica">Com RACIOCÍNIO ${W.attr.raciocinio}, o Caçador fala só o idioma nativo. Outros idiomas vêm com os talentos Poliglota e Linguista.</p>`}
      </div>
      <h4 class="sub">Talento da especialidade ${esc(e.nome)}</h4>
      <div class="postits">${e.talentos.map((t, i) => `<button type="button" class="postit ${W.tal === i ? "sel" : ""}" data-action="talento" data-i="${i}"><b>${esc(t.nome)}</b><span>${esc(t.desc)}</span></button>`).join("")}</div>
      <p class="dica">O outro talento e os das outras especialidades de ${esc(o.nome)} podem ser comprados depois, com Avanços (5 XP).</p>`;
  }

  rMotivacao() {
    const t = this.O.tabelas;
    return `<div class="tabelas">${this.tabela("Motivação", "mot", t["Motivação"])}${this.tabela("Primeiro Contato", "pc", t["Primeiro Contato"])}</div>
      <div class="linha c3">${this.campo("O que você viu?", "viu", "textarea")}${this.campo("O que você perdeu?", "perdeu", "textarea")}${this.campo("O que você nunca contou?", "nunca", "textarea", "A resposta mais importante: o Narrador pode tirar dela uma temporada.")}</div>`;
  }

  rSegredo() {
    const rl = this.O.tabelas["Relacionamentos"];
    const rels = this.W.rels.map((r, i) => `<div class="rel">
      <label class="f"><span>Caçador</span><input data-rel="${i}" data-campo="pj" value="${esc(r.pj)}" placeholder="Nome do outro PJ"></label>
      <label class="f"><span>Relação</span><input data-rel="${i}" data-campo="txt" value="${esc(r.txt)}"></label>
      <button type="button" class="botao mini" data-action="rolarRel" data-i="${i}" title="Rolar 1d6 na tabela"><i class="fas fa-dice-six"></i></button>
      <button type="button" class="botao mini discreto" data-action="delRel" data-i="${i}" title="Remover">✕</button></div>`).join("");
    return `<div class="tabelas">${this.tabela("Segredo sombrio", "seg", this.O.tabelas["Segredo sombrio"])}
      <div class="wiz-tabela"><h4>Relacionamentos <button type="button" class="botao mini" data-action="addRel">+ outro PJ</button></h4>
        <p class="dica">Tabela de ${esc(this.O.nome)}: ${rl.map((t, i) => `${i + 1}. ${esc(t)}`).join(" · ")}</p>${rels}</div></div>`;
  }

  rDiario() {
    const lem = Object.entries(LEMBRANCAS).map(([k, t]) => `<button type="button" class="opcao ${this.W.lem === k ? "sel" : ""}" data-action="lembranca" data-k="${k}"><span>${k}</span>${esc(t)}</button>`).join("");
    return `${this.campo("Primeira página do diário", "diario", "textarea", "Escreva como o seu Caçador escreveria: uma data, um lugar, o que ele quer lembrar.")}
      <div class="wiz-tabela"><h4>Lembrança (D66) <button type="button" class="botao mini" data-action="rolarLembranca"><i class="fas fa-dice"></i> Rolar D66</button></h4><div class="d66">${lem}</div></div>`;
  }

  rEquip() {
    const cartas = this.O.equip.map((x, i) => `<button type="button" class="carta ${this.W.equip === i ? "sel" : ""}" data-action="equip" data-i="${i}"><b>${esc(x)}</b>${EQUIP_ARSENAL[x] ? `<small>Arsenal: ${esc(EQUIP_ARSENAL[x])}</small>` : EQUIP_PODER.includes(x) ? "<small>Item de poder</small>" : ""}</button>`).join("");
    return `<div class="cartas tres">${cartas}</div>${this.campo("Descrição", "desc", "textarea", "Aparência, cheiro, voz, o que as pessoas notam primeiro, trejeitos.")}`;
  }

  rRevisao() {
    const W = this.W, o = this.O, e = o.especialidades[W.esp], t = e.talentos[W.tal];
    const it = (k, v) => `<div><b>${esc(k)}</b>${esc(v || "—")}</div>`;
    return `<div class="revisao">
      ${it("Nome", W.nome)}${it("Fachada", W.fachada)}${it("Ocupação", `${o.nome} · ${e.nome}`)}${it("Idade", `${W.idade || "—"} (${this.F.nome})`)}
      ${it("Atributos", ATTRS.map((a) => `${HDC.atributos[a].label} ${W.attr[a]}`).join(" · "))}
      ${it("Perícias", PERICIAS.filter((s) => W.sk[s]).map((s) => `${HDC.pericias[s].label} ${W.sk[s]}`).join(" · "))}
      ${it("Recursos", `${W.rec} · ${HDC.recursos[W.rec]}`)}${it("Idiomas", [W.nativo + " (nativo)", W.segundo].filter(Boolean).join(", "))}
      ${it("Talento", `${t.nome}: ${t.desc}`)}${it("Equipamento", o.equip[W.equip])}${it("Motivação", W.mot)}${it("Primeiro Contato", W.pc)}
      ${it("Segredo sombrio", W.seg)}${it("Lembrança", `${W.lem} · ${W.lemTxt}`)}
      ${it("Relacionamentos", W.rels.filter((r) => r.pj || r.txt).map((r) => `${r.pj || "?"}: ${r.txt}`).join(" · "))}</div>
      <p class="dica">Capacidade de carga: FORÇA ${W.attr.forca} × 2 = ${W.attr.forca * 2} itens. Começa com 0 XP e sem condições marcadas.</p>`;
  }

  /* ---------------- Ações ---------------- */

  _mudou() { this.mensagem = ""; this.render(); }

  static #onIr(event, target) { this.passo = Number(target.dataset.i); this.mensagem = ""; this.render(); }
  static #onVoltar() { if (this.passo > 0) { this.passo--; this._mudou(); } }
  static async #onAvancar() {
    const erro = this.passos[this.passo].v();
    if (erro) { this.mensagem = erro; return this.render(); }
    if (this.passo === this.passos.length - 1) return this.aplicar();
    this.passo++;
    this.maxVisto = Math.max(this.maxVisto, this.passo);
    this._mudou();
  }
  static #onOcupacao(event, target) {
    const i = Number(target.dataset.i);
    if (this.W.occ !== i) {
      Object.assign(this.W, { occ: i, esp: null, tal: null, equip: null, rec: OCUPACOES[i].rmin, mot: "", pc: "", seg: "" });
      this.ajustarLimites();
    }
    this._mudou();
  }
  static #onEspecialidade(event, target) {
    const i = Number(target.dataset.i);
    if (this.W.esp !== i) { this.W.esp = i; this.W.tal = null; }
    this._mudou();
  }
  static #onFaixa(event, target) {
    this.W.faixa = Number(target.dataset.i);
    if (this.idadeForaDaFaixa() || !this.W.idade) this.W.idade = String(this.F.min);
    this._mudou();
  }
  static #onAjustar(event, target) {
    const [t, k] = target.dataset.k.split(":");
    const d = Number(target.dataset.d);
    if (t === "a") this.W.attr[k] = Math.max(2, Math.min(this.maxAttr(k), this.W.attr[k] + d));
    else if (t === "s") this.W.sk[k] = Math.max(0, Math.min(this.maxSk(k), this.W.sk[k] + d));
    else if (t === "r") this.W.rec = Math.max(this.O.rmin, Math.min(this.O.rmax, this.W.rec + d));
    if (this.W.attr.raciocinio < 3) this.W.segundo = "";
    this._mudou();
  }
  static #onTalento(event, target) { this.W.tal = Number(target.dataset.i); this._mudou(); }
  static #onTabela(event, target) {
    const k = target.dataset.tab;
    this.W[k] = this.O.tabelas[NOMES_TABELA[k]][Number(target.dataset.i)];
    this._mudou();
  }
  static async #onRolarTabela(event, target) {
    const k = target.dataset.tab;
    const r = await new Roll("1d6").evaluate();
    this.W[k] = this.O.tabelas[NOMES_TABELA[k]][r.total - 1];
    this.mensagem = `Saiu ${r.total}.`;
    this.render();
  }
  static #onLembranca(event, target) { this.W.lem = target.dataset.k; this.W.lemTxt = LEMBRANCAS[this.W.lem]; this._mudou(); }
  static async #onRolarLembranca() {
    const r = await new Roll("1d6 + 1d6").evaluate();
    const k = `${r.dice[0].results[0].result}${r.dice[1].results[0].result}`;
    this.W.lem = k; this.W.lemTxt = LEMBRANCAS[k];
    this.mensagem = `Saiu ${k}: ${this.W.lemTxt}.`;
    this.render();
  }
  static #onEquip(event, target) { this.W.equip = Number(target.dataset.i); this._mudou(); }
  static #onAddRel() { if (this.W.rels.length < 6) this.W.rels.push({ pj: "", txt: "" }); this._mudou(); }
  static #onDelRel(event, target) {
    this.W.rels.splice(Number(target.dataset.i), 1);
    if (!this.W.rels.length) this.W.rels.push({ pj: "", txt: "" });
    this._mudou();
  }
  static async #onRolarRel(event, target) {
    const r = await new Roll("1d6").evaluate();
    this.W.rels[Number(target.dataset.i)].txt = this.O.tabelas["Relacionamentos"][r.total - 1];
    this.mensagem = `Saiu ${r.total}.`;
    this.render();
  }

  /* ---------------- Aplicar na ficha ---------------- */

  async aplicar() {
    const W = this.W, o = this.O, e = o.especialidades[W.esp], t = e.talentos[W.tal], F = this.F;
    const equipNome = o.equip[W.equip];
    const pc = [W.pc, W.viu && `Vi: ${W.viu}`, W.perdeu && `Perdi: ${W.perdeu}`, W.nunca && `Nunca contei: ${W.nunca}`].filter(Boolean).join("\n");

    const update = {
      name: W.nome.trim(),
      "prototypeToken.name": W.nome.trim(),
      "system.recursos.value": W.rec,
      "system.travado": true,
      "system.xp.value": 0,
      "system.condicoes.fisica.value": 0,
      "system.condicoes.mental.value": 0,
      "system.condicoes.quebradoFisico": false,
      "system.condicoes.quebradoMental": false,
      "system.vantagem": { descricao: "", pericia: "", usada: false },
      "system.diario.primeiraPagina": W.diario,
      "system.diario.lembranca": W.lemTxt,
      "system.diario.registrarUsado": false,
      "system.diario.desabafarUsado": false,
      "system.perfil.jogador": W.jogador,
      "system.perfil.fachada": W.fachada,
      "system.perfil.ocupacao": o.nome,
      "system.perfil.especialidade": e.nome,
      "system.perfil.faixa": F.key,
      "system.perfil.idade": W.idade,
      "system.perfil.idiomas": [W.nativo, W.segundo].filter(Boolean).join(", "),
      "system.perfil.motivacao": W.mot,
      "system.perfil.primeiroContato": pc,
      "system.perfil.segredo": W.seg,
      "system.perfil.relacionamentos": W.rels.filter((r) => r.pj || r.txt).map((r) => `${r.pj || "?"}: ${r.txt}`).join("\n"),
      "system.perfil.descricao": W.desc
    };
    for (const a of ATTRS) update[`system.atributos.${a}.value`] = W.attr[a];
    for (const s of PERICIAS) update[`system.pericias.${s}.value`] = W.sk[s];
    await this.actor.update(update, { hdcCriacao: true });

    // Itens: remove os de uma criação anterior e cria talento + equipamento.
    const antigos = this.actor.items.filter((i) => i.getFlag(SYSTEM_ID, "criacao")).map((i) => i.id);
    if (antigos.length) await this.actor.deleteEmbeddedDocuments("Item", antigos);
    const itens = [];
    const tal = await buscarNoCompendio("talentos", t.nome);
    itens.push(tal ?? { name: t.nome, type: "talento", system: { descricao: t.desc, categoria: "ocupacao", ocupacao: o.nome, especialidade: e.nome } });
    const nomeArsenal = EQUIP_ARSENAL[equipNome];
    const eq = nomeArsenal ? await buscarNoCompendio("arsenal", nomeArsenal) : null;
    itens.push(eq ?? { name: equipNome.charAt(0).toUpperCase() + equipNome.slice(1), type: "equipamento", system: { descricao: "Equipamento inicial da ocupação.", itemDePoder: EQUIP_PODER.includes(equipNome), peso: "normal" } });
    for (const i of itens) foundry.utils.setProperty(i, `flags.${SYSTEM_ID}.criacao`, true);
    await this.actor.createEmbeddedDocuments("Item", itens);
    await this.actor.setFlag(SYSTEM_ID, "criado", true);

    ui.notifications.info(`${W.nome} está pronto para a caçada.`);
    await this.close();
    this.actor.sheet.render(true);
  }
}

/** Procura um item pelo nome num compêndio do sistema e devolve os dados prontos para criar. */
async function buscarNoCompendio(pack, nome) {
  const p = game.packs.get(`${SYSTEM_ID}.${pack}`);
  if (!p) return null;
  const index = await p.getIndex();
  const alvo = HDC.normalizar(nome);
  const entrada = index.find((e) => HDC.normalizar(e.name) === alvo);
  if (!entrada) return null;
  const doc = await p.getDocument(entrada._id);
  const dados = doc.toObject();
  delete dados._id;
  delete dados.folder;
  foundry.utils.setProperty(dados, "_stats.compendiumSource", doc.uuid);
  return dados;
}

/** Abre o assistente para um ator (um por ator). */
export function abrirCriacao(actor) {
  if (!actor?.isOwner || actor.type !== "cacador") return;
  const id = `hdc-criacao-${actor.id}`;
  const aberto = foundry.applications.instances?.get(id);
  if (aberto) return aberto.bringToFront?.() ?? aberto.render(true);
  return new CriacaoCacador(actor).render(true);
}
