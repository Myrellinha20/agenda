// Classe para gerenciar os contatos
class GerenciadorContatos {
    constructor() {
        this.contatos = [];
        this.editandoId = null;
        this.carregarContatos();
        this.configurarEventos();
        this.atualizarTabela();
    }

    // Carregar contatos do localStorage
    carregarContatos() {
        const contatosSalvos = localStorage.getItem('contatos');
        if (contatosSalvos) {
            this.contatos = JSON.parse(contatosSalvos);
        }
    }

    // Salvar contatos no localStorage
    salvarContatos() {
        localStorage.setItem('contatos', JSON.stringify(this.contatos));
        this.atualizarTotalContatos();
    }

    // Configurar eventos da página
    configurarEventos() {
        // Evento de submit do formulário
        document.getElementById('formContato').addEventListener('submit', (e) => {
            e.preventDefault();
            this.salvarContato();
        });

        // Evento do filtro
        document.getElementById('filtro').addEventListener('input', () => {
            this.filtrarContatos();
        });

        // Evento do botão cancelar
        document.getElementById('btnCancelar').addEventListener('click', () => {
            this.limparFormulario();
        });

        // Máscara para telefone
        document.getElementById('telefone').addEventListener('input', (e) => {
            let valor = e.target.value.replace(/\D/g, '');
            if (valor.length > 11) valor = valor.slice(0, 11);
            
            if (valor.length > 10) {
                valor = valor.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (valor.length > 5) {
                valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (valor.length > 2) {
                valor = valor.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            } else {
                valor = valor.replace(/^(\d*)/, '($1');
            }
            
            e.target.value = valor;
        });
    }

    // Salvar ou atualizar contato
    salvarContato() {
        const nome = document.getElementById('nome').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefone = document.getElementById('telefone').value.trim();

        if (!nome || !email || !telefone) {
            alert('Por favor, preencha todos os campos!');
            return;
        }

        if (!this.validarEmail(email)) {
            alert('Por favor, insira um e-mail válido!');
            return;
        }

        const contato = { nome, email, telefone };

        if (this.editandoId !== null) {
            // Atualizar contato existente
            this.contatos[this.editandoId] = contato;
            this.editandoId = null;
            document.querySelector('button[type="submit"]').textContent = 'Salvar';
            document.getElementById('btnCancelar').style.display = 'inline-block';
        } else {
            // Adicionar novo contato
            this.contatos.push(contato);
        }

        this.salvarContatos();
        this.atualizarTabela();
        this.limparFormulario();
    }

    // Validar email
    validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Editar contato
    editarContato(index) {
        const contato = this.contatos[index];
        document.getElementById('nome').value = contato.nome;
        document.getElementById('email').value = contato.email;
        document.getElementById('telefone').value = contato.telefone;
        
        this.editandoId = index;
        document.querySelector('button[type="submit"]').textContent = 'Atualizar';
        document.getElementById('btnCancelar').style.display = 'inline-block';
    }

    // Excluir contato
    excluirContato(index) {
        if (confirm('Tem certeza que deseja excluir este contato?')) {
            this.contatos.splice(index, 1);
            this.salvarContatos();
            this.atualizarTabela();
            
            if (this.editandoId === index) {
                this.limparFormulario();
            }
        }
    }

    // Limpar formulário
    limparFormulario() {
        document.getElementById('formContato').reset();
        this.editandoId = null;
        document.querySelector('button[type="submit"]').textContent = 'Salvar';
        document.getElementById('btnCancelar').style.display = 'none';
    }

    // Filtrar contatos
    filtrarContatos() {
        const termo = document.getElementById('filtro').value.toLowerCase();
        this.atualizarTabela(termo);
    }

    // Atualizar tabela
    atualizarTabela(termoFiltro = '') {
        const tbody = document.getElementById('corpoTabela');
        tbody.innerHTML = '';

        let contatosFiltrados = this.contatos;
        
        if (termoFiltro) {
            contatosFiltrados = this.contatos.filter(contato => 
                contato.nome.toLowerCase().includes(termoFiltro)
            );
        }

        if (contatosFiltrados.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="4" style="text-align: center;">Nenhum contato encontrado</td>';
            tbody.appendChild(tr);
        } else {
            contatosFiltrados.forEach((contato, index) => {
                // Encontrar o índice real no array original
                const indiceReal = this.contatos.findIndex(c => 
                    c.nome === contato.nome && 
                    c.email === contato.email && 
                    c.telefone === contato.telefone
                );
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${this.escapeHtml(contato.nome)}</td>
                    <td>${this.escapeHtml(contato.email)}</td>
                    <td>${this.escapeHtml(contato.telefone)}</td>
                    <td>
                        <button class="btn-edit" onclick="gerenciador.editarContato(${indiceReal})">Editar</button>
                        <button class="btn-delete" onclick="gerenciador.excluirContato(${indiceReal})">Excluir</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        this.atualizarTotalContatos();
    }

    // Escapar HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Atualizar total de contatos
    atualizarTotalContatos() {
        document.getElementById('totalContatos').textContent = this.contatos.length;
    }
}

// Inicializar o gerenciador quando a página carregar
let gerenciador;
document.addEventListener('DOMContentLoaded', () => {
    gerenciador = new GerenciadorContatos();
    document.getElementById('btnCancelar').style.display = 'none';
});