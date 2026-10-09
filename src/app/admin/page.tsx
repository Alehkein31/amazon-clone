"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
};

const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Playera Nike Dry Fit",
    price: 399,
    image: "https://via.placeholder.com/300",
    category: "ropa",
    description: "",
  },
  {
    id: 2,
    name: "Audifonos Bluetooth",
    price: 899,
    image: "https://via.placeholder.com/300",
    category: "electronica",
    description: "",
  },
];

function getCartCount() {
  const savedCartCount = Number.parseInt(
    localStorage.getItem("cartCount") ?? "0",
    10,
  );
  return Number.isFinite(savedCartCount) && savedCartCount >= 0
    ? savedCartCount
    : 0;
}

function subscribeToCartCount(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("cartCountChange", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cartCountChange", callback);
  };
}

function saveCartCount(count: number) {
  localStorage.setItem("cartCount", count.toString());
  window.dispatchEvent(new Event("cartCountChange"));
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const cart = useSyncExternalStore(subscribeToCartCount, getCartCount, () => 0);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/products")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Product request failed: ${response.status}`);
        }
        return response.json() as Promise<Product[]>;
      })
      .then(setProducts)
      .catch((error: unknown) => {
        console.error("Could not load products; showing fallback products.", error);
        setProducts(fallbackProducts);
      });

  }, []);

  const addToCart = () => {
    saveCartCount(cart + 1);
  };

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      <header className="sticky top-0 z-50 bg-[#131921] text-white">
        <div className="flex items-center gap-4 p-3">
          <h1 className="text-2xl font-bold">
            amazon<span className="text-xs">.com.mx</span>
          </h1>
          <div className="flex max-w-3xl flex-1">
            <input
              placeholder="Buscar en Amazon"
              aria-label="Buscar en Amazon"
              className="flex-1 rounded-l-md p-2.5 text-black outline-none"
            />
            <button
              type="button"
              aria-label="Buscar"
              className="rounded-r-md bg-[#FEBD69] px-4 text-black"
            >
              °
            </button>
          </div>
          <p aria-live="polite">Carrito: {cart}</p>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] grid-cols-2 gap-4 p-4 md:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col bg-white p-4 shadow hover:shadow-lg"
          >
            <div className="flex h-48 items-center justify-center bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="h-full object-contain"
              />
            </div>
            <h2 className="mt-3 h-10 line-clamp-2 text-sm">{product.name}</h2>
            <p className="text-xl font-bold">${product.price}</p>
            <button
              type="button"
              onClick={addToCart}
              className="mt-3 rounded-lg border border-[#FCD200] bg-[#FFD814] py-1.5 text-sm"
            >
              Agregar al carrito
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}
