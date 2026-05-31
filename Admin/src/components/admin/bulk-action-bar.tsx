"use client";

import { useState } from "react";

export type BulkActionOption = {
  value: string;
  label: string;
};

export function BulkActionBar({
  count,
  total,
  actions,
  applying,
  onApply,
  onClear,
}: {
  count: number;
  total: number;
  actions: BulkActionOption[];
  applying?: boolean;
  onApply: (action: string) => void | Promise<void>;
  onClear: () => void;
}) {
  const [action, setAction] = useState(actions[0]?.value ?? "");

  if (count === 0) return null;

  return (
    <div className="wp-bulk-bar">
      <span className="wp-bulk-count">
        <strong>{count}</strong> of {total} selected
      </span>
      <select
        className="wp-bulk-select"
        value={action}
        onChange={(e) => setAction(e.target.value)}
        disabled={applying}
      >
        {actions.map((a) => (
          <option key={a.value} value={a.value}>
            {a.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="wp-button-primary"
        disabled={applying || !action}
        onClick={() => onApply(action)}
      >
        {applying ? "Applying…" : "Apply"}
      </button>
      <button
        type="button"
        className="wp-button-secondary"
        disabled={applying}
        onClick={onClear}
      >
        Clear
      </button>
    </div>
  );
}

export function BulkCheckbox({
  checked,
  indeterminate,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <input
      type="checkbox"
      className="wp-bulk-checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = Boolean(indeterminate);
      }}
      onChange={onChange}
      aria-label={ariaLabel}
    />
  );
}
