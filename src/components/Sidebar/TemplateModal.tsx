import { TEMPLATES } from '../../utils/templates';

type TemplateModalProps = {
  templates: typeof TEMPLATES;
  onClose: () => void;
  onCreateNote: (content: string) => void;
};

export function TemplateModal({ templates, onClose, onCreateNote }: TemplateModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-sand dark:bg-charcoal rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold dark:text-fog">Choose a Template</h2>
          <button 
            onClick={onClose}
            className="text-shadow hover:text-ink dark:text-fog dark:hover:text-smoke"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onCreateNote(template.content);
                onClose();
              }}
              className="p-4 border border-mist dark:border-stone rounded text-left hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-medium dark:text-fog">{template.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {template.content.split('\n')[0]}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
