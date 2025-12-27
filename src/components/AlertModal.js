import { useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

// Alert Modal Component
const AlertModal = ({ isOpen, onClose, type = "success", message }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-slideIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-4 ${isSuccess ? "text-green-500" : "text-red-500"}`}
          >
            {isSuccess ? (
              <CheckCircle size={56} strokeWidth={1.5} />
            ) : (
              <XCircle size={56} strokeWidth={1.5} />
            )}
          </div>

          <h3
            className={`text-xl font-semibold mb-2 ${
              isSuccess ? "text-gray-900" : "text-gray-900"
            }`}
          >
            {isSuccess ? "Success!" : "Error"}
          </h3>

          <p className="text-gray-600 mb-6">{message}</p>

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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AlertModal;
