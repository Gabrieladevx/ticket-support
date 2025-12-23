const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Inicializar banco de dados
const db = new sqlite3.Database('tickets.db', (err) => {
  if (err) console.error('Erro ao conectar BD:', err);
  else console.log('✅ Banco de dados conectado');
});

// Criar tabelas
db.serialize(() => {
  // Tabela de tickets
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    prioridade TEXT DEFAULT 'média',
    status TEXT DEFAULT 'aberto',
    email_usuario TEXT NOT NULL,
    agente_id TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Tabela de mensagens do chat
  db.run(`CREATE TABLE IF NOT EXISTS mensagens (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    usuario TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(ticket_id) REFERENCES tickets(id)
  )`);

  // Tabela de agentes
  db.run(`CREATE TABLE IF NOT EXISTS agentes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    tickets_ativos INTEGER DEFAULT 0
  )`);

  // Tabela de base de conhecimento
  db.run(`CREATE TABLE IF NOT EXISTS base_conhecimento (
    id TEXT PRIMARY KEY,
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    categoria TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Inserir artigos de exemplo
  const artigos = [
    {
      id: uuidv4(),
      titulo: 'Como redefinir minha senha?',
      conteudo: 'Para redefinir sua senha, clique em "Esqueci minha senha" na página de login. Você receberá um email com um link para criar uma nova senha. O link é válido por 24 horas.',
      categoria: 'Conta'
    },
    {
      id: uuidv4(),
      titulo: 'Como criar um ticket de suporte?',
      conteudo: 'Acesse a seção "Novo Ticket" e preencha os campos obrigatórios: seu email, título do problema e descrição detalhada. Você pode selecionar a prioridade (baixa, média ou alta). Após enviar, você receberá um ID de rastreamento para acompanhar seu ticket.',
      categoria: 'Geral'
    },
    {
      id: uuidv4(),
      titulo: 'Qual é o tempo médio de resposta?',
      conteudo: 'Nosso time de suporte responde em até 4 horas para tickets com prioridade alta, 8 horas para média e 24 horas para baixa prioridade. Você será notificado via email quando um agente responder ao seu ticket.',
      categoria: 'Suporte'
    },
    {
      id: uuidv4(),
      titulo: 'Como cancelar minha conta?',
      conteudo: 'Você pode cancelar sua conta acessando as configurações da sua conta. Clique em "Configurações" > "Deletar Conta". Todos os seus dados serão removidos após 30 dias.',
      categoria: 'Conta'
    },
    {
      id: uuidv4(),
      titulo: 'Problemas com login',
      conteudo: 'Se você não conseguir fazer login, verifique se: 1) Seu email está correto, 2) Seu caps lock está desativado, 3) Você está usando a senha correta. Se o problema persistir, use a opção "Esqueci minha senha".',
      categoria: 'Problemas Comuns'
    },
    {
      id: uuidv4(),
      titulo: 'Como atualizar meu perfil?',
      conteudo: 'Acesse as configurações do seu perfil e clique em "Editar Informações". Você pode atualizar seu nome, email, foto de perfil e outras informações. Clique em "Salvar" para confirmar as mudanças.',
      categoria: 'Conta'
    }
  ];

  // Verificar se há artigos e inserir
  db.get('SELECT COUNT(*) as count FROM base_conhecimento', (err, row) => {
    if (err || (row && row.count === 0)) {
      artigos.forEach(artigo => {
        db.run(
          `INSERT INTO base_conhecimento (id, titulo, conteudo, categoria) VALUES (?, ?, ?, ?)`,
          [artigo.id, artigo.titulo, artigo.conteudo, artigo.categoria],
          (err) => {
            if (err) console.error('Erro ao inserir artigo:', err);
          }
        );
      });
      console.log('✅ Artigos da base de conhecimento inseridos');
    }
  });
});

// ============ TICKETS ============

// Listar todos os tickets
app.get('/api/tickets', (req, res) => {
  db.all('SELECT * FROM tickets ORDER BY criado_em DESC', (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows || []);
  });
});

// Criar novo ticket
app.post('/api/tickets', (req, res) => {
  const { titulo, descricao, prioridade, email_usuario } = req.body;
  
  if (!titulo || !descricao || !email_usuario) {
    return res.status(400).json({ erro: 'Campos obrigatórios faltando' });
  }

  const id = uuidv4();
  const query = `INSERT INTO tickets (id, titulo, descricao, prioridade, email_usuario) 
                 VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [id, titulo, descricao, prioridade || 'média', email_usuario], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ id, titulo, descricao, prioridade, email_usuario, status: 'aberto' });
  });
});

// Obter ticket específico
app.get('/api/tickets/:id', (req, res) => {
  db.get('SELECT * FROM tickets WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!row) return res.status(404).json({ erro: 'Ticket não encontrado' });
    res.json(row);
  });
});

// Atualizar status do ticket
app.put('/api/tickets/:id', (req, res) => {
  const { status, agente_id } = req.body;
  
  const query = `UPDATE tickets SET status = ?, agente_id = ?, atualizado_em = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
  
  db.run(query, [status, agente_id, req.params.id], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: 'Ticket atualizado com sucesso' });
  });
});

// Deletar ticket
app.delete('/api/tickets/:id', (req, res) => {
  const query = `DELETE FROM tickets WHERE id = ?`;
  
  db.run(query, [req.params.id], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: 'Ticket deletado com sucesso' });
  });
});

// ============ CHAT ============

// Listar mensagens de um ticket
app.get('/api/tickets/:id/mensagens', (req, res) => {
  db.all(
    'SELECT * FROM mensagens WHERE ticket_id = ? ORDER BY criado_em ASC',
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ erro: err.message });
      res.json(rows || []);
    }
  );
});

// Adicionar mensagem ao ticket
app.post('/api/tickets/:id/mensagens', (req, res) => {
  const { usuario, mensagem } = req.body;
  
  if (!usuario || !mensagem) {
    return res.status(400).json({ erro: 'Usuário e mensagem obrigatórios' });
  }

  const id = uuidv4();
  const query = `INSERT INTO mensagens (id, ticket_id, usuario, mensagem) 
                 VALUES (?, ?, ?, ?)`;
  
  db.run(query, [id, req.params.id, usuario, mensagem], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ id, usuario, mensagem });
  });
});

// ============ AGENTES ============

// Listar agentes
app.get('/api/agentes', (req, res) => {
  db.all('SELECT * FROM agentes', (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows || []);
  });
});

// Criar agente
app.post('/api/agentes', (req, res) => {
  const { nome, email } = req.body;
  
  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e email obrigatórios' });
  }

  const id = uuidv4();
  const query = `INSERT INTO agentes (id, nome, email) VALUES (?, ?, ?)`;
  
  db.run(query, [id, nome, email], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ id, nome, email });
  });
});

// ============ BASE DE CONHECIMENTO ============

// Listar artigos
app.get('/api/conhecimento', (req, res) => {
  db.all('SELECT * FROM base_conhecimento ORDER BY criado_em DESC', (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows || []);
  });
});

// Criar artigo
app.post('/api/conhecimento', (req, res) => {
  const { titulo, conteudo, categoria } = req.body;
  
  if (!titulo || !conteudo) {
    return res.status(400).json({ erro: 'Título e conteúdo obrigatórios' });
  }

  const id = uuidv4();
  const query = `INSERT INTO base_conhecimento (id, titulo, conteudo, categoria) 
                 VALUES (?, ?, ?, ?)`;
  
  db.run(query, [id, titulo, conteudo, categoria || 'Geral'], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ id, titulo, conteudo, categoria });
  });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
