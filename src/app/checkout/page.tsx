"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartCount,
    isLoaded,
    storageError,
    clearCart,
  } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    clearCart();
    router.push("/order-success");
  };

  if (!isLoaded) {
    return (
      <main className="p-10 text-center" aria-live="polite">
        Cargando carrito...
      </main>
    );
  }

  if (storageError) {
    return (
      <main className="min-h-[60vh] bg-white p-10 text-center">
        <p role="alert" className="mb-4 text-red-700">
          {storageError}
        </p>
        <Link href="/" className="text-blue-600 underline">
          Volver a la tienda
        </Link>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-[60vh] bg-white p-10 text-center">
        <h1 className="text-2xl font-bold">
          Tu carrito de Amazon está vacío
        </h1>
        <Link
          href="/"
          className="mt-4 inline-block text-blue-600 underline"
        >
          Seguir comprando
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-4 p-4 lg:grid-cols-4">
      <section
        aria-label="Productos en el carrito"
        className="bg-white p-4 lg:col-span-3"
      >
        <h1 className="text-[28px]">Carrito de compras</h1>
        <hr className="my-4" />
        {cart.map((item) => (
          <article
            key={item.id}
            className="flex flex-wrap items-center gap-4 border-b py-4"
          >
            <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-gray-50">
              {item.image ? (
                <img
                  src={item.image}
                  className="max-h-full max-w-full object-contain"
                  alt={item.name}
                />
              ) : (
                <span className="text-xs text-gray-500">Sin imagen</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-[#007600]">Disponible</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.qty - 1)}
                  aria-label={`Reducir cantidad de ${item.name}`}
                  className="border px-2"
                >
                  -
                </button>
                <span aria-label={`Cantidad: ${item.qty}`}>{item.qty}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.id, item.qty + 1)}
                  aria-label={`Aumentar cantidad de ${item.name}`}
                  className="border px-2"
                >
                  +
                </button>
                <span className="mx-2" aria-hidden="true">
                  |
                </span>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <p className="font-bold">
              ${(item.price * item.qty).toFixed(2)}
            </p>
          </article>
        ))}
        <p className="mt-4 text-right text-lg">
          Subtotal ({cartCount} productos):{" "}
          <span className="font-bold">${cartTotal.toFixed(2)}</span>
        </p>
      </section>

      <aside aria-label="Resumen del pedido" className="h-fit border bg-white p-4">
        <p className="text-lg leading-5">
          Subtotal ({cartCount} productos):{" "}
          <span className="font-bold">${cartTotal.toFixed(2)}</span>
        </p>
        <button
          type="button"
          onClick={handleCheckout}
          className="mt-4 w-full rounded-lg bg-[#FFD814] py-2 text-sm shadow hover:bg-[#F7CA00]"
        >
          Proceder al pago
        </button>
      </aside>
    </main>
  );
}
