import { apiClient } from './apiClient';

/** Maps to PATCH /api/users/me. */
export const userService = {
  async updateMe(payload) {
    const res = await apiClient.patch('/users/me', payload);
    return res.data;
  },
};
