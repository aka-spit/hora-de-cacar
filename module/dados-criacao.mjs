/** Dados da criação de personagem (Cap. 2), extraídos da ficha HTML do livro. */
export const OCUPACOES = [
 {
  "nome": "Cientista",
  "frase": "Tem uma explicação. Ela só não está nos livros ainda.",
  "desc": "Bióloga, físico, engenheira, técnico de laboratório. Alguém que mede, testa e anota, e que um dia mediu algo que não devia existir. Trata o sobrenatural como um fenômeno a ser entendido, o que às vezes salva o grupo e às vezes coloca todos em perigo.",
  "atributo": "raciocinio",
  "pericia": "investigacao",
  "rmin": 3,
  "rmax": 5,
  "equip": [
   "kit forense",
   "notebook",
   "medidor eletromagnético caseiro"
  ],
  "tabelas": {
   "Motivação": [
    "Provar que existe explicação para tudo.",
    "Publicar a descoberta do século, um dia.",
    "Redimir um experimento que matou alguém.",
    "Entender a própria cicatriz, que brilha no escuro.",
    "Construir a máquina que separa os vivos dos mortos.",
    "Salvar a orientadora, que ainda está \"do outro lado\"."
   ],
   "Primeiro Contato": [
    "Um cadáver se mexeu na mesa do laboratório.",
    "Perdeu a equipe em um acidente impossível em uma mina.",
    "Foi cobaia de um estudo sem saber.",
    "O sismógrafo registrou passos debaixo da cidade.",
    "Uma gravação de rotina captou uma voz pedindo socorro.",
    "Viu uma amostra de sangue se mover sozinha na lâmina."
   ],
   "Segredo sombrio": [
    "Guarda uma amostra que devia ter sido destruída.",
    "Falsificou dados para conseguir financiamento.",
    "Trabalha, sem saber, para uma facção.",
    "Testou algo perigoso em si mesmo e não para de funcionar.",
    "Vendeu um protótipo ao SOE.",
    "Causou o acidente que matou a equipe."
   ],
   "Relacionamentos": [
    "\"Seus métodos me assustam.\"",
    "\"Preciso dos seus dados (informações).\"",
    "\"Você é a prova viva.\"",
    "\"Explica de novo, devagar.\"",
    "\"Eu confio mais em você do que nos meus instrumentos.\"",
    "\"Um dia eu vou te entender.\""
   ]
  },
  "especialidades": [
   {
    "nome": "Cético",
    "desc": "Não acredita em nada até medir, e isso protege a cabeça.",
    "talentos": [
     {
      "nome": "Cético Teimoso",
      "desc": "Uma vez por sessão, repita um teste de Medo que falhou, sem custo (não é forçar). Vale o segundo resultado."
     },
     {
      "nome": "Explicação Racional",
      "desc": "+2 em Persuadir para convencer testemunhas de que houve algo comum (gás, animal, surto)."
     }
    ]
   },
   {
    "nome": "Pesquisador de laboratório",
    "desc": "Analisa amostras e fabrica o que a lenda pede.",
    "talentos": [
     {
      "nome": "Gambiarra de Laboratório",
      "desc": "Uma vez por caso, com uma cena de trabalho, faz um item de poder simples (bala de prata, granada de sal) sem teste nem Recursos."
     },
     {
      "nome": "Método",
      "desc": "+2 em Investigação ao analisar amostras, resíduos ou restos de uma criatura."
     }
    ]
   },
   {
    "nome": "Técnico",
    "desc": "Monta aparelhos, desmonta sistemas, escuta o que os fios dizem.",
    "talentos": [
     {
      "nome": "Detector Caseiro",
      "desc": "Com uma cena de trabalho, monta um aparelho que dá +2 em Percepção para detectar Assombrações e Entidades em um local, até o fim do caso."
     },
     {
      "nome": "Engenharia Reversa",
      "desc": "+2 em Manufatura ou Investigação com máquinas, sistemas e fechaduras eletrônicas."
     }
    ]
   }
  ]
 },
 {
  "nome": "Comunicador",
  "frase": "Se ninguém contar, é como se não tivesse acontecido.",
  "desc": "Jornalista de cidade pequena, repórter policial, dono de canal na internet, locutor de rádio de madrugada. Vive de fazer as pessoas falarem e de contar histórias. Agora carrega a maior história do mundo e não pode publicar uma linha.",
  "atributo": "empatia",
  "pericia": "persuadir",
  "rmin": 2,
  "rmax": 5,
  "equip": [
   "câmera",
   "gravador",
   "crachá de imprensa",
   "notebook"
  ],
  "tabelas": {
   "Motivação": [
    "Expor a verdade, mesmo que ninguém acredite.",
    "Recuperar a credibilidade perdida.",
    "Dar voz a quem ninguém ouve.",
    "Achar a fonte que sumiu no meio de uma entrevista.",
    "Escrever o livro que vai ser publicado depois da sua morte.",
    "Ganhar seguidores, e depois se arrepender disso."
   ],
   "Primeiro Contato": [
    "Filmou algo que foi cortado da edição.",
    "Uma fonte desapareceu na sua frente.",
    "Uma live terminou em grito e o vídeo sumiu da rede.",
    "Um ouvinte ligou para a rádio de dentro de um caixão.",
    "Cobriu um \"ataque de animal\" e viu o animal ficar de pé.",
    "Recebeu por correio uma fita com a própria voz, de antes de nascer."
   ],
   "Segredo sombrio": [
    "Inventou uma fonte em uma matéria famosa.",
    "Recebe pautas de uma facção.",
    "Vazou algo de outro Caçador em troca de acesso.",
    "Ganha dinheiro vendendo vídeos de criaturas.",
    "A fonte que sumiu foi entregue por ele.",
    "Ainda manda cópias de tudo para um editor que não existe mais."
   ],
   "Relacionamentos": [
    "\"Você é minha melhor história.\"",
    "\"Não vou te expor. Prometo.\"",
    "\"Você fala demais.\"",
    "\"Fica longe da câmera.\"",
    "\"Eu escuto você melhor do que ninguém.\"",
    "\"Um dia o mundo vai saber o que você fez.\""
   ]
  },
  "especialidades": [
   {
    "nome": "Criador de conteúdo",
    "desc": "Tem público, celular sempre carregado e nenhum juízo.",
    "talentos": [
     {
      "nome": "Público",
      "desc": "Uma vez por caso, pede ajuda aos seguidores. O Narrador entrega uma pista periférica."
     },
     {
      "nome": "Viral",
      "desc": "Uma vez por caso, publica algo que muda a reação da cidade. O Narrador decide o efeito colateral, e o SOE costuma notar."
     }
    ]
   },
   {
    "nome": "Locutor",
    "desc": "Uma voz conhecida na madrugada, que acalma e escuta.",
    "talentos": [
     {
      "nome": "Entrevistador",
      "desc": "+2 em Percepção para notar mentira em uma conversa."
     },
     {
      "nome": "Voz que Acalma",
      "desc": "+2 em Persuadir para acalmar alguém em pânico. Uma vez por sessão, numa cena curta de conversa, cura uma condição mental de outra pessoa."
     }
    ]
   },
   {
    "nome": "Repórter",
    "desc": "Fuça arquivos, cruza nomes e entra onde chega com crachá.",
    "talentos": [
     {
      "nome": "Credencial",
      "desc": "+2 em Persuadir para conseguir acesso como imprensa ou autoridade."
     },
     {
      "nome": "Faro de Notícia",
      "desc": "+2 em Investigação ao pesquisar jornais, redes e registros públicos."
     }
    ]
   }
  ]
 },
 {
  "nome": "Criminoso",
  "frase": "Eu sei abrir qualquer porta. O problema é o que está do outro lado.",
  "desc": "Ladrão, golpista, motorista de fuga, gente do submundo. Sabe entrar onde não foi chamado e sair antes da polícia chegar. Para os Caçadores isso vale ouro, porque metade de uma caçada é invasão de propriedade.",
  "atributo": "agilidade",
  "pericia": "subterfugio",
  "rmin": 1,
  "rmax": 4,
  "equip": [
   "kit de arrombamento",
   "documento falso",
   "revólver sem registro"
  ],
  "tabelas": {
   "Motivação": [
    "Sair da vida antes que ela o mate.",
    "Proteger o bairro onde cresceu.",
    "Entender por que as coisas o seguem desde aquela noite.",
    "Pagar a dívida com alguém que não é humano.",
    "Roubar de volta o que uma criatura tirou dele.",
    "Ser, pela primeira vez, do lado certo."
   ],
   "Primeiro Contato": [
    "Um assalto deu em uma casa errada.",
    "Viu o parceiro ser levado durante a fuga.",
    "Algo o tirou da cadeia em uma noite de apagão.",
    "Roubou um anel de um caixão e o dono veio buscar.",
    "O receptador pagou com dinheiro que virou folha seca.",
    "Na cela ao lado, alguém falava a língua dos mortos."
   ],
   "Segredo sombrio": [
    "Deve um favor a alguém perigoso.",
    "Sabe onde há um corpo enterrado.",
    "Já matou por dinheiro.",
    "Entregou um colega à polícia para se salvar.",
    "Ainda trabalha para a Feira, de vez em quando.",
    "O nome dele é falso. O verdadeiro está riscado em um diário."
   ],
   "Relacionamentos": [
    "\"Uma mão lava a outra.\"",
    "\"Você é certinho demais.\"",
    "\"Você é o primeiro em quem confio.\"",
    "\"Nunca deixo você ver onde guardo o dinheiro.\"",
    "\"Eu sei o que você fez e não vou contar.\"",
    "\"Se der errado, eu te tiro de lá.\""
   ]
  },
  "especialidades": [
   {
    "nome": "Do submundo",
    "desc": "Conhece quem vende, quem compra e quem some com corpos.",
    "talentos": [
     {
      "nome": "Contatos no Submundo",
      "desc": "Uma vez por caso, consegue um item ilegal (disp. até 3) sem rolar Recursos. Você fica devendo um favor."
     },
     {
      "nome": "Fuga Planejada",
      "desc": "+2 em Pilotagem ou Atletismo para fugir da polícia ou de uma cena."
     }
    ]
   },
   {
    "nome": "Golpista",
    "desc": "Mente melhor do que fala a verdade, e sabe quando alguém mente.",
    "talentos": [
     {
      "nome": "Cara de Pau",
      "desc": "Uma vez por sessão, quando você falha num teste de Persuadir para manter uma fachada, role o teste inteiro de novo com +2. Isso não é forçar e não custa condição."
     },
     {
      "nome": "Ler um Golpe",
      "desc": "+2 em Percepção para notar mentira, armadilha ou golpe."
     }
    ]
   },
   {
    "nome": "Ladrão",
    "desc": "Mãos leves, ouvido atento e respeito por fechaduras.",
    "talentos": [
     {
      "nome": "Arrombador",
      "desc": "Abre fechaduras comuns sem teste e ganha +2 em Subterfúgio nas fechaduras Desafiadoras ou Difíceis."
     },
     {
      "nome": "Mãos Leves",
      "desc": "+2 em Subterfúgio para furtar, esconder ou plantar algo."
     }
    ]
   }
  ]
 },
 {
  "nome": "Estudioso",
  "frase": "Toda lenda já foi uma notícia e elas trazem a verdade.",
  "desc": "Professora de história, bibliotecário, antropóloga, ocultista amador, padre que estudou demais. Sabe onde procurar e entende o que encontra. Em um grupo de Caçadores, é quem descobre o Protocolo enquanto os outros seguram a porta.",
  "atributo": "raciocinio",
  "pericia": "estudos",
  "rmin": 3,
  "rmax": 5,
  "equip": [
   "livros raros",
   "notebook",
   "giz e sal",
   "lanterna"
  ],
  "tabelas": {
   "Motivação": [
    "Provar que a lenda é real.",
    "Decifrar o mistério de um antepassado.",
    "Conhecimento proibido, só por saber.",
    "Reconstruir a biblioteca da Vigília, livro por livro.",
    "Achar o livro que pode desfazer o que o mentor fez.",
    "Escrever o bestiário definitivo."
   ],
   "Primeiro Contato": [
    "Leu em voz alta o livro errado.",
    "Algo saiu de uma escavação arqueológica.",
    "O mentor morreu pesquisando, e a pesquisa continuou sozinha.",
    "Achou o próprio nome em um registro de 1790.",
    "Um aluno trouxe para a aula um objeto que gritava.",
    "Traduziu uma inscrição e as luzes da cidade apagaram."
   ],
   "Segredo sombrio": [
    "Guarda um livro que não devia existir.",
    "Vende informação a uma facção.",
    "Alterou um registro por medo.",
    "Conversa à noite com algo que mora nas margens do livro.",
    "Plagiou a tese de um Caçador morto.",
    "Sabe o nome verdadeiro de uma Entidade e nunca disse."
   ],
   "Relacionamentos": [
    "\"Você não lê nada.\"",
    "\"Minha discípula.\"",
    "\"Você me protege, eu te explico.\"",
    "\"Você sabe mais do que admite.\"",
    "\"Me deixa terminar a frase.\"",
    "\"Sem você, eu já teria lido a página errada.\""
   ]
  },
  "especialidades": [
   {
    "nome": "Arquivista",
    "desc": "Vive entre caixas, microfilmes e livros de tombo.",
    "talentos": [
     {
      "nome": "Pesquisa Cruzada",
      "desc": "Uma vez por caso, liga dois fatos que ninguém tinha ligado. O Narrador diz onde está a próxima pista importante."
     },
     {
      "nome": "Rato de Arquivo",
      "desc": "+2 em Estudos com acesso a biblioteca, arquivo ou internet."
     }
    ]
   },
   {
    "nome": "Folclorista",
    "desc": "Coleciona causos, cantigas e simpatias de beira de estrada.",
    "talentos": [
     {
      "nome": "Línguas Mortas",
      "desc": "Conhece latim, grego antigo e hebraico antigo e lê cifras ocultistas sem teste. Ganha +2 para decifrar símbolos."
     },
     {
      "nome": "Ouvido de Folclorista",
      "desc": "+2 em Cultura com moradores antigos, benzedeiras e contadores de causo. Eles sempre contam uma lenda local."
     }
    ]
   },
   {
    "nome": "Ocultista",
    "desc": "Lê grimórios, desenha círculos e sabe o preço de cada palavra.",
    "talentos": [
     {
      "nome": "Erudição Oculta",
      "desc": "Uma vez por caso, pergunte ao Narrador uma fraqueza, um hábito ou parte do Protocolo. A resposta é verdadeira, talvez incompleta."
     },
     {
      "nome": "Ritualista",
      "desc": "Conhece dois ritos simples. Uma vez por sessão, conduz um rito simples sem custo. +2 em Ocultismo em ritos sob pressão."
     }
    ]
   }
  ]
 },
 {
  "nome": "Herdeiro da Vigília",
  "frase": "Eu não escolhi isso. Eu nasci no banco de trás de um carro cheio de sal.",
  "desc": "Filho, neto ou sobrinho de Caçadores, criado entre hotéis e estradas, aprendeu a carregar uma escopeta antes de aprender a dirigir. Sabe mais de monstros do que da vida comum, e isso pesa. Não sabe pagar um boleto, mas sabe exatamente quantas noites um vampiro leva para voltar sem a cabeça.",
  "atributo": "forca",
  "pericia": "combate",
  "rmin": 1,
  "rmax": 3,
  "equip": [
   "escopeta com cartuchos de sal",
   "facão",
   "diário de caça da família",
   "carro velho"
  ],
  "tabelas": {
   "Motivação": [
    "Vingar a mãe, morta por algo que nunca foi encontrado.",
    "Achar o pai, que saiu para um caso e não voltou.",
    "É a única vida que conhece. Parar seria morrer de outro jeito.",
    "Provar que é melhor caçador do que o irmão mais velho.",
    "Terminar o último caso que a família deixou aberto.",
    "Ganhar o direito de largar tudo, um dia, com a consciência limpa."
   ],
   "Primeiro Contato": [
    "Viu a casa queimar com alguém preso no teto.",
    "Foi criado em um hotel diferente por semana, sempre fugindo de algo.",
    "Matou o primeiro monstro aos doze anos, com a arma do pai.",
    "Acordou uma noite e a babá estava andando pelo teto.",
    "Encontrou o diário da família escondido em um fundo falso e leu tudo em uma noite.",
    "Ficou trancado em um carro enquanto algo arranhava os vidros até amanhecer."
   ],
   "Segredo sombrio": [
    "Fez um pacto que vence em breve.",
    "Sabe que o pai fez coisas terríveis em nome da caça.",
    "Algo o procura pelo sangue da família.",
    "Deixou um irmão para trás em um caso e diz que ele morreu.",
    "Tem uma criatura como amiga de infância e nunca a caçou.",
    "Já riscou o nome de um Caçador inocente."
   ],
   "Relacionamentos": [
    "\"Você é meu irmão, querendo ou não.\"",
    "\"Amador. Mas tem coragem.\"",
    "\"Eu te devo a vida e odeio isso.\"",
    "\"Você me lembra quem eu poderia ter sido.\"",
    "\"Não conte nada para o meu pai.\"",
    "\"Vou te ensinar a não morrer.\""
   ]
  },
  "especialidades": [
   {
    "nome": "Caçador de estrada",
    "desc": "Cresceu de caso em caso, lendo vítimas como outros leem jornal.",
    "talentos": [
     {
      "nome": "Arsenal no Porta-malas",
      "desc": "Uma vez por caso, a arma comum ou o item de poder que a cena pede (disp. até 2) está no seu carro."
     },
     {
      "nome": "Criado na Estrada",
      "desc": "+2 em Ocultismo para identificar uma criatura pelas vítimas, rastros ou sinais."
     }
    ]
   },
   {
    "nome": "Guardião da família",
    "desc": "Carrega o nome, o diário e as dívidas de quem veio antes.",
    "talentos": [
     {
      "nome": "Diário de Família",
      "desc": "Uma vez por caso, o diário herdado tem uma entrada sobre a criatura. Ganhe uma pista de \"o diário sabe\" sem rolar."
     },
     {
      "nome": "Senha Antiga",
      "desc": "+2 em Persuadir com Remanescentes e Caçadores da Rede. Uma vez por caso, um Remanescente atende sua ligação."
     }
    ]
   },
   {
    "nome": "Rastreador",
    "desc": "Segue sangue, pegada e cheiro até a toca da coisa.",
    "talentos": [
     {
      "nome": "Faro de Sangue",
      "desc": "+2 em Investigação para seguir o rastro de uma criatura até o covil."
     },
     {
      "nome": "Instinto de Caça",
      "desc": "+2 em Percepção para notar uma criatura escondida ou uma emboscada."
     }
    ]
   }
  ]
 },
 {
  "nome": "Médico",
  "frase": "Já vi gente morrer de coisa mais simples. Fica parado.",
  "desc": "Médica de pronto-socorro, enfermeiro, paramédico, legista. Alguém que já viu a morte de perto muitas vezes e aprendeu a não tremer. Na estrada, é quem mantém o grupo vivo e quem sabe quanto tempo um amigo ainda tem.",
  "atributo": "raciocinio",
  "pericia": "medicina",
  "rmin": 4,
  "rmax": 6,
  "equip": [
   "maleta médica",
   "sedativos",
   "crachá de hospital"
  ],
  "tabelas": {
   "Motivação": [
    "Salvar quem os outros desistiram de salvar.",
    "Entender uma doença sem nome.",
    "Compensar uma negligência.",
    "Achar a cura para a mordida que leva no braço.",
    "Garantir que nenhum Caçador morra sem atendimento.",
    "Descobrir o que levanta os mortos do necrotério."
   ],
   "Primeiro Contato": [
    "Um paciente voltou depois do óbito.",
    "Operou algo que não era humano.",
    "Fez plantão em uma noite de massacre.",
    "O raio-x de uma criança mostrou outra criança dentro.",
    "Um corpo no necrotério sussurrou o nome dele.",
    "Atendeu um acidente em que o motorista não tinha sombra."
   ],
   "Segredo sombrio": [
    "Falsificou um atestado de óbito.",
    "Trata Caçadores sem registro.",
    "Desvia remédios controlados.",
    "Deixou um paciente morrer porque sentiu medo dele.",
    "Guarda órgãos que não são humanos em um freezer.",
    "É viciado no sedativo que carrega."
   ],
   "Relacionamentos": [
    "\"Pare de levar tiro.\"",
    "\"Confio meus segredos a você.\"",
    "\"Você vai morrer cedo.\"",
    "\"Deixa eu ver esse corte.\"",
    "\"Você me lembra um paciente que eu perdi.\"",
    "\"Eu costuro, você para de reclamar.\""
   ]
  },
  "especialidades": [
   {
    "nome": "Legista",
    "desc": "Faz os mortos contarem como morreram.",
    "talentos": [
     {
      "nome": "Legista",
      "desc": "+2 em Investigação ao examinar um corpo. Você sempre descobre a causa real da morte."
     },
     {
      "nome": "Leitor de Cicatrizes",
      "desc": "+2 em Percepção ao examinar alguém vivo, como mordidas, sinais de possessão e febres que não são febre."
     }
    ]
   },
   {
    "nome": "Plantonista",
    "desc": "Conhece o hospital por dentro e não dorme há anos.",
    "talentos": [
     {
      "nome": "Acesso ao Hospital",
      "desc": "Uma vez por caso, consegue prontuários, remédios controlados ou um leito sem perguntas."
     },
     {
      "nome": "Noites em Claro",
      "desc": "Você passa automaticamente nos testes de Vigor por falta de sono (Cap. 5). Uma vez por sessão, ignore as condições físicas num teste de Medicina."
     }
    ]
   },
   {
    "nome": "Socorrista",
    "desc": "Trabalha no chão, no escuro, com o paciente gritando.",
    "talentos": [
     {
      "nome": "Mãos Firmes",
      "desc": "Tratar um ferimento crítico em combate é uma ação rápida para você."
     },
     {
      "nome": "Médico de Campo",
      "desc": "+2 em Medicina para tratar alguém Quebrado ou com ferimento crítico."
     }
    ]
   }
  ]
 },
 {
  "nome": "Oficial",
  "frase": "Eu jurei proteger essa gente. Ninguém disse de quê.",
  "desc": "Policial, militar, segurança, bombeiro. Alguém treinado para correr na direção do perigo. Muitos Oficiais viraram Caçadores depois de um relatório que ninguém quis ler e carregam a raiva de quem foi calado.",
  "atributo": "agilidade",
  "pericia": "pontaria",
  "rmin": 3,
  "rmax": 5,
  "equip": [
   "pistola",
   "colete balístico",
   "distintivo",
   "rádio"
  ],
  "tabelas": {
   "Motivação": [
    "Proteger a cidade, mesmo sem farda.",
    "Consertar um erro em serviço.",
    "Entender por que só ele sobreviveu.",
    "Fazer justiça onde a lei não alcança.",
    "Encontrar o parceiro desaparecido.",
    "Provar que o relatório rasgado era verdade."
   ],
   "Primeiro Contato": [
    "O parceiro foi morto por algo que não sangrava.",
    "Foi silenciado depois de um relatório.",
    "Viu mortos levantarem em um campo de treinamento.",
    "Atendeu uma chamada de uma casa que estava vazia havia vinte anos.",
    "O incêndio que combatia tinha um rosto.",
    "Um preso fugiu atravessando a parede."
   ],
   "Segredo sombrio": [
    "Encobriu um superior.",
    "Aceitou suborno.",
    "Atirou em um inocente e a perícia não viu.",
    "Ainda passa informações à antiga corporação.",
    "Foi expulso, e o distintivo é falso.",
    "Viu o SOE matar civis e ficou calado."
   ],
   "Relacionamentos": [
    "\"Protejo você a qualquer custo.\"",
    "\"Minha líder.\"",
    "\"Desconfio de você.\"",
    "\"Você não segue ordens.\"",
    "\"Eu cubro, você entra.\"",
    "\"Ainda acho que você devia estar preso.\""
   ]
  },
  "especialidades": [
   {
    "nome": "Militar",
    "desc": "Já viu guerra, e a guerra ensina a não congelar.",
    "talentos": [
     {
      "nome": "Treinamento Tático",
      "desc": "No início de um combate, troque sua carta de iniciativa com a de um aliado."
     },
     {
      "nome": "Veterano",
      "desc": "Cadáveres e violência humana não exigem teste de Medo de você."
     }
    ]
   },
   {
    "nome": "Policial",
    "desc": "Tem distintivo, voz de comando e faro para mentira.",
    "talentos": [
     {
      "nome": "Distintivo",
      "desc": "+2 em Persuadir ao dar ordens ou se identificar como autoridade, real ou falsa."
     },
     {
      "nome": "Interrogador",
      "desc": "+2 em Persuadir para interrogar um suspeito ou prisioneiro."
     }
    ]
   },
   {
    "nome": "Segurança",
    "desc": "Fica na porta, olha para todos e protege quem não pode lutar.",
    "talentos": [
     {
      "nome": "Escudo dos Inocentes",
      "desc": "+2 em Atletismo ou Força Bruta para tirar um inocente do perigo."
     },
     {
      "nome": "Olhos Abertos",
      "desc": "+2 em Percepção para notar ameaças humanas. Humanos nunca pegam você de emboscada."
     }
    ]
   }
  ]
 },
 {
  "nome": "Religioso",
  "frase": "Eu não sei o que existe do lado de lá. Mas sei que existe um lado de lá.",
  "desc": "Sacerdote, pastora, ministro leigo, benzedeira, rezador. Alguém que lida com a fé dos outros todo dia e encontrou o sobrenatural onde menos esperava. A fé pode ser firme ou estar em pedaços. De um jeito ou de outro, ela é uma arma contra o que se alimenta de culpa e de medo.",
  "atributo": "empatia",
  "pericia": "vontade",
  "rmin": 2,
  "rmax": 4,
  "equip": [
   "água benta",
   "livro de ritos",
   "símbolo sagrado",
   "ramos de arruda e alecrim"
  ],
  "tabelas": {
   "Motivação": [
    "Cumprir uma missão que recebeu em sonho.",
    "Purificar a própria alma.",
    "Entender a criação, inteira.",
    "Libertar os mortos presos que ninguém escuta.",
    "Reconquistar a fé perdida.",
    "Proteger a comunidade que abandonou."
   ],
   "Primeiro Contato": [
    "Falhou em um exorcismo, e a criança morreu.",
    "Viu a comunidade inteira sonhar o mesmo sonho.",
    "Ouviu uma voz em uma confissão.",
    "A imagem da igreja chorou sangue durante a missa.",
    "Benzeu uma criança e o mau-olhado passou para ele.",
    "Enterrou um homem que bateu na tampa do caixão."
   ],
   "Segredo sombrio": [
    "A voz ainda fala com ele.",
    "Perdeu a fé e finge.",
    "Quebrou um voto grave.",
    "Fez um pacto pequeno para salvar alguém.",
    "Expulsou uma Entidade e ela entrou na irmã dele.",
    "Usa o dinheiro do dízimo para comprar armas."
   ],
   "Relacionamentos": [
    "\"Rezo por você.\"",
    "\"Você ainda tem salvação.\"",
    "\"Sou melhor que você, e me envergonho disso.\"",
    "\"Você é o filho que eu não tive.\"",
    "\"Não precisa acreditar para eu te proteger.\"",
    "\"Confesse, que eu escuto.\""
   ]
  },
  "especialidades": [
   {
    "nome": "Benzedor",
    "desc": "Reza com ramo de arruda e sabe o que cada erva faz.",
    "talentos": [
     {
      "nome": "Benzedura",
      "desc": "Uma vez por sessão, numa cena de reza, cura duas condições de outra pessoa. Conhece Benzedura e Bênção do caminho."
     },
     {
      "nome": "Saber de Quintal",
      "desc": "+2 em Ocultismo com simpatias e ervas. Uma vez por caso, faz um patuá sem custo. Conhece Defumação da casa e Sono guardado."
     }
    ]
   },
   {
    "nome": "Exorcista",
    "desc": "Enfrenta o que mora nos corpos dos outros.",
    "talentos": [
     {
      "nome": "Exorcista",
      "desc": "Ritos de Protocolo levam metade do tempo. +2 em Vontade contra possessão. Conhece Expulsão e Fechar o corpo."
     },
     {
      "nome": "Palavra de Fé",
      "desc": "Uma vez por sessão (ação lenta), Entidades que temem a fé na sua zona perdem a próxima ação e recuam uma zona, sem teste."
     }
    ]
   },
   {
    "nome": "Sacerdote",
    "desc": "Abençoa, escuta confissões e guarda o que ouve.",
    "talentos": [
     {
      "nome": "Bênção",
      "desc": "Uma vez por sessão, antes da rolagem, abençoa um aliado na mesma zona, que recebe +2 num teste."
     },
     {
      "nome": "Confissão",
      "desc": "Quando alguém se confessa a você em uma cena, um PNJ revela um segredo ou um PJ cura todas as condições mentais (uma vez por sessão)."
     }
    ]
   }
  ]
 },
 {
  "nome": "Sensitivo",
  "frase": "Eles falam comigo. Nem sempre eu quero ouvir.",
  "desc": "Médium de feira, cartomante, criança que via gente no quarto e cresceu, vidente que fingia até o dia em que não precisou mais fingir. O Sensitivo sente o que os outros não sentem e paga caro por isso, com noites mal dormidas e visitas que ninguém convidou.",
  "atributo": "empatia",
  "pericia": "percepcao",
  "rmin": 1,
  "rmax": 4,
  "equip": [
   "baralho",
   "pêndulo",
   "ervas de defumação",
   "caderno de sonhos"
  ],
  "tabelas": {
   "Motivação": [
    "Entender as visões antes que elas o enlouqueçam.",
    "Ajudar os mortos a partir.",
    "Ganhar dinheiro com o dom.",
    "Encontrar quem o chama em sonho.",
    "Controlar o dom, ou se livrar dele.",
    "Proteger outra criança que vê o que ele via."
   ],
   "Primeiro Contato": [
    "Uma sessão espírita deu errado.",
    "Sonhou com uma morte e ela aconteceu.",
    "Algo respondeu de verdade em uma leitura falsa.",
    "Via, desde os cinco anos, um homem sentado no pé da cama.",
    "Tocou o anel de uma cliente e viu o assassinato dela.",
    "Morreu por dois minutos em uma cirurgia e voltou acompanhado."
   ],
   "Segredo sombrio": [
    "Finge visões para clientes.",
    "Algo o visita à noite.",
    "Previu a própria morte, e a data está perto.",
    "Viu a morte de um companheiro de grupo e não contou.",
    "Deixa uma Assombração morar no próprio corpo.",
    "O dom vem de um pacto da avó."
   ],
   "Relacionamentos": [
    "\"Eu vi você no meu sonho.\"",
    "\"Você não acredita em mim.\"",
    "\"Você me traz paz.\"",
    "\"Tem alguém atrás de você o tempo todo.\"",
    "\"Não me toque, por favor.\"",
    "\"Eu sei como você morre, e vou impedir.\""
   ]
  },
  "especialidades": [
   {
    "nome": "Charlatão arrependido",
    "desc": "Fingia o dom para clientes até ele aparecer de verdade.",
    "talentos": [
     {
      "nome": "Leitura Fria",
      "desc": "+2 em Persuadir para enganar ou acalmar alguém fingindo ler a mente dele."
     },
     {
      "nome": "Psicometria",
      "desc": "Toque um objeto e role Percepção: com sucesso, sente a emoção mais forte dele e vê o dono. Morte violenta: teste de Medo 1."
     }
    ]
   },
   {
    "nome": "Médium",
    "desc": "Empresta a voz para quem já morreu.",
    "talentos": [
     {
      "nome": "Canal",
      "desc": "Uma vez por sessão, uma Assombração presente fala pela sua boca por uma cena, com sinceridade. Você marca uma condição mental."
     },
     {
      "nome": "Médium",
      "desc": "Uma vez por caso, em transe, faça uma pergunta a um morto ou Assombração presente. A resposta vem em pedaços. Teste de Medo 1."
     }
    ]
   },
   {
    "nome": "Vidente",
    "desc": "Sonha o que vai acontecer, e às vezes o que já aconteceu.",
    "talentos": [
     {
      "nome": "Pressentimento",
      "desc": "+2 em Percepção para sentir presença sobrenatural ou perigo iminente."
     },
     {
      "nome": "Sonho Revelador",
      "desc": "Uma vez por caso, ao dormir, o Narrador mostra uma imagem verdadeira e fragmentada do Segredo ou do covil da criatura."
     }
    ]
   }
  ]
 },
 {
  "nome": "Trabalhador",
  "frase": "Alguém tem que consertar as coisas.   Hoje sou eu.",
  "desc": "Mecânico, caminhoneiro, frentista, faxineira, pedreiro, eletricista, vigia noturno. Gente que conhece as máquinas, as estradas e o peso das coisas. Não tem diploma de ocultismo, mas sabe trocar um pneu na chuva com um wendigo na mata, e isso vale mais.",
  "atributo": "forca",
  "pericia": "pilotagem",
  "rmin": 2,
  "rmax": 4,
  "equip": [
   "caminhonete",
   "caixa de ferramentas",
   "pé de cabra",
   "lanterna de cabeça"
  ],
  "tabelas": {
   "Motivação": [
    "Proteger a família.",
    "Pagar uma dívida que não para de crescer.",
    "Ninguém mais vai fazer.",
    "Descobrir o que levou o colega no turno da noite.",
    "Juntar dinheiro para sair dessa vida.",
    "Mostrar que gente simples também luta."
   ],
   "Primeiro Contato": [
    "Achou algo dentro de uma parede.",
    "O caminhão parou em uma estrada que não existe.",
    "Um colega sumiu no turno da noite.",
    "O elevador da obra desceu um andar a mais.",
    "Rebocou um carro com o motorista morto ao volante, dirigindo.",
    "Cavou uma vala e bateu em um caixão de ferro."
   ],
   "Segredo sombrio": [
    "Rouba peças do patrão.",
    "Abandonou um colega para morrer.",
    "Bebe em serviço.",
    "Transportou uma carga que não devia, e sabe o que era.",
    "Tem uma família em outra cidade.",
    "Fez a obra em cima do cemitério sabendo de tudo."
   ],
   "Relacionamentos": [
    "\"Deixa que eu conserto.\"",
    "\"Você pensa demais.\"",
    "\"Respeito mútuo.\"",
    "\"Você não sabe nem trocar um pneu.\"",
    "\"Eu carrego você se precisar.\"",
    "\"Me ensina a ler essas coisas?\""
   ]
  },
  "especialidades": [
   {
    "nome": "Atendente",
    "desc": "Balconista de posto, garçom de lanchonete de estrada, recepcionista de hotel. Vê todo mundo que passa.",
    "talentos": [
     {
      "nome": "Freguesia",
      "desc": "Uma vez por caso, um cliente fiel conta um boato (pista periférica) ou faz um pequeno favor."
     },
     {
      "nome": "Memória de Balcão",
      "desc": "+2 em Percepção para lembrar um rosto, um carro ou um pedido estranho, e quando passou por ali."
     }
    ]
   },
   {
    "nome": "Braçal",
    "desc": "Carrega, quebra, limpa e aguenta. Pedreiro, carregador, faxineiro, limpador de prédios e de cenas de crime.",
    "talentos": [
     {
      "nome": "Aguenta o Tranco",
      "desc": "Uma vez por sessão, ignore as penalidades de condições físicas em um teste."
     },
     {
      "nome": "Forte como Touro",
      "desc": "+2 em Força Bruta para erguer, arrombar ou segurar."
     }
    ]
   },
   {
    "nome": "Mecânico",
    "desc": "Conserta motor, rádio e gerador com arame e paciência.",
    "talentos": [
     {
      "nome": "Gambiarra no Motor",
      "desc": "Uma vez por caso, faz um veículo quebrado andar por mais uma cena."
     },
     {
      "nome": "Mãos de Mecânico",
      "desc": "Conserta veículos e aparelhos comuns em uma cena sem teste. Ganha +2 em Manufatura quando houver pressa."
     }
    ]
   }
  ]
 }
];

