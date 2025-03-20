import React from 'react';

interface TemplatePreviewProps {
  content: string;
  jobTitle?: string;
  companyName?: string;
  skills?: string;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  content,
  jobTitle = "Software Engineer",
  companyName = "Tech Innovations",
  skills = "React, TypeScript, Node.js"
}) => {
  const previewContent = content
    .replace(/{jobTitle}/g, jobTitle)
    .replace(/{companyName}/g, companyName)
    .replace(/{skills}/g, skills);

  return (
    <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
      <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
      <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 max-h-40 overflow-y-auto">
        {previewContent}
      </pre>
    </div>
  );
};

export default TemplatePreview;