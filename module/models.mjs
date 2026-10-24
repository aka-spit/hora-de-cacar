/**
 * Modelos de dados (TypeDataModel) de Atores e Itens.
 * Substituem o antigo template.json.
 */
import { HDC } from "./config.mjs";
import { MELHORIAS, VEICULOS } from "./config-qg.mjs";

const F = foundry.data.fields;

const int = (initial = 0, min = 0, max = undefined) =>
  new F.NumberField({ required: true, nullable: false, integer: true, initial, min, max });
const txt = (initial = "") => new F.StringField({ required: true, blank: true, initial });
const bool = (initial = false) => new F.BooleanField({ required: true, initial });

/* -------------------------------------------- */
/*  ATORES                                      */
/* -------------------------------------------- */

export class CacadorData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const atributos = {};
    for (const k of Object.keys(HDC.atributos)) atributos[k] = new F.SchemaField({ value: int(2, 1, 6) });
    const pericias = {};
    for (const k of Object.keys(HDC.pericias)) pericias[k] = new F.SchemaField({ value: int(0, 0, 6) });

    return {
      atributos: new F.SchemaField(atributos),
      pericias: new F.SchemaField(pericias),
      condicoes: new F.SchemaField({
        fisica: new F.SchemaField({ value: int(0, 0, 4) }),
        mental: new F.SchemaField({ value: int(0, 0, 4) }),
        quebradoFisico: bool(),
        quebradoMental: bool()
      }),
      recursos: new F.SchemaField({ value: int(1, 1, 8) }),
      // Cadeado: trava atributos e perícias (só o Narrador destrava, se a opção estiver ligada).
      travado: bool(),
      xp: new F.SchemaField({ value: int(0, 0) }),
      vantagem: new F.SchemaField({ descricao: txt(), pericia: txt(), usada: bool() }),
      diario: new F.SchemaField({
        registrarUsado: bool(),
        desabafarUsado: bool(),
        primeiraPagina: txt(),
        lembranca: txt()
      }),
      perfil: new F.SchemaField({
        dossie: txt(),
        jogador: txt(),
        fachada: txt(),
        ocupacao: txt(),
        especialidade: txt(),
        faixa: txt("meiaIdade"),
        idade: txt(),
        idiomas: txt("Português"),
        motivacao: txt(),
        primeiroContato: txt(),
        segredo: txt(),
        relacionamentos: txt(),
        descricao: txt(),
        notas: txt()
      })
    };
  }

  prepareDerivedData() {
    const actor = this.parent;
    const talentos = actor.items.filter((i) => i.type === "talento").map((i) => HDC.normalizar(i.name));

    // Durão: quarta caixa de condição física.
    this.condicoes.fisica.max = talentos.includes(HDC.normalizar("Durão")) ? 4 : 3;
    this.condicoes.mental.max = 3;

    // Capital = Recursos − 2 (mínimo 0).
    this.capital = Math.max(0, this.recursos.value - 2);

    // Capacidade = FORÇA × 2; carga = soma dos pesos dos itens carregados.
    this.capacidade = this.atributos.forca.value * 2;
    let carga = 0;
    for (const i of actor.items) {
      const s = i.system;
      if (!s?.peso || s.carregado === false) continue;
      carga += (HDC.pesos[s.peso]?.valor ?? 0) * (s.quantidade ?? 1);
    }
    this.carga = carga;
    this.sobrecarga = carga > this.capacidade ? (carga > this.capacidade * 2 ? 2 : 1) : 0;

    // Proteção: a melhor equipada (+1 por capacete).
    const equipadas = actor.items.filter((i) => i.type === "protecao" && i.system.equipada);
    const capacete = equipadas.some((i) => i.system.capacete);
    const melhor = equipadas.filter((i) => !i.system.capacete).reduce((m, i) => Math.max(m, i.system.protecao), 0);
    this.protecaoTotal = melhor + (capacete ? 1 : 0);
    this.penalidadeAtletismo = equipadas.reduce((m, i) => Math.max(m, i.system.penalidade ?? 0), 0);

    this.quebrado = this.condicoes.quebradoFisico || this.condicoes.quebradoMental;

    // Iniciativa (usado pelo módulo Year Zero Combat): 1 entrada; Reflexos tira 2 cartas e fica com a melhor.
    const reflexos = talentos.some((t) => t.startsWith(HDC.normalizar("Reflexos de Quem")));
    this.iniciativa = { velocidade: 1, cartas: reflexos ? 2 : 1 };
  }
}

