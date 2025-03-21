import { StateCreator } from 'zustand';
import axios from 'axios';
import { StoreState } from './index';
import { Template } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Define the Template slice of the store
export interface TemplateSlice {
  // State
  templates: Template[];
  isLoadingTemplates: boolean;
  templateError: string | null;
  selectedTemplateId: string | null;
  
  // Actions
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: { name: string; content: string; isDefault: boolean }) => Promise<Template | null>;
  updateTemplate: (id: string, template: { name?: string; content?: string; isDefault?: boolean }) => Promise<Template | null>;
  deleteTemplate: (id: string) => Promise<boolean>;
  setSelectedTemplate: (templateId: string | null) => void;
}

// Create the template slice
export const createTemplateSlice: StateCreator<
  StoreState,
  [],
  [],
  TemplateSlice
> = (set, get, _store) => ({
  // Initial state
  templates: [],
  isLoadingTemplates: false,
  templateError: null,
  selectedTemplateId: null,
  
  // Fetch all templates
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
      
      // If there's no selected template and we have templates, select the default one
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
  
  // Create a new template
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
      
      // Update templates in state
      set(state => {
        const updatedTemplates = [...state.templates];
        
        // If this is a default template, remove default status from others
        if (template.isDefault) {
          updatedTemplates.forEach(t => {
            if (t._id !== newTemplate._id) {
              t.isDefault = false;
            }
          });
        }
        
        // Add the new template
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
  
  // Update an existing template
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
      
      // Update templates in state
      set(state => {
        const updatedTemplates = state.templates.map(t => {
          if (t._id === id) {
            return updatedTemplate;
          }
          
          // If this template is now the default, update others accordingly
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
  
  // Delete a template
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
        // Remove deleted template from state
        set(state => {
          const updatedTemplates = state.templates.filter(t => t._id !== id);
          
          // If the deleted template was selected, select another one
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
  
  // Set the selected template
  setSelectedTemplate: (templateId: string | null) => {
    set({ selectedTemplateId: templateId });
  }
});