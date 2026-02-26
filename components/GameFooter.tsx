'use client';

import { motion } from 'framer-motion';

interface GameFooterProps {
    nextEnabled: boolean;
    onNext: () => void;
    onCancel: () => void;
}

export default function GameFooter({ nextEnabled, onNext, onCancel }: GameFooterProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4 pt-4"
        >
            <button
                onClick={onCancel}
                className="px-6 py-2.5 rounded-xl font-semibold text-sm
          bg-white/5 border border-white/10 text-gray-300
          hover:bg-white/10 hover:text-white transition-all duration-200
          cursor-pointer"
            >
                Cancel
            </button>
            <button
                onClick={onNext}
                disabled={!nextEnabled}
                className={`px-8 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer
          ${nextEnabled
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-105'
                        : 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed'
                    }
        `}
            >
                Next →
            </button>
        </motion.div>
    );
}
