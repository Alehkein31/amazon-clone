"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import confetti from "canvas-confetti";

export default function OrderSuccessPage() {
  useEffect(() => {
    void confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.65 },
    });
  }, []);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-white p-10 text-center">
      <CircleCheck
        aria-hidden="true"
        className="mb-4 h-16 w-16 text-green-600"
      />
      <h1 className="text-3xl font-bold">¡Gracias por tu compra!</h1>
      <p className="mt-2 max-w-md text-gray-600">
        Tu pedido se ha confirmado. Te esperamos pronto.
      </p>

      <Link
        href="/"
        className="mt-8 rounded-lg bg-[#FFD814] px-6 py-3 font-medium shadow hover:bg-[#F7CA00]"
      >
        Seguir comprando
      </Link>
    </main>
  );
}
