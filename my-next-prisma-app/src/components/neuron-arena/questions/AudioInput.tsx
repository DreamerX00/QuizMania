import React, { useRef, useState, useEffect } from 'react';
import { useQuizStore } from '../state/quizStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import WaveSurfer from 'wavesurfer.js';

const AudioInput = ({ question }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(null);
  const [waveform, setWaveform] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const setResponse = useQuizStore((s) => s.setResponse);
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const maxSize = (question.fileSizeLimitMB || 20) * 1024 * 1024;
  const maxDuration = question.maxDurationSeconds || 180;

  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      if (waveform) waveform.destroy();
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#7f5af0',
        progressColor: '#00C2FF',
        height: 48,
        barWidth: 2,
        responsive: true,
      });
      ws.load(audioUrl);
      setWaveform(ws);
      return () => ws.destroy();
    }
  }, [audioUrl]);

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > maxSize) {
      setError(`File too large. Max ${question.fileSizeLimitMB || 20}MB.`);
      return;
    }
    setFile(f);
    setError('');
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
    setResponse({
      id: question.id,
      type: question.type,
      answer: url,
      requiresManualReview: true,
      metadata: {
        submittedAt: new Date().toISOString(),
        fileUrl: url,
        filename: f.name,
      },
    });
    toast('Audio uploaded! Manual review required.', { icon: '🎤' });
  }

  function handleLoadedMetadata(e) {
    const dur = e.currentTarget.duration;
    setDuration(dur);
    if (dur > maxDuration) {
      setError(`Audio too long. Max ${maxDuration} seconds.`);
    } else {
      setError('');
    }
    setResponse((prev) => ({
      ...prev,
      metadata: { ...prev?.metadata, duration: dur },
    }));
  }

  function handleRemove() {
    setFile(null);
    setAudioUrl('');
    setDuration(null);
    setWaveform(null);
    setResponse({
      id: question.id,
      type: question.type,
      answer: '',
      requiresManualReview: true,
      metadata: { submittedAt: new Date().toISOString() },
    });
    toast('Audio removed.', { icon: '🗑️' });
  }

  return (
    <section role="region" aria-labelledby="audio-title" className="flex flex-col gap-4">
      <div id="audio-title" className="font-heading text-lg mb-2 flex items-center gap-2">
        {question.question}
        <span tabIndex={0} className="ml-2 text-xs bg-yellow-400/20 text-yellow-700 px-2 py-1 rounded cursor-help" title="This question requires human evaluation.">🕒 Manual Review</span>
      </div>
      <label htmlFor="audio-upload" className="block text-sm font-medium mb-1">Upload audio response</label>
      <input
        id="audio-upload"
        type="file"
        accept="audio/*"
        onChange={handleFile}
        aria-label="Upload audio response"
        className="focus:ring-2 focus:ring-[var(--primary-accent)] rounded"
      />
      {file && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex flex-col gap-2">
          <audio
            ref={audioRef}
            src={audioUrl}
            controls
            onLoadedMetadata={handleLoadedMetadata}
            aria-label="Audio preview"
          />
          <div ref={waveformRef} className="w-full" aria-label="Audio waveform preview" />
          <div className="flex items-center gap-4 text-xs text-white/60 mt-1">
            <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            {duration && <motion.span animate={{ scale: [1, 1.1, 1] }} className="text-blue-300">Duration: {Math.floor(duration / 60)}m {Math.round(duration % 60)}s</motion.span>}
            <button onClick={handleRemove} className="ml-auto px-2 py-1 rounded bg-red-500/20 text-red-400 focus:ring-2 focus:ring-red-400" aria-label="Remove audio file">Remove</button>
          </div>
          <div className="text-xs text-yellow-400 mt-1">This file is stored locally and will be uploaded during final submission.</div>
        </motion.div>
      )}
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">{error}</motion.div>}
    </section>
  );
};

export default AudioInput; 