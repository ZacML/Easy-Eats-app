# Easy Eats App

Aplicativo mobile do Easy Eats feito com React Native + Expo.

O projeto roda com um **development build** (APK de desenvolvimento) instalado no celular. O APK é só a "casca" nativa: o JavaScript é entregue pelo Metro (`expo start`) toda vez que você roda o projeto. Por isso **não é necessário ter Gradle nem Android Studio** para o dia a dia.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS)
- [Git](https://git-scm.com/)
- **ADB** (Android SDK Platform-Tools), disponível no PATH. Confira com `adb version`
- Celular Android com **Depuração USB** ativada (Configurações > Opções do desenvolvedor)
- Conta no [Expo](https://expo.dev/) (só para gerar novos builds)

> **Windows:** clone o projeto em um caminho **curto** (ex.: `C:\ee\Easy-Eats-app`). Caminhos longos estouram o limite de 260 caracteres do Windows em builds nativos.

---

## 1. Configuração inicial (uma vez por computador)

```bash
git clone https://github.com/ZacML/Easy-Eats-app.git
cd Easy-Eats-app
git checkout https://github.com/ZacML/Easy-Eats-app.git
npm install
```

Crie o arquivo `.env` na raiz do projeto (ele não vai para o git):

```env
EXPO_PUBLIC_API_URL=http://<endereco-da-api>:8080
```

O valor depende de como você vai rodar (veja as seções de cabo e Wi-Fi abaixo).

Se o projeto usa notificações push, o arquivo `google-services.json` também precisa estar na raiz, caso esteja ignorado pelo git.

---

## 2. Instalar o development build no celular (uma vez por celular)

O APK é gerado na nuvem pelo EAS, sem Gradle local.

**Se já existe um build pronto**, abra a página do build no navegador do celular (link do `expo.dev`, na conta do projeto), toque em **Install** e permita a instalação de fontes desconhecidas.

**Para gerar um build novo:**

```bash
npx eas-cli login
npx eas-cli build --profile development --platform android
```

Quando terminar, instale o APK pelo link ou QR code que o EAS mostra. Também dá para instalar pelo cabo:

```bash
adb install -r caminho/do/arquivo.apk
```

> Obs.: `eas build:run` só lista **emuladores**, não celulares físicos.

### Quando é preciso gerar um build novo?

Só quando mudar algo **nativo**:

- instalar ou atualizar bibliotecas com código nativo (`expo-notifications`, `expo-device` etc.)
- alterar plugins ou configurações do `app.json` (package, `googleServicesFile`, permissões)
- atualizar a versão do SDK do Expo

Mudanças em telas, lógica, chamadas de API e estilos **não** precisam de build novo.

---

## 3. Rodar por cabo (USB)

1. Conecte o celular com um **cabo de dados**.
2. Aceite o popup **"Permitir depuração USB"** no celular.
3. Confirme que o aparelho aparece como `device`:

```bash
adb devices
```

4. Faça o túnel da porta do Metro e inicie o projeto:

```bash
adb reverse tcp:8081 tcp:8081
npx expo start --dev-client
```

5. Abra o app **pelo ícone** no celular. No dev launcher, escolha `localhost:8081` ou use **Enter URL manually** com `http://localhost:8081`.

### API rodando no PC (cabo)

`localhost` no celular aponta para o próprio celular. Faça o túnel também para a porta da API:

```bash
adb reverse tcp:8080 tcp:8080
```

e use no `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8080
```

---

## 4. Rodar por Wi-Fi

1. Conecte **celular e PC na mesma rede Wi-Fi**.
2. Inicie o Metro:

```bash
npx expo start --dev-client
```

3. Abra o app no celular e escaneie o **QR code** do terminal, ou escolha o servidor listado no dev launcher.

### API rodando no PC (Wi-Fi)

Use o IP do PC na rede local (descubra com `ipconfig` no Windows) no `.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080
```

### Se o app não encontrar o servidor

- Permita o **Node.js** no Firewall do Windows para **redes privadas**.
- Algumas redes (Wi-Fi de empresa, faculdade ou visitantes) isolam os dispositivos entre si. Nesse caso, use o cabo ou o modo túnel:

```bash
npx expo start --dev-client --tunnel
```

---

## Observação sobre o `.env`

As variáveis `EXPO_PUBLIC_*` são lidas **quando o Metro inicia**. Depois de alterar o `.env`, reinicie limpando o cache:

```bash
npx expo start --dev-client -c
```

---

## Problemas comuns

| Problema | O que fazer |
| --- | --- |
| `adb: command not found` | Instale o platform-tools e coloque no PATH, ou chame o `adb.exe` pelo caminho completo. |
| `adb devices` vazio | Use cabo de dados, modo USB "Transferência de arquivos", ative a Depuração USB e rode `adb kill-server`. |
| `unauthorized` no `adb devices` | Aceite o popup de depuração USB no celular. |
| App abre e fica branco | Confira se é o development build correto, se o Metro está rodando e se a porta 8081 está acessível (`adb reverse`). |
| `No development build (...) is installed` | O CLI não achou o app pelo package. Se o app já está instalado, ignore e abra-o pelo ícone no celular. |
| Erro de Firebase / `google-services.json` | O build precisa ser gerado com o `google-services.json` configurado no `app.json`. |
| Erro de rede ao chamar a API | Revise o `EXPO_PUBLIC_API_URL` conforme cabo ou Wi-Fi e reinicie o Metro com `-c`. |
| `Filename longer than 260 characters` | Mova o projeto para um caminho curto (ex.: `C:\ee`). Só ocorre em build nativo local. |

---

## Resumo rápido

**Cabo**

```bash
adb devices
adb reverse tcp:8081 tcp:8081
npx expo start --dev-client
```

**Wi-Fi**

```bash
npx expo start --dev-client
```
