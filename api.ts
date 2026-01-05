
import { AuthResponse } from './types';

const BASE_URL = 'http://localhost:8000';

const getHeaders = (isMultipart = false) => {
  const token = localStorage.getItem('access_token');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

export const api = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`
      }
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    return {
      access_token: data.access_token || data.token,
      token_type: data.token_type || 'bearer'
    };
  },

  async register(data: any) {
    // Assuming standard /api/auth/register endpoint as registration is required but endpoint wasn't specified
    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },

  async getTasks(filters?: string) {
    const url = filters ? `${BASE_URL}/api/tasks/filter?${filters}` : `${BASE_URL}/api/tasks/`;
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return response.json();
  },

  async getTask(id: number) {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch task');
    return response.json();
  },

  async createTask(data: any) {
    const response = await fetch(`${BASE_URL}/api/tasks/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateTask(id: number, data: any) {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteTask(id: number) {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.ok;
  },

  async getCategories() {
    const response = await fetch(`${BASE_URL}/api/categories/`, { headers: getHeaders() });
    return response.json();
  },

  async createCategory(formData: FormData) {
    const response = await fetch(`${BASE_URL}/api/categories/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return response.json();
  },

  async updateCategory(id: number, formData: FormData) {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: formData
    });
    return response.json();
  },

  async deleteCategory(id: number) {
    const response = await fetch(`${BASE_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return response.ok;
  },

  async getProfile() {
    const response = await fetch(`${BASE_URL}/api/users/profile`, { headers: getHeaders() });
    
    // Handle 403 Forbidden for admins by falling back to admin user list
    if (response.status === 403) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) throw new Error('No token');
        
        // Decode token to get user_id
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id;

        const usersResponse = await fetch(`${BASE_URL}/api/admin/users`, { headers: getHeaders() });
        if (!usersResponse.ok) throw new Error('Admin fallback failed');
        
        const users = await usersResponse.json();
        const me = users.find((u: any) => u.user_id === userId);
        
        if (!me) throw new Error('User not found in admin list');
        
        return {
          user: me,
          result: { task_count: 0, task_todo: 0, task_doing: 0, task_done: 0 }
        };
      } catch (e) {
        throw new Error('Failed to fetch profile (admin fallback failed)');
      }
    }

    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  async getSubtask(id: number) {
    const response = await fetch(`${BASE_URL}/api/subtask/${id}`, { headers: getHeaders() });
    return response.json();
  },

  async createSubtask(data: any) {
    const response = await fetch(`${BASE_URL}/api/subtask/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async updateSubtask(id: number, data: any) {
    const response = await fetch(`${BASE_URL}/api/subtask/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async deleteSubtask(id: number) {
    await fetch(`${BASE_URL}/api/subtask/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  async createAttachment(formData: FormData) {
    const response = await fetch(`${BASE_URL}/api/attechment/`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return response.json();
  },

  async getAttachment(id: number) {
    const response = await fetch(`${BASE_URL}/api/attechment/${id}`, { headers: getHeaders() });
    return response.json();
  },

  async deleteAttachment(id: number) {
    await fetch(`${BASE_URL}/api/attechment/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  },

  // Admin endpoints
  async adminGetUsers() {
    const response = await fetch(`${BASE_URL}/api/admin/users`, { headers: getHeaders() });
    return response.json();
  },

  async adminGetUsersDetails() {
    const response = await fetch(`${BASE_URL}/api/admin/users_detalies`, { headers: getHeaders() });
    return response.json();
  },

  async adminUpdateUser(userId: number, data: any) {
    const response = await fetch(`${BASE_URL}/api/admin/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async adminFilterTasks() {
    const response = await fetch(`${BASE_URL}/api/admin/filter_by_task`, { headers: getHeaders() });
    return response.json();
  }
};
