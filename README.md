# Hora de Caçar — sistema para Foundry VTT

Versão 0.4.0 · Foundry VTT v13 (mínimo) e v14 (verificado) · Year Zero Engine

## Instalação pelo Foundry (link do manifesto)

1. No Foundry, aba **Game Systems** → **Install System**.
2. No campo **Manifest URL**, cole:
   `https://github.com/SEU-USUARIO/hora-de-cacar/releases/latest/download/system.json`
3. Clique em **Install**. Atualizações aparecem no botão **Update** da mesma aba.

## Instalação (manual)

1. Feche o Foundry.
2. Descompacte esta pasta em `Data/systems/hora-de-cacar` (o nome da pasta **tem** que ser `hora-de-cacar`, igual ao `id` do `system.json`).
   - Windows: `%localappdata%/FoundryVTT/Data/systems/`
   - macOS: `~/Library/Application Support/FoundryVTT/Data/systems/`
   - Linux: `~/.local/share/FoundryVTT/Data/systems/`
3. Confira que ficou `Data/systems/hora-de-cacar/system.json` (e não `hora-de-cacar/hora-de-cacar/system.json`).
4. Abra o Foundry → aba **Game Systems**: deve aparecer "Hora de Caçar 0.4.0".
5. **Game Worlds → Create World** → escolha o sistema **Hora de Caçar** → entre como Narrador.

## Teste rápido dentro do Foundry

1. Aperte **F12** e abra a aba **Console** (erros aparecem em vermelho com `hora-de-cacar`).
2. Crie uma macro do tipo **Script** com `game.horaDeCacar.autoteste();` e execute.
3. O chat mostra um relatório ✅/❌: cria Caçador, PNJ e Criatura, abre as fichas, testa condições, Quebrado, crítico, dano, Armadura/fraqueza e iniciativa por cartas.
4. Depois teste à mão: clique em uma perícia, role, clique em **Forçar**; arraste uma Pistola do compêndio Arsenal; marque um token como alvo e use **Aplicar dano**.

Para publicar no GitHub e gerar o manifesto, veja `GUIA-GITHUB.md`.

## Novidades da 0.2.0

- **Criação guiada** (os 10 passos da ficha HTML, sem o gerador aleatório): ocupação e especialidade, idade e nome, atributos (2–4, principal até 5), perícias (até 2, principal até 3) e Recursos, idiomas e talento, motivação e Primeiro Contato, segredo e relacionamentos, diário e lembrança, equipamento e revisão. Cada passo confere as regras do livro antes de avançar. No fim, preenche a ficha e traz o talento e o equipamento dos compêndios. Abre sozinha ao criar um Caçador em branco (dá para desligar nas configurações) ou pelo botão **Criação guiada** na ficha.
- **Cadeado na ficha**: trava atributos e perícias. A criação guiada já entrega a ficha trancada. Por padrão só o Narrador destrava (opção "Só o Narrador destrava fichas"). O bloqueio vale também para macros e outras janelas, não só para as bolinhas da ficha.
- **Year Zero Combat**: com o módulo ativo, o sistema deixa o combate com ele e o configura sozinho (Ferocidade = entradas na iniciativa, Reflexos = 2 cartas fica com a melhor, ordem crescente, ações lenta e rápida). Sem o módulo, continua valendo a iniciativa por cartas própria do sistema.

## O que já funciona

