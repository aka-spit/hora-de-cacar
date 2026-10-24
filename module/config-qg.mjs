/**
 * Dados do Carro (Cap. 6) e do QG (Cap. 7).
 */

/** Veículos genéricos (Cap. 6). */
export const VEICULOS = {
  caminhao: { label: "Caminhão", qualidade: 2, bonus: 0, assentos: "3", carga: 100, manutencao: 3, nota: "Lento, enorme e impossível de parar. Atropelar uma criatura causa dano 6. Veículo grande." },
  carroLuxo: { label: "Carro de luxo", qualidade: 4, bonus: 2, assentos: "5", carga: 10, manutencao: 4, nota: "+1 em Persuadir em fachadas de gente rica. Qualquer arranhão custa o dobro." },
  carroPotente: { label: "Carro potente", qualidade: 3, bonus: 2, assentos: "5", carga: 10, manutencao: 3, nota: "Ótimo em perseguição; −1 em Subterfúgio para seguir alguém." },
  hatch: { label: "Hatch popular", qualidade: 2, bonus: 1, assentos: "5", carga: 8, manutencao: 2, nota: "Pequeno, econômico e invisível. Não cabem uma pá e uma escopeta ao mesmo tempo." },
  moto: { label: "Motocicleta", qualidade: 2, bonus: 2, assentos: "2", carga: 2, manutencao: 2, nota: "Foge por onde carro não passa. Leva um passageiro. Na chuva, −1 em Pilotagem. Na cidade, +1 dado em perseguição." },
  motorHome: { label: "Motor-home", qualidade: 2, bonus: 0, assentos: "4", carga: 30, manutencao: 3, nota: "Conta como QG móvel (máx. 4 Instalações). Perde quase sempre numa perseguição. Veículo grande." },
  perua: { label: "Perua", qualidade: 2, bonus: 1, assentos: "5", carga: 16, manutencao: 2, nota: "Cabe o arsenal, o colchão e, se precisar, um corpo." },
  picape: { label: "Picape ou caminhonete", qualidade: 2, bonus: 1, assentos: "2 a 5", carga: 20, manutencao: 2, nota: "+1 extra em Pilotagem fora do asfalto. O que vai na caçamba fica à vista." },
  seda: { label: "Sedã velho", qualidade: 1, bonus: 1, assentos: "5", carga: 12, manutencao: 1, nota: "Porta-malas fundo, motor teimoso e peça barata em qualquer ferro-velho. O carro clássico de Caçador." },
  utilitario: { label: "Utilitário 4x4", qualidade: 3, bonus: 1, assentos: "7", carga: 16, manutencao: 3, nota: "+1 extra em Pilotagem fora do asfalto (lama, neve, mata). Caro de manter." },
  van: { label: "Van", qualidade: 1, bonus: 0, assentos: "9", carga: 30, manutencao: 1, nota: "Cabe o grupo todo e uma cama atrás. Lenta, sem bônus e quebra fácil." },
  outro: { label: "Outro", qualidade: 2, bonus: 0, assentos: "5", carga: 10, manutencao: 2, nota: "" }
};

export const QUALIDADES = {
  1: { label: "1, Lata-velha", mod: -1, descr: "Ferrugem, barulhos, peças de ferro-velho" },
  2: { label: "2, Comum", mod: 0, descr: "Rodado, mas bem cuidado" },
  3: { label: "3, Bom", mod: 1, descr: "Revisado, pneus novos, motor forte" },
  4: { label: "4, Excelente", mod: 0, duas: true, descr: "Novo ou restaurado com carinho; chama atenção" }
};

export const ESTADOS_CARRO = { bom: "Bom", avariado: "Avariado (sem bônus)", quebrado: "Quebrado (não anda)" };

