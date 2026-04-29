import type { WHConfig } from '@/types';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface WidgetPreviewProps {
  config: WHConfig;
  state?: 'idle' | 'voted_up' | 'voted_down' | 'submitted';
}

export default function WidgetPreview({ config, state = 'idle' }: WidgetPreviewProps) {
  const { theme } = config;
  const isCompact = config.displayMode === 'compact';

  const btnBase: React.CSSProperties = {
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: isCompact ? '13px' : '14px',
    padding: isCompact ? '4px 10px' : '8px 16px',
    border: theme.buttonStyle === 'outline' ? `1px solid ${theme.primaryColor}` : 'none',
    background: theme.buttonStyle === 'filled' ? theme.primaryColor : 'transparent',
    color: theme.buttonStyle === 'filled' ? '#fff' : theme.primaryColor,
    transition: 'opacity 0.15s',
  };

  const containerStyle: React.CSSProperties = {
    background: theme.backgroundColor,
    color: theme.textColor,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    padding: isCompact ? '8px 12px' : '16px 20px',
    border: '1px solid #e5e7eb',
    display: 'inline-block',
    maxWidth: isCompact ? '320px' : '420px',
    width: '100%',
  };

  if (state === 'voted_up') {
    return (
      <div style={containerStyle}>
        <p style={{ margin: 0, fontSize: '14px', color: theme.textColor }}>{config.thankYouMessage}</p>
      </div>
    );
  }

  if (state === 'submitted') {
    return (
      <div style={containerStyle}>
        <p style={{ margin: 0, fontSize: '14px', color: theme.textColor }}>Thanks! Your feedback was submitted.</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {state === 'idle' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: isCompact ? '8px' : '12px', flexWrap: 'wrap' }}>
          {!isCompact && (
            <span style={{ fontSize: '14px', fontWeight: 500, marginRight: '4px' }}>
              {config.questionText}
            </span>
          )}
          {isCompact && (
            <span style={{ fontSize: '13px', color: theme.textColor }}>{config.questionText}</span>
          )}
          <button style={btnBase}>
            <ThumbsUp size={isCompact ? 13 : 15} />
            {!isCompact && config.positiveLabel}
          </button>
          <button style={{ ...btnBase, background: theme.buttonStyle === 'filled' ? '#6b7280' : 'transparent', border: theme.buttonStyle === 'outline' ? '1px solid #6b7280' : 'none', color: theme.buttonStyle === 'filled' ? '#fff' : '#6b7280' }}>
            <ThumbsDown size={isCompact ? 13 : 15} />
            {!isCompact && config.negativeLabel}
          </button>
        </div>
      )}

      {state === 'voted_down' && config.followUpEnabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 500 }}>{config.followUpQuestion}</p>
          {(config.followUpType === 'poll' || config.followUpType === 'poll_with_input') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {config.pollOptions.map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input type="radio" name="poll" style={{ accentColor: theme.primaryColor }} />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {(config.followUpType === 'textarea' || config.followUpType === 'poll_with_input') && (
            <textarea
              placeholder="Tell us more…"
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: theme.borderRadius,
                border: '1px solid #d1d5db',
                fontSize: '13px',
                fontFamily: theme.fontFamily,
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          )}
          <button style={{ ...btnBase, alignSelf: 'flex-start' }}>Submit</button>
        </div>
      )}
    </div>
  );
}
