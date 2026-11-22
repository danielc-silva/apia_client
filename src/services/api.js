const API_BASE_URL = '/api';

async function buscarLista(url, mensagemErro, headers) {
  let res;
  try {
    res = await fetch(url, { headers });
  } catch (erro) {
    throw new Error(`${mensagemErro}: ${erro.message}`, { cause: erro });
  }

  if (!res.ok) {
    const tipoConteudo = res.headers.get('content-type') || '';
    const erro = tipoConteudo.includes('application/json') ? await res.json() : null;
    throw new Error(
      erro?.message || erro?.mensagem || `${mensagemErro} (HTTP ${res.status})`
    );
  }

  const resposta = await res.json();
  if (!Array.isArray(resposta.data)) {
    throw new Error(`${mensagemErro}: formato de resposta inválido.`);
  }
  return resposta.data;
}

// Retorna os headers de autorização com o token JWT se o usuário estiver logado
function obterCabecalhoAutenticacao() {
  const token = localStorage.getItem('ong_apia_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function enviarJson(url, metodo, dados, mensagemErro) {
  const res = await fetch(url, {
    method: metodo,
    headers: { ...obterCabecalhoAutenticacao(), 'Content-Type': 'application/json' },
    body: dados === undefined ? undefined : JSON.stringify(dados),
  });
  if (!res.ok) {
    const tipo = res.headers.get('content-type') || '';
    const err = tipo.includes('application/json') ? await res.json() : null;
    throw new Error(err?.message || err?.mensagem || mensagemErro);
  }
  const json = await res.json();
  return json.data;
}

export const api = {
  // ==========================================
  // MÉTODOS DE ANIMAIS
  // ==========================================
  async getAnimals(filters) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v && v !== 'todos') params.append(k, v);
      });
    }

    return buscarLista(
      `${API_BASE_URL}/animals?${params.toString()}`,
      'Falha ao buscar animais'
    );
  },

  async buscarAnimais(filtros) {
    return this.getAnimals(filtros);
  },

  async buscarFinaisFelizes() {
    try {
      return await buscarLista(
        `${API_BASE_URL}/animals/finais-felizes`,
        'Falha ao buscar finais felizes'
      );
    } catch {
      const adotados = await this.getAnimals({ status: 'adotado', random: 'true' });
      return [...adotados].sort(() => Math.random() - 0.5).slice(0, 12);
    }
  },

  async getAnimal(id) {
    const res = await fetch(`${API_BASE_URL}/animals/${id}`);
    if (!res.ok) throw new Error('Animal não encontrado');
    const data = await res.json();
    return data.data;
  },

  async buscarAnimal(id) {
    return this.getAnimal(id);
  },

  async createAnimal(formData) {
    const res = await fetch(`${API_BASE_URL}/animals`, {
      method: 'POST',
      headers: { ...obterCabecalhoAutenticacao() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao cadastrar animal');
    }
    const data = await res.json();
    return data.data;
  },

  async cadastrarAnimal(formData) {
    return this.createAnimal(formData);
  },

  async updateAnimal(id, formData) {
    const res = await fetch(`${API_BASE_URL}/animals/${id}`, {
      method: 'PUT',
      headers: { ...obterCabecalhoAutenticacao() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao atualizar animal');
    }
    const data = await res.json();
    return data.data;
  },

  async atualizarAnimal(id, formData) {
    return this.updateAnimal(id, formData);
  },

  async markAsAdopted(id) {
    const res = await fetch(`${API_BASE_URL}/animals/${id}/adopt`, {
      method: 'PATCH',
      headers: { ...obterCabecalhoAutenticacao(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao marcar animal como adotado');
    }
    const data = await res.json();
    return data.data;
  },

  async marcarComoAdotado(id) {
    return this.markAsAdopted(id);
  },

  async markAsAvailable(id) {
    const res = await fetch(`${API_BASE_URL}/animals/${id}/available`, {
      method: 'PATCH',
      headers: { ...obterCabecalhoAutenticacao(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao marcar animal como disponível');
    }
    const data = await res.json();
    return data.data;
  },

  async marcarComoDisponivel(id) {
    return this.markAsAvailable(id);
  },

  async deleteAnimal(id) {
    const res = await fetch(`${API_BASE_URL}/animals/${id}`, {
      method: 'DELETE',
      headers: { ...obterCabecalhoAutenticacao() },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao excluir animal');
    }
  },

  async excluirAnimal(id) {
    return this.deleteAnimal(id);
  },

  // ==========================================
  // MÉTODOS DE EVENTOS E NOTÍCIAS
  // ==========================================
  async getEvents(all = false) {
    const url = all ? `${API_BASE_URL}/events/admin` : `${API_BASE_URL}/events`;
    const headers = all ? obterCabecalhoAutenticacao() : undefined;
    return buscarLista(url, 'Falha ao buscar eventos', headers);
  },

  async buscarEventos(todos = false) {
    return this.getEvents(todos);
  },

  async createEvent(formData) {
    const res = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: { ...obterCabecalhoAutenticacao() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao criar evento');
    }
    const data = await res.json();
    return data.data;
  },

  async cadastrarEvento(formData) {
    return this.createEvent(formData);
  },

  async updateEvent(id, formData) {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PUT',
      headers: { ...obterCabecalhoAutenticacao() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao atualizar evento');
    }
    const data = await res.json();
    return data.data;
  },

  async atualizarEvento(id, formData) {
    return this.updateEvent(id, formData);
  },

  async toggleEventVisibility(id) {
    const res = await fetch(`${API_BASE_URL}/events/${id}/toggle`, {
      method: 'PATCH',
      headers: { ...obterCabecalhoAutenticacao(), 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao alterar visibilidade');
    }
    const data = await res.json();
    return data.data;
  },

  async alternarVisibilidadeEvento(id) {
    return this.toggleEventVisibility(id);
  },

  async deleteEvent(id) {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
      headers: { ...obterCabecalhoAutenticacao() },
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao excluir evento');
    }
  },

  async excluirEvento(id) {
    return this.deleteEvent(id);
  },

  // ==========================================
  // MÉTODOS DE CARDS DE COMO AJUDAR
  // ==========================================
  async getHelpCards(all = false) {
    const url = all ? `${API_BASE_URL}/help-cards/admin` : `${API_BASE_URL}/help-cards`;
    const headers = all ? obterCabecalhoAutenticacao() : undefined;
    return buscarLista(url, 'Falha ao buscar cards de ajuda', headers);
  },

  async buscarCardsAjuda(todos = false) {
    return this.getHelpCards(todos);
  },

  async createHelpCard(dados) {
    return enviarJson(`${API_BASE_URL}/help-cards`, 'POST', dados, 'Erro ao criar card');
  },

  async cadastrarCardAjuda(dados) {
    return this.createHelpCard(dados);
  },

  async updateHelpCard(id, dados) {
    return enviarJson(`${API_BASE_URL}/help-cards/${id}`, 'PUT', dados, 'Erro ao atualizar card');
  },

  async atualizarCardAjuda(id, dados) {
    return this.updateHelpCard(id, dados);
  },

  async toggleHelpCardVisibility(id) {
    return enviarJson(`${API_BASE_URL}/help-cards/${id}/toggle`, 'PATCH', undefined, 'Erro ao alterar visibilidade');
  },

  async alternarVisibilidadeCardAjuda(id) {
    return this.toggleHelpCardVisibility(id);
  },

  async deleteHelpCard(id) {
    return enviarJson(`${API_BASE_URL}/help-cards/${id}`, 'DELETE', undefined, 'Erro ao excluir card');
  },

  async excluirCardAjuda(id) {
    return this.deleteHelpCard(id);
  },

  async getHelpCardImages(id, admin = false) {
    const url = admin
      ? `${API_BASE_URL}/help-cards/admin/${id}/images`
      : `${API_BASE_URL}/help-cards/${id}/images`;
    const headers = admin ? obterCabecalhoAutenticacao() : undefined;
    return buscarLista(url, 'Falha ao buscar imagens do passo a passo', headers);
  },

  async buscarImagensCardAjuda(id, admin = false) {
    return this.getHelpCardImages(id, admin);
  },

  async uploadHelpCardImage(id, formData) {
    const res = await fetch(`${API_BASE_URL}/help-cards/${id}/images`, {
      method: 'POST',
      headers: { ...obterCabecalhoAutenticacao() },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'Erro ao enviar imagem');
    }
    const json = await res.json();
    return json.data;
  },

  async cadastrarImagemCardAjuda(id, formData) {
    return this.uploadHelpCardImage(id, formData);
  },

  async updateHelpCardImage(id, imagemId, dados) {
    return enviarJson(`${API_BASE_URL}/help-cards/${id}/images/${imagemId}`, 'PUT', dados, 'Erro ao atualizar imagem');
  },

  async atualizarImagemCardAjuda(id, imagemId, dados) {
    return this.updateHelpCardImage(id, imagemId, dados);
  },

  async deleteHelpCardImage(id, imagemId) {
    return enviarJson(`${API_BASE_URL}/help-cards/${id}/images/${imagemId}`, 'DELETE', undefined, 'Erro ao excluir imagem');
  },

  async excluirImagemCardAjuda(id, imagemId) {
    return this.deleteHelpCardImage(id, imagemId);
  },

  // ==========================================
  // MÉTODOS DE AUTENTICAÇÃO
  // ==========================================
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || err.mensagem || 'E-mail ou senha incorretos.');
    }

    const json = await res.json();
    const { user, token } = json.data;
    localStorage.setItem('ong_apia_token', token);
    localStorage.setItem('ong_apia_user', JSON.stringify(user));
    return { user, token };
  },

  async fazerLogin(email, senha) {
    return this.login(email, senha);
  },

  logout() {
    localStorage.removeItem('ong_apia_token');
    localStorage.removeItem('ong_apia_user');
  },

  fazerLogout() {
    this.logout();
  },

  getCurrentUser() {
    const armazenado = localStorage.getItem('ong_apia_user');
    if (!armazenado) return null;
    try {
      return JSON.parse(armazenado);
    } catch {
      return null;
    }
  },

  obterUsuarioAtual() {
    return this.getCurrentUser();
  },

  isAuthenticated() {
    return !!localStorage.getItem('ong_apia_token');
  },

  estaAutenticado() {
    return this.isAuthenticated();
  },
};