/** Rolagem de viagem (Cap. 6). */
export function problemaDeViagem(soma, d6) {
  if (soma >= 6) return { titulo: "Nada acontece com o carro", efeito: "A viagem segue sem problemas. O Narrador pode usar o tempo para uma cena de estrada extra.", custo: 0, estado: null, conserto: 0 };
  if (soma <= 3) {
    if (d6 <= 3) return { titulo: "O carro quebra: câmbio ou motor", efeito: "O carro para. Guincho (disp. 2) ou meio dia perdido. Sem pagar, o carro fica quebrado.", custo: 4, estado: "quebrado", conserto: 3 };
    return { titulo: "O carro quebra: peça quebrada", efeito: "Correia, radiador, alternador. O carro anda, avariado, até consertar.", custo: 2, estado: "avariado", conserto: 2 };
  }
  if (d6 <= 2) return { titulo: "Pneu furado", efeito: "O estepe resolve na hora. O próximo furo pede guincho, carona ou borracheiro.", custo: 1, estado: null, conserto: 1 };
  if (d6 <= 4) return { titulo: "Sem bateria", efeito: "O carro não pega. Chupeta de outro carro ou empurrar (Força Bruta, 2 sucessos em grupo).", custo: 1, estado: null, conserto: 1 };
  return { titulo: "Sem gasolina", efeito: "O tanque seca no meio do nada. Alguém anda até o posto (uma cena, teste de Vigor à noite).", custo: 1, estado: null, conserto: 0 };
}

export const PERSEGUICAO = { 3: "Curta (3)", 5: "Média (5)", 7: "Longa (7)" };

/** Melhorias do QG (Cap. 7). */
export const MELHORIAS = {
  // Instalações
  arquivo: { tipo: "instalacao", label: "Arquivo do Veterano", pre: "Inicial", custo: 0, efeito: "+1 em Estudos ao pesquisar no QG." },
  arsenal: { tipo: "instalacao", label: "Arsenal", pre: "", custo: 2, efeito: "Cada PJ leva uma arma de disponibilidade até 2 de graça por caso." },
  biblioteca: { tipo: "instalacao", label: "Biblioteca oculta", pre: "arquivo", custo: 3, efeito: "+2 em Estudos no QG e +1 em Ocultismo. Uma vez por caso, uma pergunta sobre o Protocolo." },
  cela: { tipo: "instalacao", label: "Cela de contenção", pre: "quarto", custo: 3, efeito: "Prende uma criatura capturada para interrogar ou estudar." },
  enfermaria: { tipo: "instalacao", label: "Enfermaria", pre: "", custo: 2, efeito: "+2 em Medicina no QG. Permite forçar a recuperação física." },
  estande: { tipo: "instalacao", label: "Estande de tiro", pre: "arsenal", custo: 1, efeito: "Antes do caso, um PJ pode repetir uma Vantagem de Combate ou Pontaria." },
  estufa: { tipo: "instalacao", label: "Estufa de ervas", pre: "", custo: 1, efeito: "Ervas de defumação e antídotos simples de graça." },
  garagem: { tipo: "instalacao", label: "Garagem", pre: "", custo: 1, efeito: "Manutenção mensal −1. Consertos de viagem custam 1 a menos. Um carro reserva." },
  oficina: { tipo: "instalacao", label: "Oficina de munição", pre: "arsenal", custo: 2, efeito: "Um item de poder de disponibilidade até 3 de graça por caso." },
  quarto: { tipo: "instalacao", label: "Quarto do pânico com selos", pre: "arquivo", custo: 2, efeito: "Assombrações e Entidades não entram. Rolagens de ameaça ao QG têm −1 dado." },
  radio: { tipo: "instalacao", label: "Sala de rádio e servidores", pre: "", custo: 2, efeito: "+2 em Investigação online. Um gancho extra entre casos." },
  terapia: { tipo: "instalacao", label: "Sala de terapia ou capela", pre: "", custo: 2, efeito: "+2 em Vontade no QG. Permite forçar a recuperação mental." },
  // Contatos
  advogado: { tipo: "contato", label: "Advogado", pre: "Recursos 4", custo: 2, efeito: "Encerra um problema legal entre casos." },
  atravessador: { tipo: "contato", label: "Atravessador de relíquias", pre: "Recursos 3", custo: 2, efeito: "Compra e vende objetos amaldiçoados. +1 em compras de itens de poder." },
  hacker: { tipo: "contato", label: "Hacker", pre: "", custo: 2, efeito: "Documentos e distintivos falsos de graça. +2 em Investigação digital." },
  jornalista: { tipo: "contato", label: "Jornalista", pre: "", custo: 1, efeito: "Abafa ou espalha uma notícia uma vez por caso." },
  legista: { tipo: "contato", label: "Legista", pre: "", custo: 1, efeito: "Acesso a corpos e laudos sem teste." },
  medico: { tipo: "contato", label: "Médico clandestino", pre: "", custo: 2, efeito: "Serviço de cura sem rolar Recursos e sem perguntas." },
  outroGrupo: { tipo: "contato", label: "Outro grupo de Caçadores", pre: "", custo: 2, efeito: "Uma vez por campanha, chegam como reforço em um confronto." },
  padre: { tipo: "contato", label: "Padre ou exorcista", pre: "", custo: 2, efeito: "Água benta de graça. Pode conduzir um rito com o grupo." },
  policial: { tipo: "contato", label: "Policial amigo", pre: "", custo: 1, efeito: "Uma vez por caso, tira um PJ da cadeia ou libera um arquivo." },
  veterano: { tipo: "contato", label: "O Veterano", pre: "Inicial", custo: 0, efeito: "Uma vez por caso, um conselho por telefone: o Narrador confirma ou desmente uma teoria." },
  // Pessoal
  cozinheira: { tipo: "pessoal", label: "Cozinheira", pre: "", custo: 1, efeito: "Atividades de cura no QG curam 3 condições." },
  mecanico: { tipo: "pessoal", label: "Mecânico", pre: "garagem", custo: 1, efeito: "+1 na rolagem de viagem. Veículos do grupo dão +1 extra em Pilotagem." },
  pesquisador: { tipo: "pessoal", label: "Pesquisador", pre: "arquivo", custo: 2, efeito: "Enquanto vocês viajam, rola Estudos com 6 dados e liga com o que achou." },
  recruta: { tipo: "pessoal", label: "Recruta", pre: "", custo: 2, efeito: "Um novo Caçador aprendiz. Vira PJ se alguém morrer." },
  sentinela: { tipo: "pessoal", label: "Sentinela", pre: "", custo: 1, efeito: "−1 dado nas rolagens de ameaça ao QG." }
};

