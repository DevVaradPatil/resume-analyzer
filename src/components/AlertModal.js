"use client";

import { useId } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { useModalA11y } from "../hooks/useModalA11y";

// Alert Modal Component
const AlertModal = ({ isOpen, onClose, type = "success", message }) => {
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fadeIn"
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
        className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-slideIn outline-none"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} aria-hidden="true" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-4 ${isSuccess ? "text-green-500" : "text-red-500"}`}
            aria-hidden="true"
          >
            {isSuccess ? (
              <CheckCircle size={56} strokeWidth={1.5} />
            ) : (
              <XCircle size={56} strokeWidth={1.5} />
            )}
          </div>

          <h3 id={titleId} className="text-xl font-semibold mb-2 text-gray-900">
            {isSuccess ? "Success!" : "Error"}
          </h3>

          <p id={messageId} className="text-gray-600 mb-6">
            {message}
          </p>

          <button
            onClick={onClose}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              isSuccess
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