export class PnjData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      resistencia: new F.SchemaField({
        fisica: new F.SchemaField({ max: int(1, 1, 3), dano: int(0, 0) }),
        mental: new F.SchemaField({ max: int(1, 1, 3), dano: int(0, 0) })
      }),
      pericias: txt("Combate 4, Vigor 3, Vontade 3, Percepção 3"),
      papel: txt(),
      descricao: txt(),
      notas: txt()
    };
  }

  prepareDerivedData() {
    this.listaPericias = PnjData.lerPericias(this.pericias);
    this.iniciativa = { velocidade: 1, cartas: 1 };
    this.foraDeCena = {
      fisica: this.resistencia.fisica.dano > this.resistencia.fisica.max,
      mental: this.resistencia.mental.dano > this.resistencia.mental.max
    };
  }

  /** Lê "Combate 6, Vigor 4" → [{nome, chave, dados}] */
  static lerPericias(texto) {
    return String(texto ?? "")
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => {
        const m = s.match(/^(.*?)\s*(\d+)\s*(dados)?$/i);
        if (!m) return null;
        const nome = m[1].trim();
        return { nome, chave: HDC.periciaPorNome(nome), dados: Number(m[2]) };
      })
      .filter(Boolean);
  }
}

export class CriaturaData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const ataque = () =>
      new F.SchemaField({
        nome: txt(),
        tipo: txt("fisico"),
        dados: int(0, 0),
        dano: int(0, 0),
        resistencia: txt(),
        descricao: txt()
      });
    return {
      natureza: txt("monstro"),
      modId: int(0, -2, 0),
      folclore: txt(),
      intensidade: int(0, 0, 4),
      ferocidade: int(1, 1, 6),
      vida: new F.SchemaField({ value: int(6, 0), max: int(6, 0) }),
      armadura: int(0, 0),
      pavor: new F.SchemaField({ primeiro: int(1, 0, 3), seguintes: int(1, 0, 3) }),
      agilidade: int(4, 0),
      percepcao: int(4, 0),
      apresentacao: txt(),
      pistas: new F.SchemaField({ todos: txt(), diario: txt(), segredo: txt() }),
      protocolo: txt(),
      habilidades: txt(),
      fraquezas: txt(),
      imunidades: txt(),
      comportamento: new F.SchemaField({ r13: txt(), r45: txt(), r6: txt() }),
      ataques: new F.SchemaField({
        a1: ataque(), a2: ataque(), a3: ataque(), a4: ataque(), a5: ataque(), a6: ataque()
      }),
      ultimoAtaque: int(0, 0, 6),
      jaVista: bool(),
      notas: txt()
    };
  }

  prepareDerivedData() {
    this.pavorAtual = this.jaVista ? this.pavor.seguintes : this.pavor.primeiro;
    // Ferocidade = quantas cartas/entradas na iniciativa (Year Zero Combat: "speed").
    this.iniciativa = { velocidade: this.ferocidade, cartas: 1 };
    this.vida0 = HDC.naturezas[this.natureza]?.vida0 ?? "";
  }
}

/* -------------------------------------------- */
/*  ITENS                                       */
/* -------------------------------------------- */

const base = () => ({
  descricao: txt(),
  disponibilidade: int(0, 0, 5),
  peso: txt("normal"),
  carregado: bool(true),
  quantidade: int(1, 0)
});

