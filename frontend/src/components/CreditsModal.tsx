"use client";

import { useState } from "react";

import { useCredits } from "@/context/CreditsContext";

type CreditsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function CreditsModal({ open, onClose }: CreditsModalProps) {
  const [topUpAmount, setTopUpAmount] = useState(50);
  const { balance, pricing, history, topUp } = useCredits();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Credits</h2>
          <button className="text-sm text-gray-600" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <p>
            Current balance: <span className="font-semibold">{balance}</span>
          </p>
          <div className="rounded-md border border-gray-200 p-3">
            <h3 className="font-medium">Pricing</h3>
            <ul className="mt-2 space-y-1 text-gray-700">
              <li>Text clean: {pricing.text} credit(s)</li>
              <li>Image clean: {pricing.image} credit(s)</li>
              <li>Container clean: {pricing.container} credit(s)</li>
              <li>Pixel removal add-on: {pricing.pixelRemoval} credit(s)</li>
            </ul>
          </div>

          <div className="rounded-md border border-gray-200 p-3">
            <h3 className="font-medium">Top-up (placeholder payment flow)</h3>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={topUpAmount}
                onChange={(event) => setTopUpAmount(Number(event.target.value))}
                className="w-24 rounded border border-gray-300 px-2 py-1"
              />
              <button
                type="button"
                className="rounded bg-blue-600 px-3 py-1 text-white"
                onClick={() => topUp(topUpAmount)}
              >
                Add credits
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Stripe/payment integration placeholder.</p>
          </div>

          <div className="rounded-md border border-gray-200 p-3">
            <h3 className="font-medium">Usage history</h3>
            <div className="mt-2 max-h-40 overflow-auto text-xs">
              {history.length === 0 ? (
                <p className="text-gray-500">No activity yet.</p>
              ) : (
                <ul className="space-y-1">
                  {history.map((entry) => (
                    <li key={entry.id} className="flex justify-between gap-2">
                      <span>{new Date(entry.timestamp).toLocaleString()} — {entry.reason}</span>
                      <span className={entry.delta >= 0 ? "text-green-700" : "text-red-700"}>
                        {entry.delta >= 0 ? `+${entry.delta}` : entry.delta}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
