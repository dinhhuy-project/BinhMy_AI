import React from 'react';
import { SearchIcon, MicrophoneIcon } from './icons';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isSubmitDisabled: boolean;
  isRecording: boolean;
  onToggleRecording: () => void;
  isSpeechRecognitionSupported: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  query, 
  onQueryChange, 
  onSubmit, 
  isLoading, 
  isSubmitDisabled,
  isRecording,
  onToggleRecording,
  isSpeechRecognitionSupported
}) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isSubmitDisabled) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-3 w-full">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-6 w-6 text-brand-muted" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Đang nghe..." : "Tìm kiếm..."}
            className="w-full bg-white border-2 border-brand-border rounded-lg py-4 pl-14 pr-4 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all h-[60px] text-lg"
            disabled={isLoading || isRecording}
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={isSubmitDisabled || isLoading || isRecording}
          className="px-6 h-[60px] bg-brand-primary text-white font-bold rounded-lg active:bg-brand-primary-dark disabled:bg-brand-muted disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center text-base min-w-[100px]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Tìm
            </>
          ) : (
            'Tìm kiếm'
          )}
        </button>
      </div>
      {isSpeechRecognitionSupported && (
        <button
          type="button"
          onClick={onToggleRecording}
          disabled={isLoading && !isRecording}
          aria-label={isRecording ? "Dừng ghi âm" : "Tìm kiếm bằng giọng nói"}
          className={`w-full h-[60px] flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed font-bold text-base gap-3 ${
            isRecording 
            ? 'bg-red-500 text-white' 
            : 'bg-brand-secondary text-white'
          }`}
        >
          {isRecording && <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-300 opacity-75"></span>}
          <MicrophoneIcon className="h-8 w-8" />
          <span>{isRecording ? "Dừng ghi âm" : "🎤 Ghi âm"}</span>
        </button>
      )}
    </div>
  );
};