| Parte | O que faz |
|---|---|
| **Dossiê de Caçador** | Atributos e perícias com bolinhas, Recursos/Capital, condições físicas e mentais em ordem, Quebrado, Vantagem da Estrada, diário (Registrar/Desabafar), XP com as 8 perguntas, capacidade de carga, Defeitos/Revelações, ritos. Visual do Arquivo da Vigília. |
| **Rolagem Year Zero** | Clique em atributo/perícia → diálogo com dificuldade (1/2/3), ajuda (+1 a +3), Vantagem (+2), Registrar (+2), talentos/equipamentos/Revelações/Defeitos daquela perícia. Desconta condições do tipo do atributo, sempre rola pelo menos 1 dado. |
| **Forçar** | Botão no cartão do chat: rola de novo os dados que não deram 6, uma vez, e marca a condição do tipo do atributo *depois* da rolagem. Bloqueado se já estiver Quebrado naquele tipo. Botão "Sem condição" para Teimoso/Sortudo. |
| **Ataques** | Arma soma o bônus; dano = dano da arma + sucessos extras. Botão para aplicar dano aos alvos (Caçador → condições; PNJ → Resistência; criatura → Vida − Armadura, ou ignora com a fraqueza). Com 3+ sucessos, oferece Golpe crítico em criatura. |
| **Medo** | EMPATIA + Vontade + PJs presentes contra o Pavor. Na falha: botão aplica 1 condição mental e rola 1D3 rodadas de Aterrorizado. Sangue-Frio entra sozinho. |
| **Ferimentos críticos** | Ao passar da última caixa, fica Quebrado e rola D66 na tabela certa (física/mental), com prazo rolado e o Defeito/Revelação criado na ficha. Capacete re-rola críticos de cabeça. Talento Durão cria a 4ª caixa física. |
| **Iniciativa por cartas** | O rastreador de combate tira cartas de 1 a 10 (sem repetir até acabar o baralho), age do menor para o maior, PJ ganha empates. Criatura com Ferocidade N entra N vezes no combate. Reflexos de Quem Já Foi Emboscado tira duas e fica com a menor. |
| **PNJ** | Resistência física/mental (1 a 3) com trilha de dano e "fora da cena"; perícias escritas em texto ("Combate 6, Vigor 4") viram botões de rolagem. |
| **Criatura** | Caixa de atributos do livro (Ferocidade, Vida, Armadura, Pavor X/Y, AGILIDADE, PERCEPÇÃO, Intensidade), pistas em camadas, Protocolo, comportamento d6, 6 ataques característicos (físico, mental, Medo, Maldição, especial). Botão de ataque d6 que **nunca repete** o da rodada anterior. |
| **QG e Carro** | Fichas próprias: Melhorias com compra e ameaça secreta, Desenvolvimento, relógios de ameaça; carro com qualidade, estado, rolagem de viagem, Pilotagem com bônus, conserto e perseguição. |
| **Compêndios** | **Caçadores prontos** (10, um por ocupação) · **QG e Veículos** (Lanterna Azul e 13 carros) · **Talentos** (116: 60 de ocupação e 56 gerais) · **Arsenal do Caçador** (114: armas, proteções, rotina, vestuário, explosivos e os 59 itens de poder do Cap. 8) · **Ritos** (19) · **Monstronomicon** (37: as 30 criaturas do livro, 6 bruxas e feiticeiros e A Mãe da Figueira) · **Antagonistas humanos** (20 PNJs) · **O Brinquedo da Praça** (elenco de 12 PNJs com as pistas que guardam, A Mãe da Figueira e Bento). Tudo com ícones vetoriais. |

## Estrutura dos arquivos

```
hora-de-cacar/
├── system.json              ← manifesto: id, versão, tipos de documento, compêndios
├── module/
│   ├── hora-de-cacar.mjs    ← ponto de entrada (init, fichas, botões do chat)
│   ├── config.mjs           ← TODAS as regras fixas: atributos, perícias, condições, tabelas
│   ├── models.mjs           ← DataModels (o que cada ficha guarda)
│   ├── actor.mjs            ← regras que mudam estado: condições, dano, críticos, Medo
│   ├── dice.mjs             ← motor de dados, cartão do chat, Forçar
│   ├── combat.mjs           ← iniciativa por cartas e Ferocidade
│   ├── sheets.mjs           ← fichas (ApplicationV2)
│   └── criticos.mjs         ← tabelas D66 (geradas do livro)
├── templates/               ← HTML (Handlebars) das fichas
├── styles/hora-de-cacar.css ← visual do Dossiê
├── lang/pt-BR.json
├── packs/                   ← compêndios compilados (LevelDB)
└── ferramentas/             ← JSON-fonte dos compêndios + script para recompilar
```

## Como continuar o desenvolvimento

**Ambiente recomendado:** VS Code + uma instalação local do Foundry. Crie um link simbólico da pasta do projeto para `Data/systems/hora-de-cacar`, assim você edita e só aperta F5 no Foundry.

**Mudar uma regra:** quase tudo está em `config.mjs` (nomes, tabelas) e `actor.mjs` (comportamento). Ex.: para mudar o máximo de perícia, altere o `max` em `models.mjs`.

**Adicionar campo na ficha:** (1) declare em `models.mjs`; (2) coloque um `<input name="system.seuCampo">` no template. O salvamento é automático.

**Adicionar criaturas/talentos/itens aos compêndios:** o jeito mais fácil é criar dentro do Foundry e arrastar para o compêndio (destrave-o primeiro). Para trabalhar em lote, edite os JSON em `ferramentas/compendios-json/` e rode `node ferramentas/compilar-compendios.mjs` (com o Foundry fechado).

**Macros úteis** (barra de macros, tipo Script):

```js
game.horaDeCacar.medo(2);               // teste de Medo Pavor 2 do token selecionado
game.horaDeCacar.teste("ocultismo");    // teste de Ocultismo
game.horaDeCacar.novaSessaoTodos();     // (Narrador) libera os usos "uma vez por sessão" de todos
```

## Próximos passos sugeridos (roadmap)

3. As tabelas do Narrador (Gerador de Mistério, Gerador Rápido, Ideias de Mistério) como RollTables.
5. **Relógio de mistério** como app flutuante para o Narrador.
6. **O Brinquedo da Praça** completo como Adventure (cenas, mapas e diário do Narrador); o elenco e as criaturas já estão no compêndio.
7. Tradução para espanhol (`lang/es.json`) se o livro tiver edição em espanhol.

## Créditos

Ícones: game-icons.net (CC BY 3.0) — lista completa de autores em `CREDITOS-ICONES.md`.


Hora de Caçar © Jeferson M. Leopoldino e Cássio Fernandes. Este sistema de Foundry usa as regras do livro (versão 0.1, out. 2026). Year Zero Engine é marca da Free League Publishing; confira a licença Free League Workshop antes de publicar.
