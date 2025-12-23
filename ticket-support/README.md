# 🎫 Sistema de Tickets de Suporte

Um sistema simples e completo para gestão de chamados, com chat integrado e base de conhecimento. Ideal para aprender Node.js, Express, SQLite e front-end web!

---

## 🚀 Funcion3alidades
- **Criar e gerenciar tickets**
- **Chat entre cliente e agente**
- **Base de conhecimento (FAQ)**
- **Atribuição de agentes**
- **Deletar tickets**
- **Interface responsiva**

---

## 📁 Estrutura do Projeto
```text
PJ/ticket-support/
├── server/        # Backend Node.js + Express + SQLite
│   ├── package.json
│   ├── server.js
│   └── tickets.db (criado automaticamente)
└── client/        # Frontend HTML/CSS/JS
    ├── index.html
    ├── style.css
    └── app.js
```

---

## 🛠️ Como rodar localmente

1. **Instale as dependências do backend:**
   ```bash
   cd server
   npm install

2. **Inicie o servidor:**
   ```bash
   npm start

   O backend estará em `http://localhost:3000`
3. **Abra o frontend:**
   - Abra `client/index.html` no navegador
   - Ou use a extensão Live Server do VS Code

---

## 🌐 API Endpoints

- `GET /api/tickets` — Listar tickets
- `POST /api/tickets` — Criar ticket
- `GET /api/tickets/:id` — Detalhes do ticket
- `PUT /api/tickets/:id` — Atualizar status
- `DELETE /api/tickets/:id` — Deletar ticket
- `GET /api/tickets/:id/mensagens` — Listar mensagens do chat
- `POST /api/tickets/:id/mensagens` — Enviar mensagem
- `GET /api/agentes` — Listar agentes
- `POST /api/agentes` — Criar agente
- `GET /api/conhecimento` — Listar artigos
- `POST /api/conhecimento` — Criar artigo

---

## ☁️ Deploy no Azure

1. **Suba o projeto no GitHub**
2. **Backend:**
   - Use Azure App Service para publicar a pasta `server`
   - Comando exemplo:
     ```bash
     az webapp up --name seu-app-backend --resource-group seu-grupo --runtime "NODE|18-lts"
     ```
3. **Frontend:**
   - Use Azure Static Web Apps e conecte ao seu repositório GitHub
   - Configure a pasta `client` como fonte

---

## 💡 Para estudar
- REST API com Express.js
- Banco de dados SQLite
- Front-end vanilla (HTML/CSS/JS)
- Requisições HTTP (fetch)
- Deploy na nuvem (Azure)
- Git e GitHub

---

## 🔧 Melhorias sugeridas
- Autenticação de usuários
- Notificações em tempo real (WebSocket)
- Busca avançada de tickets
- Relatórios e estatísticas
- Upload de anexos

---

## 📝 Notas
- O banco SQLite é criado automaticamente
- Todos os endpoints aceitam e retornam JSON
- Projeto 100% em português para facilitar o aprendizado

---

**Feito para aprender e evoluir!**

---

[Deploy no Azure: Documentação oficial](https://learn.microsoft.com/azure/app-service/quickstart-nodejs?tabs=windows&pivots=development-environment-vscode)
[Deploy Static Web Apps](https://learn.microsoft.com/azure/static-web-apps/getting-started?tabs=vanilla-javascript)
