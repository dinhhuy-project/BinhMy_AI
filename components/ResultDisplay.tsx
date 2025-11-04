import React from 'react';
import type { MatchResult } from '../types';
import Spinner from './Spinner';

interface ResultDisplayProps {
  result: MatchResult | null;
  isLoading: boolean;
  imageCount: number;
  onImageClick: () => void;
}

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-gray-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <circle
          className="text-brand-primary"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-brand-primary-dark">
        {score}
      </span>
    </div>
  );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, isLoading, imageCount, onImageClick }) => {
  if (isLoading) {
    return (
      <div 
        className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg p-8 animate-fade-in shadow-sm border border-brand-border"
        aria-live="polite"
        aria-busy="true"
      >
        <Spinner />
        <p className="mt-4 text-lg text-brand-muted">AI đang phân tích các hình ảnh...</p>
        <p className="text-sm text-brand-muted">Việc này có thể mất một chút thời gian.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg p-6 animate-slide-in shadow-sm border border-brand-border" aria-live="polite">
        <h3 className="text-2xl font-bold text-brand-primary-dark mb-4">Đã tìm thấy ảnh phù hợp nhất!</h3>
        <div className="flex flex-col lg:flex-row items-center gap-6 w-full">
            <button onClick={onImageClick} className="flex-shrink-0 focus:outline-none focus:ring-4 focus:ring-brand-primary rounded-lg" aria-label="Xem ảnh toàn màn hình">
                <img src={result.image.base64} alt="Best match" className="rounded-lg shadow-lg max-w-xs md:max-w-sm max-h-80 object-contain hover:opacity-80 transition-opacity" />
            </button>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <ScoreRing score={result.score} />
                <p className="mt-4 text-lg font-semibold text-brand-muted">Điểm phù hợp</p>
                <p className="mt-2 text-brand-text italic">"{result.reason}"</p>
                <p className="text-xs mt-4 text-brand-muted tracking-wide">Tên tệp: {result.image.file.name}</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-lg p-8 text-center shadow-sm border border-brand-border" aria-live="polite">
      <h3 className="text-2xl font-bold text-brand-primary-dark">Sẵn sàng tìm kiếm</h3>
      <p className="mt-2 text-brand-muted">
        {imageCount > 0 
          ? "Nhập mô tả ở trên để tìm ảnh phù hợp nhất từ kho của bạn."
          : "Tải lên một vài tấm ảnh để bắt đầu."}
      </p>
    </div>
  );
};