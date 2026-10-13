"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cartCount } = useCart();

  return (
    <header className="bg-[#131921] text-white p-3 flex justify-between items-center sticky top-0 z-50">
      <Link href="/" className="text-xl font-bold">
        amazon-clone
      </Link>
      <Link
        href="/checkout"
        className="flex items-center gap-2 border border-transparent hover:border-white p-2"
      >
        <ShoppingCart size={24} aria-hidden="true" />
          <span className="text-3x1">Carrito</span>
          <span className="font-bold text-[#f08804]">{cartCount}</span>
          <span className="hidden md:inline ml-1">Carrito</span>
      </Link>
    </header>
  );
}