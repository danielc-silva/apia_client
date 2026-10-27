const API_BASE_URL = '/api';

// Retorna os headers de autorização com o token JWT se o usuário estiver logado
function obterCabecalhoAutenticacao() {
  const token = localStorage.getItem('ong_apia_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // ==========================================
  // MÉTODOS DE ANIMAIS
  // ==========================================
  async getAnimals(filters) {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v && v !== 'todos') params.append(k, v);
        });
      }

      const res = await fetch(`${API_BASE_URL}/animals?${params.toString()}`);
      if (!res.ok) throw new Error('Falha ao buscar animais do servidor');
      const data = await res.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch {
      return [];
    }
  },

  async buscarAnimais(filtros) {
    return this.getAnimals(filtros);
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
    try {
      const res = await fetch(`${API_BASE_URL}/events${all ? '?all=true' : ''}`);
      if (!res.ok) throw new Error('Falha ao buscar eventos');
      const data = await res.json();
      return Array.isArray(data.data) ? data.data : [];
    } catch {
      return [];
    }
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
