import axios from 'axios';
import authService from './authService';
import { Template } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Get all templates for the current user
 */
export async function fetchTemplates(): Promise<Template[]> {
  try {
    const { data } = await api.get('/user/templates');
    return data.data || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch templates: ${error.response?.data?.error || error.message}`);
    }
    throw new Error('Failed to fetch templates: Unknown error');
  }
}

/**
 * Get the default template
 */
export async function fetchDefaultTemplate(): Promise<Template | null> {
  try {
    const { data } = await api.get('/user/templates/default');
    return data.data || null;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch default template: ${error.response?.data?.error || error.message}`);
    }
    throw new Error('Failed to fetch default template: Unknown error');
  }
}

/**
 * Create a new template
 */
export async function createTemplate(template: {
  name: string;
  content: string;
  isDefault: boolean;
}): Promise<Template> {
  try {
    const { data } = await api.post('/user/templates', template);
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to create template: ${error.response?.data?.error || error.message}`);
    }
    throw new Error('Failed to create template: Unknown error');
  }
}

/**
 * Update an existing template
 */
export async function updateTemplate(
  id: string,
  template: { name?: string; content?: string; isDefault?: boolean }
): Promise<Template> {
  try {
    const { data } = await api.put(`/user/templates/${id}`, template);
    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to update template: ${error.response?.data?.error || error.message}`);
    }
    throw new Error('Failed to update template: Unknown error');
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string): Promise<boolean> {
  try {
    const { data } = await api.delete(`/user/templates/${id}`);
    return data.success;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to delete template: ${error.response?.data?.error || error.message}`);
    }
    throw new Error('Failed to delete template: Unknown error');
  }
}