export const LEMBRANCAS = {
 "11": "Fita cassete com a voz de alguém",
 "12": "Foto Polaroid desbotada",
 "13": "Isqueiro com iniciais gravadas",
 "14": "Jaqueta grande demais, do pai",
 "15": "Dog tag de um soldado",
 "16": "Caderno com receitas da avó",
 "21": "Moeda de prata furada",
 "22": "Celular antigo sem chip",
 "23": "Bíblia com anotações na margem",
 "24": "Cachorro velho e leal",
 "25": "Anel de noivado devolvido",
 "26": "Fivela de cinto de rodeio",
 "31": "Fita de promessa amarrada no pulso",
 "32": "Boné de um time que não existe mais",
 "33": "Diário de alguém que morreu",
 "34": "Fita de vídeo sem etiqueta",
 "35": "Amuleto comprado numa feira",
 "36": "Partitura escrita à mão",
 "41": "Terço que não é seu",
 "42": "Relógio parado na hora do Primeiro Contato",
 "43": "Chaveiro de uma casa que não existe mais",
 "44": "Desenho de criança dobrado na carteira",
 "45": "Medalha esportiva da escola",
 "46": "Bilhete de loteria nunca conferido",
 "51": "Disco de vinil riscado",
 "52": "Primeiro distintivo, de outra vida",
 "53": "Pulseira de hospital com seu nome",
 "54": "Mapa rodoviário com rotas marcadas",
 "55": "Ursinho de pelúcia chamuscado",
 "56": "Carta de despedida nunca enviada",
 "61": "Canivete do avô",
 "62": "Recorte de jornal sobre o seu caso",
 "63": "Violão com uma corda faltando",
 "64": "Garrafa de uísque que nunca abre",
 "65": "Chave de carro antigo",
 "66": "Fotografia em que há alguém a mais"
};

