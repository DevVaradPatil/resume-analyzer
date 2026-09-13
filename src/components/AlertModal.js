"use client";

import { useId } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { useModalA11y } from "../hooks/useModalA11y";

const AlertModal = ({ isOpen, onClose, type = "success", message }) => {
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 scrim animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="panel relative w-full max-w-[420px] p-6 shadow-overlay outline-none animate-slideIn"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="btn btn-ghost absolute top-3 right-3 h-8 w-8 px-0"
        >
          <X size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <h2 id={titleId} className="flex items-center gap-2 pr-8 text-lg font-semibold text-ink">
          <Icon
            size={20}
            strokeWidth={1.75}
            aria-hidden="true"
            className={isSuccess ? "text-positive" : "text-critical"}
          />
          {isSuccess ? "Done" : "Something went wrong"}
        </h2>

        <p id={messageId} className="mt-2 text-ink-2">
          {message}
        </p>

        <div className="mt-6 flex justify-end">
          <button type="button" onClick={onClose} className="btn btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
