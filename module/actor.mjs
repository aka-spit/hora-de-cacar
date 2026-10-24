/**
 * Documento de Ator: regras que mexem no estado (condições, dano, críticos) e atalhos de rolagem.
 */
import { SYSTEM_ID, HDC } from "./config.mjs";
import { CRITICOS } from "./criticos.mjs";
import { teste, dialogoTeste, paradaSimples, cartaoSimples, rolarD66, rolarFormula, esc, mostrarDados } from "./dice.mjs";

export class HDCActor extends Actor {
  /* ---------------- Criação ---------------- */

  async _preCreate(data, options, user) {
    const ok = await super._preCreate(data, options, user);
    if (ok === false) return false;
    const proto = {};
    if (this.type === "cacador") Object.assign(proto, { actorLink: true, disposition: 1, sight: { enabled: true } });
    if (this.type === "criatura") Object.assign(proto, { disposition: -1 });
    if (Object.keys(proto).length) this.updateSource({ prototypeToken: proto });
  }

  /* ---------------- Paradas de dados ---------------- */

  /** Dados de um teste de atributo + perícia, já descontando condições. */
  calcularParada(atributoKey, periciaKey = null) {
    const s = this.system;
    const partes = [];
    const attr = s.atributos[atributoKey]?.value ?? 0;
    partes.push({ label: HDC.atributos[atributoKey].label, valor: attr });
    if (periciaKey) partes.push({ label: HDC.pericias[periciaKey].label, valor: s.pericias[periciaKey]?.value ?? 0 });
    const tipo = HDC.atributos[atributoKey].tipoCondicao;
    const cond = s.condicoes[tipo].value;
    if (cond) partes.push({ label: `Condições ${tipo === "fisica" ? "físicas" : "mentais"}`, valor: -cond });
    if (periciaKey === "atletismo" && s.penalidadeAtletismo) partes.push({ label: "Proteção pesada", valor: -s.penalidadeAtletismo });
    if ((periciaKey === "atletismo" || periciaKey === "subterfugio") && s.sobrecarga) partes.push({ label: "Sobrecarga", valor: -2 });
    return { partes, tipo };
  }

  /** Teste de Caçador com diálogo. */
  async rolarTeste({ atributo, pericia = null, titulo = null, ataque = null, medo = null, dificuldade = 1, partesExtras = [], opcoesExtras = [], nota = "" } = {}) {
    if (this.type !== "cacador") return;
    atributo ??= HDC.pericias[pericia]?.atributo;
    const { partes, tipo } = this.calcularParada(atributo, pericia);
    partes.push(...partesExtras);
    titulo ??= pericia ? `${HDC.pericias[pericia].label} (${HDC.atributos[atributo].label})` : HDC.atributos[atributo].label;

    const r = await dialogoTeste(this, { titulo, periciaKey: pericia, atributoKey: atributo, partes, dificuldade, opcoesExtras });
    if (!r) return;

    const todas = [...partes];
    if (r.ajuda) todas.push({ label: "Ajuda", valor: r.ajuda });
    if (r.mod) todas.push({ label: "Modificador", valor: r.mod });
    for (const u of r.usados) todas.push({ label: u.label.split(" (")[0], valor: u.valor });
    const dados = todas.reduce((t, p) => t + p.valor, 0);

    // Marca usos "uma vez por sessão".
    const upd = {};
    if (r.usados.some((u) => u.id === "vantagem")) upd["system.vantagem.usada"] = true;
    if (r.usados.some((u) => u.id === "registrar")) upd["system.diario.registrarUsado"] = true;
    if (Object.keys(upd).length) await this.update(upd);
    const marcas = r.usados.filter((u) => u.marcaUso).map((u) => ({ _id: u.itemId, "system.usada": true }));
    if (marcas.length) await this.updateEmbeddedDocuments("Item", marcas);

    return teste({ actor: this, titulo, dados, partes: todas, dificuldade: r.dificuldade, tipoCondicao: tipo, podeForcar: true, ataque, medo, nota });
  }

