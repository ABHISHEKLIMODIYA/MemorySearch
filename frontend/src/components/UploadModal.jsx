import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UploadModal({ onClose, onDatasetUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadedStats, setUploadedStats] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/upload-dataset", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      const data = await res.json();
      setUploadedStats(data);
      setSuccess(true);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
      
      if (onDatasetUploaded) {
        onDatasetUploaded(data);
      }
    } catch (err) {
      setError(err.message || "Failed to upload and index dataset. Check file format.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      
      <div className="relative w-full max-w-lg glass-panel-glow rounded-3xl p-6 sm:p-8 border border-blue-500/40 shadow-2xl animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b dark:border-slate-800 light:border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold dark:text-white light:text-slate-900">
                Upload Custom Chat Dataset
              </h3>
              <p className="text-xs text-slate-400">
                Supports WhatsApp (.zip, .txt) & Structured Exports (.jsonl, .json, .csv)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full dark:bg-slate-800 light:bg-slate-100 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content View */}
        {!success ? (
          <div className="space-y-4">
            
            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed dark:border-slate-700 light:border-slate-300 rounded-2xl p-6 text-center hover:border-blue-500 transition-all bg-slate-900/40 light:bg-slate-50 cursor-pointer"
              onClick={() => document.getElementById("file-input").click()}
            >
              <FileText className="w-10 h-10 text-blue-400 mx-auto mb-3 animate-bounce" />
              <p className="text-xs font-semibold dark:text-slate-200 light:text-slate-800 mb-1">
                {file ? file.name : "Drag & drop your chat export (.zip, .txt, .jsonl, .json, .csv)"}
              </p>
              <p className="text-[11px] text-slate-400">
                Supports WhatsApp ZIP exports (_chat.txt) & TXT chat logs
              </p>
              <input
                id="file-input"
                type="file"
                accept=".zip,.txt,.jsonl,.json,.csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800 light:border-slate-200">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleUploadSubmit}
                disabled={!file || uploading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-40"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Indexing Vector Store...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Upload & Re-Index Chat</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="py-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-scale-in" />
            <h4 className="text-lg font-bold dark:text-white light:text-slate-900">
              Dataset Uploaded & Vector Store Re-Indexed!
            </h4>
            <p className="text-xs text-slate-400">
              Processed <span className="font-bold text-blue-400">{uploadedStats?.message_count || "custom"}</span> messages into ChromaDB & BM25 index.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
            >
              Start Searching Custom Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
