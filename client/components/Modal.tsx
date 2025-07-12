// Modal.tsx
"use client";

import { memo, useEffect, useRef, MouseEvent, useCallback } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const Modal = memo((props: ModalProps) => {
  const { isOpen, onClose, children } = props;

  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  /**
   * モーダル外をクリックしたときに閉じる
   */
  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      className="min-h-screen w-full max-w-none bg-transparent p-0 backdrop:bg-black/50"
      onClose={onClose}
      role="dialog"
    >
      <div
        onClick={handleBackdropClick}
        className="flex min-h-screen items-center justify-center p-4"
      >
        {children}
      </div>
    </dialog>
  );
});

Modal.displayName = "Modal";
