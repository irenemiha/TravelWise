import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmă",
  cancelText = "Anulează",
  variant = "danger",
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop / Fundal întunecat */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Containerul Modalului */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
          >
            {/* Buton închidere (X) */}
            <button
              onClick={onCancel}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 pt-10 flex flex-col items-center text-center">
              {/* Iconiță de avertizare */}
              <div
                className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg ${
                  variant === "danger"
                    ? "bg-red-50 dark:bg-red-900/20 text-red-600"
                    : "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                }`}
              >
                <AlertCircle className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                {title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex flex-col w-full gap-3">
                {/* Buton Acțiune Principală */}
                <button
                  onClick={onConfirm}
                  className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 shadow-xl ${
                    variant === "danger"
                      ? "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20"
                  }`}
                >
                  {confirmText}
                </button>

                {/* Buton Anulare */}
                <button
                  onClick={onCancel}
                  className="w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
                >
                  {cancelText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}