import { getDB } from '../data/db';

export const authService = {
  login: async (email, password) => {
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const db = getDB();
    const user = db.users.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Email atau Password salah.');
    }

    if (!user.active) {
      throw new Error('Akun Anda dinonaktifkan. Silakan hubungi Superadmin.');
    }

    const dummyToken = `jwt-token-${user.id}-${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('token', dummyToken);
    
    const userSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      branchId: user.branchId
    };
    localStorage.setItem('user', JSON.stringify(userSession));

    return { token: dummyToken, user: userSession };
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getProfile: async () => {
    const user = authService.getCurrentUser();
    if (!user) throw new Error('Unauthorized');
    return user;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
