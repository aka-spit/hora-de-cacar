/**
 * Configuração central do sistema Hora de Caçar.
 * Tudo que é "regra fixa" do livro mora aqui, para ficar fácil de ajustar.
 */
export const SYSTEM_ID = "hora-de-cacar";

export const HDC = {};

/** Atributos (Cap. 2). A chave é usada nos dados; o rótulo é o do livro. */
HDC.atributos = {
  forca: { label: "FORÇA", abrev: "FOR", tipoCondicao: "fisica" },
  agilidade: { label: "AGILIDADE", abrev: "AGI", tipoCondicao: "fisica" },
  raciocinio: { label: "RACIOCÍNIO", abrev: "RAC", tipoCondicao: "mental" },
  empatia: { label: "EMPATIA", abrev: "EMP", tipoCondicao: "mental" }
};

/** Perícias (Cap. 3): quatro por atributo. */
HDC.pericias = {
  atletismo: { label: "Atletismo", atributo: "forca" },
  combate: { label: "Combate", atributo: "forca" },
  forcaBruta: { label: "Força Bruta", atributo: "forca" },
  vigor: { label: "Vigor", atributo: "forca" },
  manufatura: { label: "Manufatura", atributo: "agilidade" },
  pilotagem: { label: "Pilotagem", atributo: "agilidade" },
  pontaria: { label: "Pontaria", atributo: "agilidade" },
  subterfugio: { label: "Subterfúgio", atributo: "agilidade" },
  estudos: { label: "Estudos", atributo: "raciocinio" },
  investigacao: { label: "Investigação", atributo: "raciocinio" },
  medicina: { label: "Medicina", atributo: "raciocinio" },
  ocultismo: { label: "Ocultismo", atributo: "raciocinio" },
  cultura: { label: "Cultura", atributo: "empatia" },
  percepcao: { label: "Percepção", atributo: "empatia" },
  persuadir: { label: "Persuadir", atributo: "empatia" },
  vontade: { label: "Vontade", atributo: "empatia" }
};

/** Procura a chave de uma perícia pelo nome escrito (ex.: "Força Bruta"). */
HDC.periciaPorNome = function (nome) {
  if (!nome) return null;
  const alvo = HDC.normalizar(nome);
  for (const [k, v] of Object.entries(HDC.pericias)) {
    if (HDC.normalizar(v.label) === alvo || HDC.normalizar(k) === alvo) return k;
  }
  return null;
};

HDC.normalizar = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, "").trim();

/** Condições (Cap. 2 e 5): marcadas sempre em ordem. */
HDC.condicoes = {
  fisica: { label: "Físicas", nomes: ["Exausto", "Dolorido", "Ferido"], atributos: ["forca", "agilidade"] },
  mental: { label: "Mentais", nomes: ["Irritado", "Assustado", "Abalado"], atributos: ["raciocinio", "empatia"] }
};

/** Dificuldades (Cap. 3). */
HDC.dificuldades = { 1: "Normal (1)", 2: "Desafiadora (2)", 3: "Difícil (3)" };

/** Faixas de idade (Cap. 2). */
HDC.faixas = {
  jovem: { label: "Jovem (17 a 25)", atributos: 15, pericias: 10 },
  meiaIdade: { label: "Meia-idade (26 a 50)", atributos: 14, pericias: 12 },
  idoso: { label: "Idoso (51+)", atributos: 13, pericias: 14 }
};

/** Padrão de vida (Recursos 1 a 8). */
HDC.recursos = {
  1: "Miserável", 2: "Pobre", 3: "Apertado", 4: "Estável",
  5: "Confortável", 6: "Bem de vida", 7: "Rico", 8: "Podre de rico"
};

/** Peso para capacidade (Cap. 5): leve 1/2, normal 1, pesado 2, pessoa 4. */
HDC.pesos = { nenhum: { label: "—", valor: 0 }, leve: { label: "Leve (½)", valor: 0.5 }, normal: { label: "Normal (1)", valor: 1 }, pesado: { label: "Pesado (2)", valor: 2 }, pessoa: { label: "Pessoa (4)", valor: 4 } };

/** Naturezas de criatura (Cap. 11). */
HDC.naturezas = {
  monstro: { label: "Monstro", vida0: "Morre, se o golpe final usou a fraqueza. Se não usou, foge na hora e volta com a Vida toda na cena seguinte." },
  assombracao: { label: "Assombração", vida0: "Dispersa e volta em 1D6 horas." },
  entidade: { label: "Entidade", vida0: "Recua, abandona o hospedeiro ou some por um tempo." }
};

HDC.intensidades = { 0: "—", 1: "1. Eco", 2: "2. Presença", 3: "3. Potência", 4: "4. Tormenta" };

HDC.modIdentificacao = { 0: "[0] comum", "-1": "[−1] rara", "-2": "[−2] única" };

/** Tipos de ataque característico de criatura. */
HDC.tiposAtaque = {
  fisico: "Físico (dados, dano)",
  mental: "Ataque mental (condições)",
  medo: "Teste de Medo",
  maldicao: "Maldição (dados contra perícia)",
  especial: "Especial (só texto)"
};

HDC.tiposMarca = { defeito: "Defeito", revelacao: "Revelação" };
HDC.tiposRito = { simples: "Simples (cena curta, 1 condição mental)", maior: "Maior (10 min, 2 condições)", protocolo: "De Protocolo (1h+, 2 condições, sem rolagem)" };

/** Golpe crítico em criatura (Cap. 11). */
HDC.golpeCriticoCriatura = {
  1: "Frenesi: faz um ataque característico extra na hora.",
  2: "Alerta: na rodada seguinte, recebe a carta de iniciativa nº 1.",
  3: "Recuo: usa o próximo turno para ir a uma zona sem PJs.",
  4: "Atordoada: perde o próximo turno.",
  5: "Fuga: foge o mais rápido que pode. Se ninguém seguir, a cena acaba.",
  6: "Ferida grave: perde mais 3 de Vida."
};

/** Medo (Cap. 5). */
HDC.pavor = { 1: "1, Assustador", 2: "2, Terrível", 3: "3, Insuportável" };
HDC.reacoesAterrorizado = ["Fugir", "Congelar", "Desmaiar", "Atacar"];

/** Perguntas de XP do fim da sessão (Cap. 2). */
HDC.perguntasXP = [
  "Você participou da sessão? (sempre 1 XP)",
  "Você enfrentou uma criatura?",
  "Você identificou um tipo de criatura que ainda não conhecia?",
  "Seu segredo sombrio complicou sua vida?",
  "Você se arriscou para proteger um inocente?",
  "Você aprendeu algo importante?",
  "Você contribuiu para o QG ou para a Rede?",
  "Você fez algo extraordinário?"
];

/** Opções prontas para <select>. */
HDC.opcoesPericias = () => Object.fromEntries(Object.entries(HDC.pericias).map(([k, v]) => [k, v.label]));
HDC.opcoesAtributos = () => Object.fromEntries(Object.entries(HDC.atributos).map(([k, v]) => [k, v.label]));
