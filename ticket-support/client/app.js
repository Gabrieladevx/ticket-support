const API_URL = 'http://localhost:3000/api';
let ticketAtualId = null;
let artigosCache = [];

// Mostrar/Ocultar páginas
function mostrarPagina(pagina) {
    document.querySelectorAll('.pagina').forEach(p => p.classList.add('hidden'));
    document.getElementById(pagina).classList.remove('hidden');
    
    if (pagina === 'tickets') carregarTickets();
    if (pagina === 'conhecimento') carregarConhecimento();
}

// ============ TICKETS ============

// Criar novo ticket
document.getElementById('formNovoTicket')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const ticket = {
        email_usuario: document.getElementById('email').value,
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        prioridade: document.getElementById('prioridade').value
    };

    try {
        const res = await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ticket)
        });

        if (res.ok) {
            alert('✅ Ticket criado com sucesso!');
            document.getElementById('formNovoTicket').reset();
            mostrarPagina('tickets');
        } else {
            alert('❌ Erro ao criar ticket');
        }
    } catch (err) {
        console.error('Erro:', err);
        alert('Erro na conexão com servidor');
    }
});

// Carregar tickets
async function carregarTickets() {
    try {
        const res = await fetch(`${API_URL}/tickets`);
        const tickets = await res.json();

        const html = tickets.map(t => `
            <div class="ticket-card" onclick="abrirTicket('${t.id}', '${t.titulo}')">
                <div class="ticket-id">#${t.id.substring(0, 8)}</div>
                <div class="ticket-titulo">${t.titulo}</div>
                <div class="ticket-status status-${t.status}">${t.status.toUpperCase()}</div>
                <div class="ticket-prioridade">Prioridade: ${t.prioridade}</div>
                <small>${new Date(t.criado_em).toLocaleDateString('pt-BR')}</small>
            </div>
        `).join('');

        document.getElementById('listaTickets').innerHTML = html || '<p>Nenhum ticket encontrado</p>';
    } catch (err) {
        console.error('Erro ao carregar tickets:', err);
    }
}

// Abrir detalhes do ticket
async function abrirTicket(id, titulo) {
    ticketAtualId = id;
    
    try {
        const res = await fetch(`${API_URL}/tickets/${id}`);
        const ticket = await res.json();

        document.getElementById('ticketTitulo').textContent = `#${id.substring(0, 8)} - ${titulo}`;
        document.getElementById('ticketDetalhes').innerHTML = `
            <p><strong>Status:</strong> ${ticket.status}</p>
            <p><strong>Prioridade:</strong> ${ticket.prioridade}</p>
            <p><strong>Email:</strong> ${ticket.email_usuario}</p>
            <p><strong>Descrição:</strong></p>
            <p>${ticket.descricao}</p>
            <p><strong>Criado em:</strong> ${new Date(ticket.criado_em).toLocaleDateString('pt-BR')}</p>
        `;

        await carregarMensagens(id);
        document.getElementById('modalTicket').style.display = 'block';
    } catch (err) {
        console.error('Erro ao carregar ticket:', err);
    }
}

// Fechar modal
function fecharModal() {
    document.getElementById('modalTicket').style.display = 'none';
    ticketAtualId = null;
}

// Deletar ticket
async function deletarTicket() {
    if (!ticketAtualId) return;
    
    if (!confirm('Tem certeza que deseja deletar este ticket? Esta ação não pode ser desfeita!')) {
        return;
    }

    try {
        const res = await fetch(`${API_URL}/tickets/${ticketAtualId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            alert('✅ Ticket deletado com sucesso!');
            fecharModal();
            carregarTickets();
            mostrarPagina('tickets');
        } else {
            alert('❌ Erro ao deletar ticket');
        }
    } catch (err) {
        console.error('Erro ao deletar ticket:', err);
        alert('Erro na conexão com servidor');
    }
}

// ============ CHAT ============

// Carregar mensagens do ticket
async function carregarMensagens(ticketId) {
    try {
        const res = await fetch(`${API_URL}/tickets/${ticketId}/mensagens`);
        const mensagens = await res.json();

        const html = mensagens.map(m => `
            <div class="mensagem ${m.usuario === 'agente' ? 'mensagem-agente' : 'mensagem-usuario'}">
                <div class="mensagem-autor">${m.usuario}</div>
                <div>${m.mensagem}</div>
                <small>${new Date(m.criado_em).toLocaleTimeString('pt-BR')}</small>
            </div>
        `).join('');

        document.getElementById('mensagensChat').innerHTML = html || '<p style="color: #999;">Nenhuma mensagem ainda</p>';
        document.getElementById('mensagensChat').scrollTop = document.getElementById('mensagensChat').scrollHeight;
    } catch (err) {
        console.error('Erro ao carregar mensagens:', err);
    }
}

// Enviar mensagem
async function enviarMensagem(e) {
    e.preventDefault();
    
    if (!ticketAtualId) return;

    const mensagem = document.getElementById('inputMensagem').value.trim();
    if (!mensagem) return;

    try {
        const res = await fetch(`${API_URL}/tickets/${ticketAtualId}/mensagens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usuario: 'cliente',
                mensagem: mensagem
            })
        });

        if (res.ok) {
            document.getElementById('inputMensagem').value = '';
            await carregarMensagens(ticketAtualId);
        }
    } catch (err) {
        console.error('Erro ao enviar mensagem:', err);
    }
}

// Carregar artigos
async function carregarConhecimento() {
    try {
        const res = await fetch(`${API_URL}/conhecimento`);
        const data = await res.json();
        console.log('Artigos carregados:', data);
        
        artigosCache = Array.isArray(data) ? data : [];

        const html = artigosCache.length > 0 
            ? artigosCache.map((a, index) => `
                <div class="article-card" onclick="abrirArtigo(${index})">
                    <div class="article-categoria">${a.categoria}</div>
                    <div class="article-titulo">${a.titulo}</div>
                    <div class="article-preview">${a.conteudo.substring(0, 150)}...</div>
                </div>
            `).join('')
            : '<p>Nenhum artigo encontrado</p>';

        document.getElementById('listaConhecimento').innerHTML = html;
    } catch (err) {
        console.error('Erro ao carregar conhecimento:', err);
        document.getElementById('listaConhecimento').innerHTML = '<p style="color: red;">❌ Erro ao carregar artigos</p>';
    }
}

// Abrir artigo
function abrirArtigo(index) {
    const artigo = artigosCache[index];
    if (!artigo) return;
    
    document.getElementById('artigoTitulo').textContent = artigo.titulo;
    document.getElementById('artigoCategoria').innerHTML = `<span class="article-categoria">${artigo.categoria}</span>`;
    document.getElementById('artigoConteudo').textContent = artigo.conteudo;
    document.getElementById('modalArtigo').style.display = 'block';
}

// Fechar modal do artigo
function fecharModalArtigo() {
    document.getElementById('modalArtigo').style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = (e) => {
    const modalTicket = document.getElementById('modalTicket');
    const modalArtigo = document.getElementById('modalArtigo');
    if (e.target === modalTicket) fecharModal();
    if (e.target === modalArtigo) fecharModalArtigo();
};

// Carregar página inicial
mostrarPagina('novo');