export class ArmaData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...base(),
      dano: txt("1"),
      alcance: txt("0"),
      bonus: int(0, -5, 5),
      pericia: txt("combate"),
      itemDePoder: bool()
    };
  }
  get danoNumerico() {
    const n = Number.parseInt(this.dano, 10);
    return Number.isFinite(n) ? n : null;
  }
}

export class ProtecaoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...base(),
      protecao: int(1, 0, 10),
      penalidade: int(0, 0, 5),
      capacete: bool(),
      equipada: bool(true)
    };
  }
}

export class EquipamentoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      ...base(),
      bonus: int(0, -5, 5),
      pericia: txt(),
      uso: txt(),
      itemDePoder: bool()
    };
  }
}

export class TalentoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      descricao: txt(),
      categoria: txt("geral"),
      ocupacao: txt(),
      especialidade: txt(),
      ocupacoesComuns: txt(),
      pericia: txt(),
      bonus: int(0, -5, 5),
      limite: txt(),
      usado: bool()
    };
  }
}

export class MarcaData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      tipo: txt("defeito"),
      natureza: txt("fisica"),
      pericia: txt(),
      mod: int(-1, -5, 5),
      origem: txt(),
      prazo: txt(),
      usada: bool(),
      descricao: txt()
    };
  }
}

export class RitoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      tipo: txt("simples"),
      lingua: txt(),
      tempo: txt(),
      custo: txt(),
      descricao: txt()
    };
  }
}

/* -------------------------------------------- */
/*  QG E VEÍCULO (Cap. 6 e 7)                   */
/* -------------------------------------------- */

export class QgData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const melhorias = {};
    for (const k of Object.keys(MELHORIAS)) melhorias[k] = bool(k === "arquivo" || k === "veterano");
    const ameaca = () => new F.SchemaField({ nome: txt(), fatias: int(0, 0, 3) });
    return {
      tipo: txt("Hotel de beira de estrada"),
      fachada: txt(),
      veterano: txt(),
      veteranoSegredo: txt(),
      desenvolvimento: int(0, 0),
      comprasVolta: int(0, 0),
      melhorias: new F.SchemaField(melhorias),
      ameacas: new F.SchemaField({ a1: ameaca(), a2: ameaca(), a3: ameaca(), a4: ameaca(), a5: ameaca(), a6: ameaca() }),
      planta: txt(),
      equipamento: txt(),
      contatosNotas: txt(),
      temporada: txt(),
      notas: txt()
    };
  }

  prepareDerivedData() {
    const m = this.melhorias;
    this.instalacoes = Object.entries(MELHORIAS).filter(([k, v]) => v.tipo === "instalacao" && m[k]).length;
    this.redutorAmeaca = (m.sentinela ? 1 : 0) + (m.quarto ? 1 : 0);
  }
}

export class VeiculoData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      tipo: txt("seda"),
      qualidade: int(1, 1, 4),
      bonus: int(1, -3, 5),
      assentos: txt("5"),
      carga: int(12, 0),
      manutencao: int(1, 0, 6),
      estado: txt("bom"),
      defeito: txt(),
      portaMalas: bool(),
      perseguicao: new F.SchemaField({ distancia: int(5, 3, 7), nos: int(0, 0), eles: int(0, 0) }),
      notas: txt()
    };
  }

  prepareDerivedData() {
    this.bonusEfetivo = this.estado === "bom" ? this.bonus : 0;
    this.anda = this.estado !== "quebrado";
    let usada = 0;
    for (const i of this.parent.items) {
      const s = i.system;
      if (s?.peso) usada += (HDC.pesos[s.peso]?.valor ?? 0) * (s.quantidade ?? 1);
    }
    this.cargaUsada = usada;
    this.notaTipo = VEICULOS[this.tipo]?.nota ?? "";
  }
}