  /** Ataque com arma (Caçador ou PNJ). */
  async rolarAtaque(item) {
    const s = item.system;
    const dano = s.danoNumerico;
    const ataque = { nome: item.name, dano, danoTexto: dano === null ? s.dano : null, tipoDano: "fisico" };
    const nota = [s.alcance ? `Alcance ${s.alcance}` : "", s.itemDePoder ? "Item de poder: role 1d6 a cada uso contra criatura (1 = falha e acaba/quebra)." : "", s.descricao ? "" : ""].filter(Boolean).join(" · ");

    if (this.type === "cacador") {
      const pericia = s.pericia || "combate";
      return this.rolarTeste({
        pericia,
        titulo: `Ataque: ${item.name}`,
        ataque,
        partesExtras: s.bonus ? [{ label: item.name, valor: s.bonus }] : [],
        nota
      });
    }
    if (this.type === "pnj") {
      const lista = this.system.listaPericias;
      const p = lista.find((x) => x.chave === s.pericia) ?? lista.find((x) => x.chave === "combate") ?? { nome: "Dados", dados: 3 };
      const dor = this.system.resistencia.fisica.dano;
      const partes = [{ label: p.nome, valor: p.dados }];
      if (s.bonus) partes.push({ label: item.name, valor: s.bonus });
      if (dor) partes.push({ label: "Dano físico sofrido", valor: -dor });
      const dados = partes.reduce((t, x) => t + x.valor, 0);
      return teste({ actor: this, titulo: `Ataque: ${item.name}`, dados, partes, dificuldade: 1, tipoCondicao: null, podeForcar: false, ataque, nota });
    }
  }

  /** Teste de Medo: EMPATIA + Vontade + aliados presentes contra o Pavor. */
  async rolarMedo(pavor = 1, origem = "") {
    if (this.type !== "cacador") return;
    const extrasHTML = `<div class="form-group"><label>PJs presentes (não Quebrados nem Aterrorizados)</label>
      <select name="aliados"><option value="0">0</option><option value="1">+1</option><option value="2">+2</option><option value="3">+3</option></select></div>`;
    const { partes, tipo } = this.calcularParada("empatia", "vontade");
    // Talentos que mexem no Medo
    const opcoesExtras = [];
    for (const it of this.items) {
      const n = HDC.normalizar(it.name);
      if (it.type === "talento" && n === HDC.normalizar("Sangue-Frio")) opcoesExtras.push({ id: `t-${it.id}`, label: "Sangue-Frio (+2 em Medo)", valor: 2, marcado: true });
      if (it.type === "marca" && HDC.normalizar(it.system.pericia) === "medo")
        opcoesExtras.push({ id: `m-${it.id}`, label: `${it.system.tipo === "defeito" ? "Defeito" : "Revelação"} ${it.name} (${it.system.mod})`, valor: it.system.mod });
    }
    const r = await dialogoTeste(this, { titulo: `Teste de Medo${origem ? ": " + origem : ""}`, periciaKey: "vontade", partes, dificuldade: pavor, extrasHTML, opcoesExtras });
    if (!r) return;
    const todas = [...partes];
    const aliados = Number(r.form.aliados?.value) || 0;
    if (aliados) todas.push({ label: "PJs presentes", valor: aliados });
    if (r.ajuda) todas.push({ label: "Ajuda", valor: r.ajuda });
    if (r.mod) todas.push({ label: "Modificador", valor: r.mod });
    for (const u of r.usados) todas.push({ label: u.label.split(" (")[0], valor: u.valor });
    const dados = todas.reduce((t, p) => t + p.valor, 0);
    if (r.usados.some((u) => u.id === "registrar")) await this.update({ "system.diario.registrarUsado": true });
    return teste({ actor: this, titulo: `Teste de Medo (Pavor ${r.dificuldade})${origem ? " · " + origem : ""}`, dados, partes: todas, dificuldade: r.dificuldade, tipoCondicao: tipo, podeForcar: true, medo: { pavor: r.dificuldade } });
  }

