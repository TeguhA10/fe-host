import { getDB, saveDB } from '../data/db';

export const userService = {
  getAll: async () => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    return db.users || [];
  },

  create: async (userData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();

    // Check if email already exists
    const emailExists = db.users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
      throw new Error('Email sudah terdaftar.');
    }

    const nextId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: nextId,
      email: userData.email,
      password: userData.password || 'password123',
      name: userData.name,
      roleId: userData.roleId,
      branchId: parseInt(userData.branchId),
      active: true
    };

    db.users.push(newUser);
    saveDB(db);
    return newUser;
  },

  update: async (id, userData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.users.findIndex(u => u.id === parseInt(id));

    if (index === -1) throw new Error('User tidak ditemukan');

    // Check email uniqueness if email is changing
    const emailExists = db.users.some(u => u.id !== parseInt(id) && u.email.toLowerCase() === userData.email.toLowerCase());
    if (emailExists) {
      throw new Error('Email sudah terdaftar.');
    }

    db.users[index] = {
      ...db.users[index],
      email: userData.email,
      name: userData.name,
      roleId: userData.roleId,
      branchId: parseInt(userData.branchId),
      // Only update password if provided
      ...(userData.password ? { password: userData.password } : {})
    };

    saveDB(db);
    return db.users[index];
  },

  toggleActive: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    const index = db.users.findIndex(u => u.id === parseInt(id));

    if (index === -1) throw new Error('User tidak ditemukan');

    // Protect against self-deactivation
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser && currentUser.id === parseInt(id)) {
      throw new Error('Anda tidak dapat menonaktifkan akun Anda sendiri.');
    }

    db.users[index].active = !db.users[index].active;
    saveDB(db);
    return db.users[index];
  }
};
