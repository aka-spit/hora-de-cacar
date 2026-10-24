# Publicar o Hora de Caçar no GitHub

O manifesto (`system.json` com os links de instalação) e o `.zip` são gerados **automaticamente** pela automação em `.github/workflows/release.yml` toda vez que você publica um *Release*. Você não precisa editar links à mão.

## 1. Criar o repositório (uma vez)

1. Crie uma conta em https://github.com (se ainda não tiver).
2. Clique em **+ → New repository**.
   - **Repository name:** `hora-de-cacar`
   - **Public** (o Foundry só baixa de repositório público)
   - Não marque "Add a README" (o projeto já tem um).
3. Clique em **Create repository**.

## 2. Enviar os arquivos (uma vez)

Mais fácil, sem linha de comando: **GitHub Desktop** (https://desktop.github.com).

1. Instale e entre com sua conta.
2. **File → Clone repository** → escolha `hora-de-cacar` → escolha uma pasta no seu computador.
3. Copie para dentro dessa pasta **todo o conteúdo** desta pasta do projeto, inclusive a pasta oculta `.github` e o arquivo `.gitignore`.
   - No Windows, ative **Exibir → Itens ocultos** no Explorador para ver o `.github`.
4. No GitHub Desktop, escreva um resumo (ex.: "Versão 0.2.0") e clique em **Commit to main** → **Push origin**.

> Dica: para desenvolver, aponte o Foundry para essa pasta clonada. Feche o Foundry, apague `Data/systems/hora-de-cacar` e crie um atalho de pasta (no Windows, num Prompt de Comando):
> `mklink /J "%localappdata%\FoundryVTT\Data\systems\hora-de-cacar" "C:\caminho\da\pasta\clonada"`
> Assim, o que você edita já aparece no Foundry com F5.

## 3. Publicar uma versão (sempre que quiser lançar)

1. No site do repositório: **Releases → Draft a new release** (ou **Create a new release**).
2. **Choose a tag** → digite `v0.2.0` → **Create new tag**.
3. **Release title:** `0.2.0`. Na descrição, cole o trecho do `CHANGELOG.md`.
4. Clique em **Publish release**.
5. Abra a aba **Actions** e espere o "Publicar versão" ficar verde (1 a 2 minutos).
6. Volte ao release: ele terá dois anexos, `system.json` e `hora-de-cacar.zip`.

Pronto. O link de instalação passa a ser:

```
https://github.com/SEU-USUARIO/hora-de-cacar/releases/latest/download/system.json
```

## 4. Instalar no Foundry pelo link

**Game Systems → Install System → Manifest URL** → cole o link → **Install**.

## 5. Lançar atualizações

1. Faça as mudanças, anote no `CHANGELOG.md`, commit e push.
2. Crie um novo release com uma tag **maior** (`v0.2.1`, `v0.3.0`...).
3. Quem instalou pelo link vê o botão **Update** no Foundry.

A versão vem da tag: não precisa mudar `version` no `system.json` à mão.

## 6. (Opcional) Aparecer na lista oficial do Foundry

1. Entre em https://foundryvtt.com com sua conta.
2. No seu perfil, procure o envio de pacote (*Submit a Package*).
3. Informe o link do manifesto acima e aguarde a revisão da equipe.
4. Antes, leia a política de conteúdo de IA do site e a licença Free League Workshop (Year Zero Engine), e adicione um arquivo `LICENSE` ao repositório com a licença que você escolher.

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Foundry diz "manifest not found" | O repositório está privado, ou o release ainda não terminou na aba Actions. |
| Release sem anexos | A automação falhou: abra **Actions**, clique na execução vermelha e veja o passo com erro. Confira se a pasta `.github` foi enviada. |
| "Update" não aparece | A tag nova não é maior que a instalada (use v0.2.1 depois de v0.2.0). |
| Sistema some após instalar | Havia uma cópia manual com o mesmo nome; apague `Data/systems/hora-de-cacar` e instale de novo pelo link. |
