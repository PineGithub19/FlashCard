'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageUploaderProps {
    imageSource: string;
    onImageChange: (source: string) => void;
}

type InputMode = 'upload' | 'url';

export default function ImageUploader({ imageSource, onImageChange }: ImageUploaderProps) {
    const [mode, setMode] = useState<InputMode>('upload');
    const [urlInput, setUrlInput] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                onImageChange(e.target.result as string);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    };

    const handleUrlSubmit = () => {
        if (urlInput.trim()) {
            onImageChange(urlInput.trim());
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Hidden Image
            </label>

            {/* Tab Switcher */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit">
                {(['upload', 'url'] as InputMode[]).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
              ${mode === m
                                ? 'bg-violet-500/80 text-white shadow-md'
                                : 'text-gray-400 hover:text-white'
                            }
            `}
                    >
                        {m === 'upload' ? '📁 Upload File' : '🔗 Enter URL'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {mode === 'upload' ? (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                    >
                        <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-200
                ${dragOver
                                    ? 'border-violet-400 bg-violet-500/10'
                                    : 'border-white/10 bg-white/5 hover:border-violet-400/50 hover:bg-white/10'
                                }
              `}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                                className="hidden"
                            />
                            <div className="text-4xl mb-2">🖼️</div>
                            <p className="text-gray-400 text-sm">
                                Drop an image here or <span className="text-violet-400 font-medium">browse</span>
                            </p>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="url"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex gap-2"
                    >
                        <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white
                placeholder-gray-500 focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400
                transition-all duration-200"
                        />
                        <button
                            type="button"
                            onClick={handleUrlSubmit}
                            className="px-5 py-3 rounded-xl bg-violet-500/80 text-white font-medium
                hover:bg-violet-500 transition-all duration-200 cursor-pointer"
                        >
                            Load
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Preview */}
            <AnimatePresence>
                {imageSource && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative overflow-hidden rounded-xl border border-white/10"
                    >
                        <img
                            src={imageSource}
                            alt="Preview"
                            className="w-full max-h-60 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        <span className="absolute bottom-3 left-3 text-xs text-gray-300 bg-black/40 px-2 py-1 rounded-lg">
                            ✓ Image loaded
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
