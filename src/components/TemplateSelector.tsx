import React, { useEffect, useState } from 'react';
import { Template } from '../types';
import { useAuth, useUser, useTemplates } from '../hooks/useZustandStore';

interface TemplateSelectorProps {
  selectedTemplateId?: string | null;
  onSelectTemplate?: (templateId: string) => void;
  disabled?: boolean;
  useStoreValues?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplateId: propSelectedTemplateId,
  onSelectTemplate,
  disabled = false,
  useStoreValues = true
}) => {
  const { isAuthenticated } = useAuth();
  const { hasGeminiApiKey } = useUser();
  const { 
    templates, 
    isLoadingTemplates, 
    selectedTemplateId: storeSelectedTemplateId,
    fetchTemplates,
    setSelectedTemplate: storeSetSelectedTemplate
  } = useTemplates();
  
  const [isLoading, setIsLoading] = useState(false);
  
  const selectedTemplateId = useStoreValues 
    ? storeSelectedTemplateId 
    : propSelectedTemplateId;
  
  const setSelectedTemplate = useStoreValues 
    ? storeSetSelectedTemplate
    : (onSelectTemplate || (() => {}));

  useEffect(() => {
    const loadTemplates = async () => {
      if (templates.length === 0 && !isLoadingTemplates) {
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

    if (isAuthenticated && hasGeminiApiKey) {
      loadTemplates();
    }
  }, [isAuthenticated, hasGeminiApiKey, templates.length, isLoadingTemplates, fetchTemplates]);

  useEffect(() => {
    if (!selectedTemplateId && templates.length > 0 && !isLoading) {
      const defaultTemplate: Template | undefined = templates.find((t: Template) => t.isDefault);
      if (defaultTemplate) {
        setSelectedTemplate(defaultTemplate._id);
      } else {
        setSelectedTemplate(templates[0]._id);
      }
    }
  }, [selectedTemplateId, templates, isLoading, setSelectedTemplate]);

  if (templates.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        {isLoading || isLoadingTemplates 
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
        onChange={(e) => setSelectedTemplate(e.target.value)}
        disabled={disabled || isLoading || isLoadingTemplates}
        className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
      >
        {templates.map((template: Template) => (
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