import React from 'react';

interface SpinnerProps {
  size?: number; // px
  thickness?: number; // px
  color?: string; // css color for the active part
  label?: string; // optional visible label next to spinner
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 40,
  thickness = 4,
  color = '#2563EB', // fallback to a brand-blue if tailwind vars unavailable
  label,
}) => {
  const light = 'rgba(0,0,0,0.08)';

  return (
    <div className="flex items-center justify-center" role="status" aria-live="polite">
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          borderWidth: thickness,
          borderStyle: 'solid',
          borderColor: light,
          borderTopColor: color,
          borderRadius: '9999px',
        }}
        className="animate-spin"
      />

      {label ? (
        <span className="ml-3 text-sm text-brand-muted">{label}</span>
      ) : (
        // keep an accessible hidden text so screen readers know something is loading
        <span className="sr-only">Loading...</span>
      )}
    </div>
  );
};

export default Spinner;