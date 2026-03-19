import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function Modal({ isOpen, onClose, onConfirm, title, message }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white dark:bg-charcoal rounded-lg overflow-hidden shadow-lg w-[320px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-mist dark:border-stone">
              <h3 className="font-mono text-sm text-ink dark:text-fog">{title}</h3>
              <p className="mt-1 text-xs font-mono text-shadow/60 dark:text-smoke/60">{message}</p>
            </div>
            <div className="flex justify-end gap-2 p-3">
              <button
                onClick={onClose}
                className="text-xs font-mono px-3 py-1.5 rounded-md hover:bg-white/60 dark:hover:bg-stone/40 transition-colors duration-150 text-shadow/60 dark:text-smoke/60"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="text-xs font-mono px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-150 text-red-400 dark:text-red-400"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}