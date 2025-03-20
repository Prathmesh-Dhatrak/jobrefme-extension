import React, { useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Template } from '../types';
import Loading from '../components/Loading';
import TemplatePreview from '../components/TemplatePreview';

const TemplatePage: React.FC = () => {
  const { state, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [view, setView] = useState<'list' | 'edit' | 'create' | 'preview'>('list');
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    isDefault: false
  });
  
  const [templatesLoaded, setTemplatesLoaded] = useState(false);
  
  useEffect(() => {
    const loadTemplates = async () => {
      if (!state.isLoadingTemplates && state.templates.length === 0 && !templatesLoaded) {
        setIsLoading(true);
        setTemplatesLoaded(true);
        
        try {
          await fetchTemplates();
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to load templates');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (state.isAuthenticated) {
      loadTemplates();
    }
  }, [state.isAuthenticated, state.isLoadingTemplates, state.templates.length, fetchTemplates, templatesLoaded]);

  useEffect(() => {
    if (state.templates.length > 0 && !activeTemplate && !state.isLoadingTemplates && !isLoading) {
      const defaultTemplate = state.templates.find(t => t.isDefault);
      setActiveTemplate(defaultTemplate || state.templates[0]);
    }
  }, [state.templates, activeTemplate, state.isLoadingTemplates, isLoading]);

  const handleEditClick = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      isDefault: template.isDefault
    });
    setView('edit');
  };

  const handleCreateClick = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      content: 'Hi [Connection Name],\n\nI hope this message finds you well. I noticed that {companyName} is hiring for the {jobTitle} position, and I\'m very interested in applying.\n\nI believe my experience with {skills} would make me a great fit for this role.\n\nWould you be willing to refer me for this position? I\'d be happy to share more details about my background and qualifications.\n\nThank you for considering my request.\n\nBest,\n[Your Name]',
      isDefault: false
    });
    setView('create');
  };

  const handlePreviewClick = (template: Template) => {
    setActiveTemplate(template);
    setView('preview');
  };

  const handleCancelEdit = () => {
    setEditingTemplate(null);
    setView('list');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isDefault: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (view === 'create') {
        const newTemplate = await createTemplate(formData);
        if (newTemplate) {
          setActiveTemplate(newTemplate);
        }
      } else if (view === 'edit' && editingTemplate) {
        const updatedTemplate = await updateTemplate(editingTemplate._id, formData);
        if (updatedTemplate) {
          setActiveTemplate(updatedTemplate);
        }
      }
      setView('list');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save template');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setIsLoading(true);
      try {
        await deleteTemplate(id);
        if (activeTemplate && activeTemplate._id === id) {
          setActiveTemplate(state.templates.find(t => t._id !== id) || null);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete template');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className="p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <p>You need to log in to manage templates.</p>
        </div>
      </div>
    );
  }

  const isTemplatesLoading = isLoading || state.isLoadingTemplates;

  const renderTemplateList = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Referral Templates</h2>
        <button 
          onClick={handleCreateClick}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 text-sm font-medium flex items-center gap-2"
          disabled={isTemplatesLoading}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          Add Template
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        Templates help you customize how your referral requests are generated. You can use placeholders like {'{jobTitle}'}, {'{companyName}'}, 
        and {'{skills}'} which will be replaced with actual job information.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {isTemplatesLoading ? (
        <div className="py-12 flex justify-center">
          <Loading />
        </div>
      ) : state.templates.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg border border-gray-200 text-center">
          <div className="mb-4">
            <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Templates Yet</h3>
          <p className="text-gray-500 mb-6">Create your first template to get started generating personalized referral requests.</p>
          <button 
            onClick={handleCreateClick}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors"
          >
            Create First Template
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {state.templates.map(template => (
            <div 
              key={template._id} 
              className={`bg-white rounded-lg shadow-sm border ${activeTemplate?._id === template._id ? 'border-primary-300 ring-1 ring-primary-300' : 'border-gray-200'} overflow-hidden transition-all hover:shadow-md cursor-pointer`}
              onClick={() => setActiveTemplate(template)}
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center">
                      {template.name}
                      {template.isDefault && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewClick(template);
                      }}
                      className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-gray-100"
                      title="Preview"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(template);
                      }}
                      className="text-gray-500 hover:text-primary-600 p-1 rounded hover:bg-gray-100"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(template._id);
                      }}
                      className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-gray-100"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50">
                <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap line-clamp-3 max-h-12 overflow-hidden">
                  {template.content}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  const renderTemplateForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{view === 'create' ? 'Create New Template' : 'Edit Template'}</h2>
        <button
          onClick={handleCancelEdit}
          className="text-gray-500 hover:text-gray-700 p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Template Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleFormChange}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            required
            placeholder="e.g., Professional Template"
          />
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Template Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleFormChange}
            rows={12}
            className="w-full p-3 border border-gray-300 rounded font-mono text-sm"
            required
          />
          
          <div className="mt-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex-grow">
              <p className="text-xs text-blue-700 font-medium">Available placeholders:</p>
              <ul className="text-xs text-blue-700 list-disc pl-5 mt-1">
                <li><span className="font-mono bg-blue-100 px-1 rounded">{'{jobTitle}'}</span> - Position title</li>
                <li><span className="font-mono bg-blue-100 px-1 rounded">{'{companyName}'}</span> - Company name</li>
                <li><span className="font-mono bg-blue-100 px-1 rounded">{'{skills}'}</span> - Required skills from job posting</li>
              </ul>
            </div>
            
            <div className="flex sm:flex-col gap-2 sm:items-center">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-primary-600 hover:text-primary-700 text-sm border border-primary-200 bg-primary-50 px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-primary-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
            </div>
          </div>
          
          {showPreview && (
            <div className="mt-4">
              <TemplatePreview content={formData.content} />
            </div>
          )}
        </div>
        
        <div className="pt-2 border-t border-gray-100">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Set as default template</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            The default template will be used when generating referral requests.
          </p>
        </div>
        
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-primary-600 text-white px-5 py-2 rounded hover:bg-primary-700 text-sm font-medium flex items-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Save Template
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleCancelEdit}
            className="border border-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-100 text-sm font-medium"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const renderTemplatePreview = () => {
    if (!activeTemplate) return null;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Template Preview</h2>
          <button
            onClick={() => setView('list')}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-gray-900 text-lg">{activeTemplate.name}</h3>
              {activeTemplate.isDefault && (
                <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                  Default Template
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(activeTemplate)}
                className="text-primary-600 hover:text-primary-700 border border-primary-200 bg-primary-50 px-3 py-1.5 rounded-md text-sm flex items-center gap-1 hover:bg-primary-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Edit
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Created: {new Date(activeTemplate.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Raw Template:</p>
          <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 p-3 bg-white border border-gray-100 rounded-md">
            {activeTemplate.content}
          </pre>
        </div>
        
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-3">Preview with sample data:</h4>
          <TemplatePreview 
            content={activeTemplate.content} 
            jobTitle="Full Stack Developer"
            companyName="Acme Technologies"
            skills="React, Node.js, TypeScript, MongoDB"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {view === 'list' && renderTemplateList()}
      {(view === 'create' || view === 'edit') && renderTemplateForm()}
      {view === 'preview' && renderTemplatePreview()}
    </div>
  );
};

export default TemplatePage;