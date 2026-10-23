'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from './icon';
export function Dialog({ children, title }: { children: React.ReactNode; title: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  const close = () => router.back();
  return (
    <dialog
      ref={ref}
      className="native-dialog"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="m-head">
        <h2 id="dialog-title">{title}</h2>
        <button type="button" className="icon-btn" aria-label="Fermer" onClick={close}>
          <Icon name="x" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
