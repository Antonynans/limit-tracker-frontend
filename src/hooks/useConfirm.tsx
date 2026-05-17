import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger';
}

interface ConfirmDialogProps extends ConfirmOptions {
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  const iconMap = {
    danger: (
       <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  };

  return createPortal(
    <div
        className="confirm-backdrop"
        onMouseDown={e => { if (e.target === e.currentTarget) onCancel(); }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className="confirm-dialog">
          <div className="confirm-header">
            <span className={`confirm-icon confirm-icon--${variant}`}>
              {iconMap[variant]}
            </span>
            <div className="confirm-text">
              {title && <p id="confirm-title" className="confirm-title">{title}</p>}
              <p id="confirm-message" className="confirm-message">{message}</p>
            </div>
          </div>
          <div className="confirm-actions">
            <button
              ref={cancelRef}
              className="confirm-btn confirm-btn--cancel"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
            <button
              className={`confirm-btn confirm-btn--confirm-${variant}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>,
    document.body
  );
}

export function useConfirm() {
  const [dialogProps, setDialogProps] = useState<ConfirmDialogProps | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setDialogProps({
        ...options,
        onConfirm: () => { setDialogProps(null); resolve(true); },
        onCancel:  () => { setDialogProps(null); resolve(false); },
      });
    });
  }, []);

  const ConfirmPortal = dialogProps ? <ConfirmDialog {...dialogProps} /> : null;

  return { confirm, ConfirmPortal };
}