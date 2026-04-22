import { useEffect, useId, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel = 'Löschen', onConfirm, onCancel }: Props) {
  const titleId = useId();
  const descId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const onCancelRef = useRef(onCancel);

  useEffect(() => {
    onCancelRef.current = onCancel;
  });

  useEffect(() => {
    triggerRef.current = document.activeElement;
    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancelRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      (triggerRef.current as HTMLElement | null)?.focus();
    };
  }, []);

  return (
    <div className={styles.overlay} onClick={onCancel} aria-hidden="true">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.icon} aria-hidden="true">🗑️</div>
        <h2 id={titleId}>{title}</h2>
        <p id={descId}>{message}</p>
        <div className={styles.actions}>
          <button ref={cancelRef} className={styles.cancel} onClick={onCancel}>Abbrechen</button>
          <button className={styles.confirm} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

