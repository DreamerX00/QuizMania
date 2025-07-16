import React, { useRef, useState, useEffect } from 'react';
import { useQuizStore } from '../state/quizStore';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const VideoInput = ({ question }) => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [duration, setDuration] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const setResponse = useQuizStore((s) => s.setResponse);
  const videoRef = useRef(null);
  const maxSize = (question.fileSizeLimitMB || 20) * 1024 * 1024;
  const maxDuration = question.maxDurationSeconds || 180;

  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.onloadeddata = () => {
        // Generate thumbnail
        try {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          canvas.getContext('2d').drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          setThumbnail(canvas.toDataURL('image/png'));
        } catch {}
      };
    }
  }, [videoUrl]);

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
    setVideoUrl(url);
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
    toast('Video uploaded! Manual review required.', { icon: '🎥' });
  }

  function handleLoadedMetadata(e) {
    const dur = e.currentTarget.duration;
    setDuration(dur);
    if (dur > maxDuration) {
      setError(`Video too long. Max ${maxDuration} seconds.`);
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
    setVideoUrl('');
    setDuration(null);
    setThumbnail('');
    setResponse({
      id: question.id,
      type: question.type,
      answer: '',
      requiresManualReview: true,
      metadata: { submittedAt: new Date().toISOString() },
    });
    toast('Video removed.', { icon: '🗑️' });
  }

  return (
    <section role="region" aria-labelledby="video-title" className="flex flex-col gap-4">
      <div id="video-title" className="font-heading text-lg mb-2 flex items-center gap-2">
        {question.question}
        <span tabIndex={0} className="ml-2 text-xs bg-yellow-400/20 text-yellow-700 px-2 py-1 rounded cursor-help" title="This question requires human evaluation.">🕒 Manual Review</span>
      </div>
      <label htmlFor="video-upload" className="block text-sm font-medium mb-1">Upload video response</label>
      <input
        id="video-upload"
        type="file"
        accept="video/*"
        onChange={handleFile}
        aria-label="Upload video response"
        className="focus:ring-2 focus:ring-[var(--primary-accent)] rounded"
      />
      {file && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex flex-col gap-2">
          {thumbnail && <img src={thumbnail} alt="Video thumbnail" className="rounded w-40 h-24 object-cover border border-white/10 mb-2" />}
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            muted
            width={320}
            poster={thumbnail}
            onLoadedMetadata={handleLoadedMetadata}
            aria-label="Video preview"
            className="rounded"
          >
            Sorry, your browser does not support embedded videos.
          </video>
          <div className="flex items-center gap-4 text-xs text-white/60 mt-1">
            <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            {duration && <motion.span animate={{ scale: [1, 1.1, 1] }} className="text-blue-300">Duration: {Math.floor(duration / 60)}m {Math.round(duration % 60)}s</motion.span>}
            <button onClick={handleRemove} className="ml-auto px-2 py-1 rounded bg-red-500/20 text-red-400 focus:ring-2 focus:ring-red-400" aria-label="Remove video file">Remove</button>
          </div>
          <div className="text-xs text-yellow-400 mt-1">This file is stored locally and will be uploaded during final submission.</div>
        </motion.div>
      )}
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">{error}</motion.div>}
    </section>
  );
};

export default VideoInput; 