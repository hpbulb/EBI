import { useEffect } from "react";

function Modal({ isOpen, title, message, onClose, buttonLabel = "Close" }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
      <div className="w-full flex flex-col justify-center items-center max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h2 className="mt-4 text-center text-2xl font-bold text-slate-900">
          {title}
        </h2>
        <p className="mt-3 text-center text-sm leading-6 text-slate-600">
          {message}
        </p>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="rounded-lg bg-amber-700 px-5 py-2.5 font-semibold text-white transition hover:bg-amber-800"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
