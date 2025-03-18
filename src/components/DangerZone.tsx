import React from 'react';

interface DangerZoneProps {
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
}

const DangerZone: React.FC<DangerZoneProps> = ({
  title,
  description,
  buttonText,
  onAction
}) => {
  return (
    <div className="mt-6 border border-red-200 rounded-md overflow-hidden">
      <div className="bg-red-50 px-4 py-2">
        <h3 className="text-sm font-medium text-red-800">Danger Zone</h3>
      </div>
      <div className="p-4 border-t border-red-200">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-medium text-gray-900">{title}</h4>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <button
            onClick={onAction}
            className="px-4 py-2 bg-white border border-red-300 rounded-md text-xs font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 whitespace-nowrap"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DangerZone;