  /** Teste de diário para identificar criatura (Cap. 11). */
  async rolarDiario() {
    const extrasHTML = `<div class="form-group"><label>Perícia</label><select name="per"><option value="ocultismo">Ocultismo</option><option value="investigacao">Investigação</option></select></div>
      <div class="form-group"><label>Criatura</label><select name="modid"><option value="0">Comum [0]</option><option value="-1">Rara [−1]</option><option value="-2">Única [−2]</option></select></div>`;
    const pre = await foundry.applications.api.DialogV2.wait({
      window: { title: "Teste de diário" },
      content: `<div class="hdc-roll-dialog">${extrasHTML}<p class="hint">+2 dados do diário. Desafiador (2) ou Difícil (3). Leva ~6 horas por nível de Ferocidade.</p></div>`,
      buttons: [{ action: "ok", label: "Continuar", default: true, callback: (e, b) => ({ per: b.form.elements.per.value, modid: Number(b.form.elements.modid.value) }) }],
      rejectClose: false
    });
    if (!pre || typeof pre !== "object") return;
    const partesExtras = [{ label: "Diário", valor: 2 }];
    if (pre.modid) partesExtras.push({ label: "Identificação", valor: pre.modid });
    return this.rolarTeste({ pericia: pre.per, titulo: "Teste de diário", dificuldade: 2, partesExtras, nota: "Na falha, o que o diário sabe aparece, mas o Protocolo não está anotado (ou foi rasurado)." });
  }

  /** Rolagem de Recursos antes do caso. */
  async rolarRecursos() {
    const n = this.system.recursos.value;
    return paradaSimples({ actor: this, titulo: "Recursos", dados: n, nota: `Cada 6 vale 1 ponto de disponibilidade para o grupo. Capital durante o caso: ${this.system.capital}.` });
  }

  /** Rolagem de Proteção (colete/capacete). */
  async rolarProtecao(cobertura = 0) {
    const p = this.system.protecaoTotal ?? 0;
    if (!p) return ui.notifications.info("Nenhuma proteção equipada.");
    return paradaSimples({ actor: this, titulo: "Proteção", dados: p, nota: "Cada 6 reduz 1 de dano. Não vale contra Maldições, ataques mentais, quedas, fogo, veneno e explosões." });
  }

  /** Recuperação no QG (Cap. 7). */
  async rolarRecuperacao(tipo = "fisica") {
    const a = tipo === "fisica" ? ["forca", "agilidade"] : ["raciocinio", "empatia"];
    const n = this.system.atributos[a[0]].value + this.system.atributos[a[1]].value;
    return paradaSimples({ actor: this, titulo: `Recuperação ${tipo === "fisica" ? "física" : "mental"}`, dados: n, nota: "Cada sucesso cura um Defeito ou fixa uma Revelação deste tipo." });
  }

  /* ---------------- Condições ---------------- */

  /**
   * Marca condições em ordem. Ao passar do limite, fica Quebrado e rola crítico.
   * @returns {Promise<boolean>} true se ficou (ou já estava) Quebrado
   */
  async marcarCondicao(tipo, n = 1, { motivo = "", rolarCritico = true } = {}) {
    if (this.type !== "cacador" || n <= 0) return false;
    const c = this.system.condicoes;
    const max = c[tipo].max ?? 3;
    const chaveQ = tipo === "fisica" ? "quebradoFisico" : "quebradoMental";
    let atual = c[tipo].value;
    let criticos = 0;
    let quebrado = c[chaveQ];
    for (let i = 0; i < n; i++) {
      if (atual < max) atual++;
      else criticos++; // além da última caixa: Quebrado, e cada novo dano gera outro crítico
    }
    if (criticos) quebrado = true;
    await this.update({ [`system.condicoes.${tipo}.value`]: atual, [`system.condicoes.${chaveQ}`]: quebrado });

    const nomes = HDC.condicoes[tipo].nomes;
    const marcadas = nomes.slice(0, Math.min(atual, 3)).join(", ") + (atual > 3 ? ", 4ª caixa" : "");
    await cartaoSimples({
      actor: this,
      titulo: `${this.name}: condição ${tipo === "fisica" ? "física" : "mental"}`,
      html: `<p>${motivo ? esc(motivo) + ": " : ""}+${n} condição${n > 1 ? "ões" : ""}. Marcadas: <b>${marcadas || "nenhuma"}</b>.</p>${criticos ? `<p class="hdc-aviso">QUEBRADO ${tipo === "fisica" ? "FISICAMENTE" : "MENTALMENTE"}! ${criticos > 1 ? criticos + " ferimentos críticos." : "Ferimento crítico."}</p>` : ""}`
    });
    if (criticos && rolarCritico) for (let i = 0; i < criticos; i++) await this.rolarCritico(tipo);
    return quebrado;
  }

