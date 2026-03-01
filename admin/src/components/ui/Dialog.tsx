// src/components/ui/Dialog.tsx
"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { createPortal } from "react-dom";

type BaseOpts = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};
type ConfirmOpts = BaseOpts;
type AlertOpts = Omit<BaseOpts, "cancelText" | "danger">;
type PromptOpts = BaseOpts & {
  defaultValue?: string;
  placeholder?: string;
  validate?: (v: string) => string | null;
};

type DialogContextType = {
  confirm: (o: ConfirmOpts) => Promise<boolean>;
  alert: (o: AlertOpts) => Promise<void>;
  prompt: (o: PromptOpts) => Promise<string | null>;
};

const DialogCtx = createContext<DialogContextType | null>(null);

export function useDialog() {
  const ctx = useContext(DialogCtx);
  if (!ctx) throw new Error("useDialog must be used within DialogProvider");
  return ctx;
}

type Kind =
  | { type: "confirm"; opts: ConfirmOpts; res: (v: boolean) => void }
  | { type: "alert"; opts: AlertOpts; res: () => void }
  | {
      type: "prompt";
      opts: PromptOpts;
      res: (v: string | null) => void;
    };

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind | null>(null);
  const [value, setValue] = useState("");

  const confirm = useCallback((opts: ConfirmOpts) => {
    return new Promise<boolean>((res) => {
      setKind({ type: "confirm", opts, res });
      setOpen(true);
    });
  }, []);

  const alert = useCallback((opts: AlertOpts) => {
    return new Promise<void>((res) => {
      setKind({ type: "alert", opts, res });
      setOpen(true);
    });
  }, []);

  const prompt = useCallback((opts: PromptOpts) => {
    return new Promise<string | null>((res) => {
      setValue(opts.defaultValue ?? "");
      setKind({ type: "prompt", opts, res });
      setOpen(true);
    });
  }, []);

  const ctxValue: DialogContextType = { confirm, alert, prompt };

  const close = () => {
    setOpen(false);
    setTimeout(() => setKind(null), 150);
  };

  const onConfirm = () => {
    if (!kind) return;
    if (kind.type === "confirm") kind.res(true);
    if (kind.type === "alert") kind.res();
    if (kind.type === "prompt") {
      const err = kind.opts.validate?.(value) ?? null;
      if (err) return; // keep open on validation error
      kind.res(value);
    }
    close();
  };

  const onCancel = () => {
    if (!kind) return;
    if (kind.type === "confirm") kind.res(false);
    if (kind.type === "prompt") kind.res(null);
    close();
  };

  const body =
    open && kind
      ? createPortal(
          <div
            className="fixed inset-0 z-[3000] grid place-items-center bg-black/50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) onCancel();
            }}
          >
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
              <div className="border-b px-5 py-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {kind.opts.title}
                </h3>
                {kind.opts.description ? (
                  <p className="mt-1 text-sm text-slate-600">
                    {kind.opts.description}
                  </p>
                ) : null}
              </div>

              <div className="px-5 py-4">
                {kind.type === "prompt" ? (
                  <input
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={kind.opts.placeholder}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none ring-sky-200 focus:ring"
                  />
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-2 border-t bg-white px-5 py-3">
                {kind.type !== "alert" ? (
                  <button
                    onClick={onCancel}
                    className="rounded-md bg-slate-100 px-3 py-2 text-slate-700 hover:bg-slate-200"
                  >
                    {kind.opts.cancelText ?? "Cancel"}
                  </button>
                ) : null}
                <button
                  onClick={onConfirm}
                  className={`rounded-md px-3 py-2 text-white ${
                    kind.opts.danger
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-sky-600 hover:bg-sky-700"
                  }`}
                >
                  {kind.opts.confirmText ??
                    (kind.type === "alert" ? "OK" : "Confirm")}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <DialogCtx.Provider value={ctxValue}>
      {children}
      {body}
    </DialogCtx.Provider>
  );
}
