import { StateCreator } from 'zustand';
import axios from 'axios';
import { StoreState } from './index';
import { Template } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface TemplateSlice {
  templates: Template[];
  isLoadingTemplates: boolean;
  templateError: string | null;
  selectedTemplateId: string | null;
  
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: { name: string; content: string; isDefault: boolean }) => Promise<Template | null>;
  updateTemplate: (id: string, template: { name?: string; content?: string; isDefault?: boolean }) => Promise<Template | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  setSelectedTemplate: (templateId: string | null) => void;
}

export const createTemplateSlice: StateCreator<
  StoreState,
  [],
  [],
  TemplateSlice
> = (set, get, _store) => ({
  templates: [],
  isLoadingTemplates: false,
  templateError: null,
  selectedTemplateId: null,
  
  fetchTemplates: async () => {
    const { getAuthToken, isAuthenticated } = get();
    
    if (!isAuthenticated) {
      set({ templateError: 'Authentication required. Please log in to continue.' });
      return;
    }
    
    try {
      set({ isLoadingTemplates: true, templateError: null });
      
      const token = getAuthToken();
      const response = await axios.get(
        `${API_BASE_URL}/user/templates`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const templates = response.data.data || [];
      set({ templates });
      
      const { selectedTemplateId } = get();
      if (!selectedTemplateId && templates.length > 0) {
        const defaultTemplate = templates.find((t: Template) => t.isDefault);
        if (defaultTemplate) {
          set({ selectedTemplateId: defaultTemplate._id });
        } else {
          set({ selectedTemplateId: templates[0]._id });
        }
      }
      
    } catch (error) {
      set({
        templateError: error instanceof Error ? error.message : 'Failed to fetch templates'
      });
    } finally {
      set({ isLoadingTemplates: false });
    }
  },
  
  createTemplate: async (template: { name: string; content: string; isDefault: boolean }) => {
    const { getAuthToken, isAuthenticated } = get();
    
    if (!isAuthenticated) {
      set({ templateError: 'Authentication required. Please log in to continue.' });
      return null;
    }
    
    try {
      set({ isLoadingTemplates: true, templateError: null });
      
      const token = getAuthToken();
      const response = await axios.post(
        `${API_BASE_URL}/user/templates`,
        template,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const newTemplate = response.data.data;
      
      set(state => {
        const updatedTemplates = [...state.templates];
        
        if (template.isDefault) {
          updatedTemplates.forEach(t => {
            if (t._id !== newTemplate._id) {
              t.isDefault = false;
            }
          });
        }
        
        updatedTemplates.push(newTemplate);
        
        return { templates: updatedTemplates };
      });
      
      return newTemplate;
    } catch (error) {
      set({
        templateError: error instanceof Error ? error.message : 'Failed to create template'
      });
      return null;
    } finally {
      set({ isLoadingTemplates: false });
    }
  },

  updateTemplate: async (id: string, template: { name?: string; content?: string; isDefault?: boolean }) => {
    const { getAuthToken, isAuthenticated } = get();
    
    if (!isAuthenticated) {
      set({ templateError: 'Authentication required. Please log in to continue.' });
      return null;
    }
    
    try {
      set({ isLoadingTemplates: true, templateError: null });
      
      const token = getAuthToken();
      const response = await axios.put(
        `${API_BASE_URL}/user/templates/${id}`,
        template,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      const updatedTemplate = response.data.data;
      
      set(state => {
        const updatedTemplates = state.templates.map(t => {
          if (t._id === id) {
            return updatedTemplate;
          }
          
          if (template.isDefault && updatedTemplate.isDefault && t._id !== id) {
            return { ...t, isDefault: false };
          }
          
          return t;
        });
        
        return { templates: updatedTemplates };
      });
      
      return updatedTemplate;
    } catch (error) {
      set({
        templateError: error instanceof Error ? error.message : 'Failed to update template'
      });
      return null;
    } finally {
      set({ isLoadingTemplates: false });
    }
  },
  
  deleteTemplate: async (id: string) => {
    const { getAuthToken, isAuthenticated } = get();
    
    if (!isAuthenticated) {
      set({ templateError: 'Authentication required. Please log in to continue.' });
      return false;
    }
    
    try {
      set({ isLoadingTemplates: true, templateError: null });
      
      const token = getAuthToken();
      const response = await axios.delete(
        `${API_BASE_URL}/user/templates/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        set(state => {
          const updatedTemplates = state.templates.filter(t => t._id !== id);
          
          let updatedSelectedId = state.selectedTemplateId;
          if (updatedSelectedId === id && updatedTemplates.length > 0) {
            const defaultTemplate = updatedTemplates.find(t => t.isDefault);
            updatedSelectedId = defaultTemplate ? defaultTemplate._id : updatedTemplates[0]._id;
          } else if (updatedTemplates.length === 0) {
            updatedSelectedId = null;
          }
          
          return { 
            templates: updatedTemplates,
            selectedTemplateId: updatedSelectedId
          };
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      set({
        templateError: error instanceof Error ? error.message : 'Failed to delete template'
      });
      return false;
    } finally {
      set({ isLoadingTemplates: false });
    }
  },
  
  setSelectedTemplate: (templateId: string | null) => {
    set({ selectedTemplateId: templateId });
  }
});