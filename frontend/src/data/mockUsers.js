import { ROLES } from '../utils/constants';

export const mockUsers = [
  { id: 'u1', name: 'Ahmed Raza', email: 'customer@demo.com', password: 'password123', role: ROLES.CUSTOMER, avatar: null, phone: '+92 300 1112233', workshop: 'AutoNova Lahore' },
  { id: 'u2', name: 'Sara Khan', email: 'reception@demo.com', password: 'password123', role: ROLES.RECEPTIONIST, avatar: null, phone: '+92 300 2223344', workshop: 'AutoNova Lahore' },
  { id: 'u3', name: 'Bilal Hussain', email: 'mechanic@demo.com', password: 'password123', role: ROLES.MECHANIC, avatar: null, phone: '+92 300 3334455', workshop: 'AutoNova Lahore' },
  { id: 'u4', name: 'Fatima Sheikh', email: 'admin@demo.com', password: 'password123', role: ROLES.ADMIN, avatar: null, phone: '+92 300 4445566', workshop: 'AutoNova Lahore' },
];