export const TIPOS_MELHORIA = { instalacao: "Instalações", contato: "Contatos", pessoal: "Pessoal" };

export const PERGUNTAS_DESENVOLVIMENTO = [
  "Jogaram ao menos uma cena no QG?",
  "Enfrentaram um tipo novo de criatura?",
  "Salvaram alguém que estava condenado?",
  "Trouxeram um livro, objeto ou prova importante?",
  "Fizeram um contato importante?",
  "O caso foi particularmente difícil?",
  "Resolveram o caso?",
  "Ninguém de fora descobriu a verdade sobre vocês?"
];

export const EXEMPLOS_AMEACA = [
  "Policial convencido de que há tráfico no QG", "Agente federal de verdade investigando os distintivos falsos", "Vizinho que filmou algo e postou",
  "Parente que quer internar um PJ", "Criatura sobrevivente de um caso antigo, em busca de vingança", "Entidade que marcou o QG como alvo",
  "Caçador rival que acha que um PJ virou monstro", "Facção que quer o Arquivo", "Ladrões atrás do arsenal", "Dívida antiga do Veterano cobrada agora",
  "Culto que vê o grupo como inimigo", "Assombração que despertou no próprio QG", "Youtuber caçador de fantasmas que não larga do pé",
  "Ex-parceiro de um PJ que reaparece pedindo ajuda"
];

export const VETERANOS = [
  "O ferro-velho: Seu Antero, 71, ex-caminhoneiro",
  "A professora: Dona Ilda, 68, historiadora aposentada",
  "O padre exilado: Padre Vicente, 66",
  "A delegada aposentada: Doutora Celeste, 63",
  "O locutor da madrugada: Zé Lúcio, 59, dono de uma rádio pirata",
  "A benzedeira de estrada: Mãe Dita, 80"
];
