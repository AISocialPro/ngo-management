// src/components/ConfirmDialog.tsx
"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type Ctx = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const ConfirmCtx = createContext<Ctx | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmDialogProvider />");
  return ctx;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<(v: boolean) => void>(() => () => {});

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOpts(options);
      setResolver(() => resolve);
      setOpen(true);
    });
  }, []);

  const onClose = useCallback(
    (result: boolean) => {
      setOpen(false);
      resolver(result);
    },
    [resolver]
  );

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmCtx.Provider value={value}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <Dialog
            open={open}
            title={opts.title ?? "Are you sure?"}
            description={opts.description ?? "This action cannot be undone."}
            confirmText={opts.confirmText ?? "Delete"}
            cancelText={opts.cancelText ?? "Cancel"}
            danger={!!opts.danger}
            onCancel={() => onClose(false)}
            onConfirm={() => onClose(true)}
          />,
          document.body
        )}
    </ConfirmCtx.Provider>
  );
}

/* ---------------- UI for the dialog ---------------- */
function Dialog({
  open,
  title,
  description,
  confirmText,
  cancelText,
  danger,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  danger: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-slate-600">{description}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md bg-slate-600 px-3 py-2 text-white hover:bg-slate-700"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-2 text-white ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-sky-600 hover:bg-sky-700"}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