  /** Cura da última para a primeira. Se curar algo estando Quebrado, deixa de estar. */
  async curarCondicao(tipo, n = 1) {
    if (this.type !== "cacador") return;
    const c = this.system.condicoes;
    const chaveQ = tipo === "fisica" ? "quebradoFisico" : "quebradoMental";
    let atual = c[tipo].value;
    let q = c[chaveQ];
    let resto = n;
    if (q && resto > 0) { q = false; resto--; }
    atual = Math.max(0, atual - resto);
    await this.update({ [`system.condicoes.${tipo}.value`]: atual, [`system.condicoes.${chaveQ}`]: q });
  }

  /* ---------------- Dano ---------------- */

  /**
   * Aplica dano conforme o tipo de ator.
   *  - Caçador: cada ponto vira uma condição (física ou mental).
   *  - PNJ: soma na Resistência; sai de cena ao passar dela.
   *  - Criatura: tira Vida, descontando Armadura (a menos que use a fraqueza).
   */
  async aplicarDano(valor, { tipo = "fisico", ignorarArmadura = false, motivo = "" } = {}) {
    valor = Number(valor) || 0;
    if (valor <= 0) return;
    if (this.type === "cacador") return this.marcarCondicao(tipo === "mental" ? "mental" : "fisica", valor, { motivo: motivo || "dano" });

    if (this.type === "pnj") {
      const k = tipo === "mental" ? "mental" : "fisica";
      const r = this.system.resistencia[k];
      const novo = r.dano + valor;
      await this.update({ [`system.resistencia.${k}.dano`]: novo });
      const fora = novo > r.max;
      return cartaoSimples({ actor: this, titulo: `${this.name} sofre ${valor} de dano ${k === "fisica" ? "físico" : "mental"}`, html: `<p>Dano acumulado ${novo} / Resistência ${r.max}. ${fora ? "<b>Sai da cena</b> (desmaia, se rende, foge ou, se letal, morre)." : `−${novo} dado(s) nos testes ${k === "fisica" ? "físicos" : "mentais"}.`}</p>` });
    }

    if (this.type === "criatura") {
      const arm = ignorarArmadura ? 0 : this.system.armadura;
      const efetivo = Math.max(0, valor - arm);
      const vida = Math.max(0, this.system.vida.value - efetivo);
      await this.update({ "system.vida.value": vida });
      return cartaoSimples({
        actor: this,
        titulo: `${this.name}: −${efetivo} Vida`,
        html: `<p>Dano ${valor}${arm ? ` − Armadura ${arm}` : ignorarArmadura ? " (fraqueza: ignora Armadura)" : ""} = <b>${efetivo}</b>. Vida ${vida}/${this.system.vida.max}.</p>${vida === 0 ? `<p class="hdc-aviso">Vida 0 — ${esc(this.system.vida0)}</p>` : ""}`
      });
    }
  }

  /* ---------------- Ferimento crítico ---------------- */