export const IDIOMAS = ["Português", "Espanhol", "Inglês", "Francês", "Italiano", "Alemão", "Romeno", "Polonês", "Russo", "Árabe", "Hebraico moderno", "Hindi", "Mandarim", "Japonês", "Coreano", "Tagalo", "Iorubá", "Guarani", "Quíchua", "Crioulo haitiano"];

/** Equipamento inicial → nome do item no compêndio Arsenal. */
export const EQUIP_ARSENAL = {
 "revólver sem registro": "Revólver",
 "escopeta com cartuchos de sal": "Escopeta com sal",
 "facão": "Facão ou machadinha",
 "pistola": "Pistola",
 "pé de cabra": "Pé de cabra",
 "colete balístico": "Colete balístico",
 "caixa de ferramentas": "Caixa de ferramentas",
 "câmera": "Câmera",
 "kit forense": "Kit forense",
 "kit de arrombamento": "Kit de arrombamento",
 "lanterna de cabeça": "Lanterna de cabeça",
 "lanterna": "Lanterna tática",
 "maleta médica": "Maleta médica",
 "medidor eletromagnético caseiro": "Medidor eletromagnético",
 "notebook": "Notebook",
 "gravador": "Gravador digital",
 "distintivo": "Distintivo ou crachá falso",
 "rádio": "Rádio comunicador (par)",
 "água benta": "Água benta",
 "símbolo sagrado": "Símbolo sagrado",
 "ervas de defumação": "Alecrim, guiné, sálvia e outras ervas de defumação",
 "ramos de arruda e alecrim": "Arruda",
 "giz e sal": "Sal grosso",
 "crachá de imprensa": "Distintivo ou crachá falso",
 "crachá de hospital": "Jaleco e crachá"
};

/** Equipamentos iniciais que são itens de poder (Cap. 8). */
export const EQUIP_PODER = ["água benta", "giz e sal", "ervas de defumação", "ramos de arruda e alecrim", "símbolo sagrado"];
