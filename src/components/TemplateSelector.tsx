import React, { useEffect, useState } from 'react';
import { Template } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface TemplateSelectorProps {
  selectedTemplateId: string | null;
  onSelectTemplate: (templateId: string) => void;
  disabled?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId,
  onSelectTemplate,
  disabled = false
}) => {
  const { state, fetchTemplates } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      if (state.templates.length === 0 && !state.isLoadingTemplates) {
        setIsLoading(true);
        try {
          await fetchTemplates();
        } catch (error) {
          console.error('Error loading templates:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (state.isAuthenticated && state.user?.hasGeminiApiKey) {
      loadTemplates();
    }
  }, [state.isAuthenticated, state.user?.hasGeminiApiKey, state.templates.length, state.isLoadingTemplates, fetchTemplates]);

  useEffect(() => {
    if (!selectedTemplateId && state.templates.length > 0 && !isLoading) {
      const defaultTemplate: Template | undefined = state.templates.find((t: Template) => t.isDefault);
      if (defaultTemplate) {
        onSelectTemplate(defaultTemplate._id);
      } else {
        onSelectTemplate(state.templates[0]._id);
      }
    }
  }, [selectedTemplateId, state.templates, isLoading, onSelectTemplate]);

  if (state.templates.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        {isLoading || state.isLoadingTemplates 
          ? 'Loading templates...' 
          : 'No templates available. Please create one in settings.'}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-1">
        Template
      </label>
      <select
        id="template-select"
        value={selectedTemplateId || ''}
        onChange={(e) => onSelectTemplate(e.target.value)}
        disabled={disabled || isLoading || state.isLoadingTemplates}
        className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
      >
        {state.templates.map((template: Template) => (
          <option key={template._id} value={template._id}>
            {template.name} {template.isDefault ? '(Default)' : ''}
          </option>
        ))}
      </select>
      <div className="mt-1 text-xs text-gray-500">
        {selectedTemplateId && (
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              chrome.runtime.openOptionsPage?.();
            }}
            className="text-primary-600 hover:text-primary-700"
          >
            Manage templates in settings
          </a>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;