  async rolarCritico(tipo = "fisica") {
    const tabela = tipo === "fisica" ? CRITICOS.fisico : CRITICOS.mental;
    let { roll, valor } = await rolarD66();
    let linha = tabela.find((l) => l.d66 === valor);
    let nota = "";
    // Capacete: crítico de cabeça é rolado de novo, fica o segundo.
    const cabeca = [16, 54, 56];
    if (tipo === "fisica" && cabeca.includes(valor) && this.items.some((i) => i.type === "protecao" && i.system.equipada && i.system.capacete)) {
      await mostrarDados(roll);
      const r2 = await rolarD66();
      nota = `Capacete: ${valor} (${linha.nome}) foi rolado de novo. `;
      roll = r2.roll; valor = r2.valor; linha = tabela.find((l) => l.d66 === valor);
    }
    let prazoTxt = "";
    if (linha.grave && linha.prazo) {
      const [qtd, ...unid] = linha.prazo.split(" ");
      const r = await rolarFormula(qtd.toLowerCase());
      prazoTxt = `${r.total} ${unid.join(" ")}`;
    }
    const tipoMarca = linha.tipo === "defeito" ? "Defeito" : "Revelação";
    const html = `
      <div class="hdc-critico"><span class="d66">${valor}</span> <b>${esc(linha.nome)}</b></div>
      ${nota ? `<p class="hdc-nota">${esc(nota)}</p>` : ""}
      <p>${linha.grave ? `<b>${tipo === "fisica" ? "FATAL" : "CRÔNICO"}</b> — prazo: <b>${prazoTxt}</b>. Precisa ser tratado (${tipo === "fisica" ? "Medicina" : "Vontade"}, ação lenta, 1 sucesso) dentro do prazo.` : "Não é fatal."}</p>
      <p>${tipoMarca}: <b>${esc(linha.marca)}</b>, ${esc(linha.pericia)} ${linha.mod > 0 ? "+" : ""}${linha.mod} (anotado na ficha até a Recuperação no QG).</p>
      <p class="hdc-nota">Quebrado ${tipo === "fisica" ? "fisicamente: só consegue gemer, murmurar e talvez se arrastar" : "mentalmente: ainda se protege, mas não age com propósito"}. Nenhum teste tem sucesso até ser tratado.</p>`;
    await cartaoSimples({ actor: this, titulo: `Ferimento crítico ${tipo === "fisica" ? "físico" : "mental"}`, html, roll });

    await this.createEmbeddedDocuments("Item", [{
      name: linha.marca,
      type: "marca",
      img: linha.tipo === "defeito" ? "icons/svg/blood.svg" : "icons/svg/eye.svg",
      system: { tipo: linha.tipo, natureza: tipo, pericia: linha.pericia, mod: linha.mod, origem: `${valor} ${linha.nome}`, prazo: prazoTxt, descricao: "" }
    }]);
  }

  /* ---------------- Diário ---------------- */

  async desabafar() {
    if (this.system.diario.desabafarUsado) return ui.notifications.warn("Desabafar já foi usado nesta sessão.");
    const escolha = await foundry.applications.api.DialogV2.wait({
      window: { title: "Desabafar (diário)" },
      content: `<p>Uma cena curta escrevendo no diário: cure duas condições.</p>`,
      buttons: [
        { action: "ff", label: "2 físicas" },
        { action: "mm", label: "2 mentais", default: true },
        { action: "fm", label: "1 de cada" }
      ],
      rejectClose: false
    });
    if (!escolha) return;
    const f = (escolha.match(/f/g) || []).length;
    const m = (escolha.match(/m/g) || []).length;
    if (f) await this.curarCondicao("fisica", f);
    if (m) await this.curarCondicao("mental", m);
    await this.update({ "system.diario.desabafarUsado": true });
    return cartaoSimples({ actor: this, titulo: "Desabafar", html: `<p>${esc(this.name)} escreve no diário${this.system.diario.lembranca ? `, segurando ${esc(this.system.diario.lembranca)}` : ""}. Cura ${f ? f + " física(s)" : ""}${f && m ? " e " : ""}${m ? m + " mental(is)" : ""}.</p>` });
  }

  /** Nova sessão: libera os usos "uma vez por sessão". */
  async novaSessao() {
    await this.update({ "system.vantagem.usada": false, "system.diario.registrarUsado": false, "system.diario.desabafarUsado": false });
    const upd = this.items.filter((i) => (i.type === "marca" && i.system.usada) || (i.type === "talento" && i.system.usado && i.system.limite === "sessao")).map((i) => ({ _id: i.id, "system.usada": false, "system.usado": false }));
    if (upd.length) await this.updateEmbeddedDocuments("Item", upd);
    ui.notifications.info(`${this.name}: usos de sessão liberados.`);
  }

  /* ---------------- Criaturas ---------------- */

  /** Executa um ataque característico (1 a 6). Sem número, rola 1d6 sem repetir o último. */
  async ataqueCriatura(n = null) {
    if (this.type !== "criatura") return;
    let notaRepeticao = "";
    if (!n) {
      const r = await rolarFormula("1d6");
      await mostrarDados(r);
      n = r.total;
      if (n === this.system.ultimoAtaque) {
        notaRepeticao = `Saiu ${n}, repetido: usa o seguinte. `;
        n = (n % 6) + 1;
      }
    }
    const a = this.system.ataques[`a${n}`];
    await this.update({ "system.ultimoAtaque": n });
    if (!a?.nome && !a?.descricao) return cartaoSimples({ actor: this, titulo: `Ataque ${n}`, html: `<p>${notaRepeticao}Ataque ${n} não preenchido na ficha.</p>` });

    const titulo = `${n}. ${a.nome || "Ataque"}`;
    const desc = a.descricao ? `<p>${esc(a.descricao)}</p>` : "";
    const pre = notaRepeticao ? `<p class="hdc-nota">${notaRepeticao}</p>` : "";

    if (a.tipo === "fisico" && a.dados > 0) {
      return teste({ actor: this, titulo, dados: a.dados, partes: [], dificuldade: 1, tipoCondicao: null, podeForcar: false, ataque: { nome: a.nome, dano: a.dano, tipoDano: "fisico" }, nota: `${notaRepeticao}${a.descricao || ""} · Pode ser esquivado (Atletismo) ou aparado (Combate).` });
    }
    if (a.tipo === "mental") {
      return cartaoSimples({ actor: this, titulo, html: `${pre}${desc}<p>Ataque mental: <b>${a.dano}</b> condição(ões) mental(is). Não pode ser esquivado; o alvo rola Vontade e cada sucesso reduz uma condição.</p>
        <div class="hdc-botoes"><button type="button" data-hdc="resistir" data-pericia="vontade" data-mental="${a.dano}"><i class="fas fa-shield-heart"></i> Resistir com Vontade</button></div>` });
    }
    if (a.tipo === "medo") {
      const pavor = a.dano || 1;
      return cartaoSimples({ actor: this, titulo, html: `${pre}${desc}<p>Teste de Medo ${pavor}.</p><div class="hdc-botoes"><button type="button" data-hdc="medo" data-pavor="${pavor}" data-origem="${esc(this.name)}"><i class="fas fa-ghost"></i> Fazer teste de Medo</button></div>` });
    }
    if (a.tipo === "maldicao" && a.dados > 0) {
      const per = HDC.periciaPorNome(a.resistencia) ?? "vontade";
      const s = await paradaSimples({ actor: this, titulo: `${titulo} — Maldição`, dados: a.dados, nota: `${notaRepeticao}${a.descricao || ""} A criatura precisa de mais sucessos que o PJ.`,
        extraHTML: `<div class="hdc-botoes"><button type="button" data-hdc="resistir" data-pericia="${per}"><i class="fas fa-shield-heart"></i> Resistir com ${HDC.pericias[per].label}</button></div>` });
      return s;
    }
    return cartaoSimples({ actor: this, titulo, html: `${pre}${desc}${a.dados ? `<p>${a.dados} dados${a.dano ? `, dano ${a.dano}` : ""}.</p>` : ""}` });
  }

  /** Rolagem de AGILIDADE/PERCEPÇÃO de criatura, ou perícia de PNJ. */
  async rolarDados(titulo, dados, { nota = "" } = {}) {
    let n = Number(dados) || 0;
    const partes = [{ label: titulo, valor: n }];
    if (this.type === "pnj") {
      const chave = HDC.periciaPorNome(titulo);
      const tipo = chave ? HDC.atributos[HDC.pericias[chave].atributo].tipoCondicao : null;
      const dor = tipo ? this.system.resistencia[tipo].dano : 0;
      if (dor) partes.push({ label: "Dano sofrido", valor: -dor });
      n -= dor;
    }
    return teste({ actor: this, titulo, dados: n, partes, dificuldade: 1, tipoCondicao: null, podeForcar: false, nota });
  }
}
