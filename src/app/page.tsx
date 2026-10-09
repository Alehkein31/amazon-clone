"use client";

import { useEffect, useState } from "react";
import { Search, ShoppingCart } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string | null;
};

type CartItem = Product & { qty: number };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cartLoaded, setCartLoaded] = useState(false);

  //CARGAR carrito guardado al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("amazon-cart");
    if (saved) {
      try { setCart(JSON.parse(saved)); } catch {}
    }
    setCartLoaded(true);
  }, []);  

  //GUARDAR carrito cada vez que cambia
  useEffect(() => {
    if (!cartLoaded) return;
    localStorage.setItem("amazon-cart", JSON.stringify(cart));
  }, [cart, cartLoaded]);

  const removeOne = (id: number) => {
    setCart(prev => prev.map(i => i.id === id? {...i, qty: i.qty-1} : i).filter(i => i.qty > 0));
  };

  const deleteItem = (id: number) => {
    setCart(prev => prev.filter(i => i.id!== id));
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("http://127.0.0.1:8000/products", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Error al cargar productos (${response.status}).`);
        }

        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los productos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const filtered = products.filter(
    (product) =>
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.category.toLowerCase().includes(normalizedSearch),
  );

  const addToCart = (product: Product) => {
    setCart((previousCart) => {
      const existingItem = previousCart.find((item) => item.id === product.id);

      if (existingItem) {
        return previousCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      return [...previousCart, { ...product, qty: 1 }];
    });
  };

  const totalItems = cart.reduce((total, item) => total + item.qty, 0);
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#EAEDED] font-sans">
      <header className="sticky top-0 z-50 bg-[#131921] text-white shadow-md">
        <div className="mx-auto flex max-w-[1600px] items-center gap-2 px-3 py-2 lg:gap-6 lg:px-6">
          <h1 className="shrink-0 text-xl font-black tracking-tight lg:text-2xl">
            amazon<span className="font-normal">.com.mx</span>
          </h1>

          <form
            role="search"
            onSubmit={(event) => event.preventDefault()}
            className="flex h-10 min-w-0 max-w-4xl flex-1 overflow-hidden rounded-md bg-white"
          >
            <span className="hidden items-center border-r bg-[#E6E6E6] px-3 text-xs text-black lg:flex">
              Todos
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar en Amazon"
              aria-label="Buscar productos"
              className="min-w-0 flex-1 px-3 text-[15px] text-black outline-none"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="bg-[#FEBD69] px-4 text-black hover:bg-[#F3A847] lg:px-6"
            >
              <Search size={20} />
            </button>
          </form>

          <button
            type="button"
            onClick={() => setShowCartMobile((show) => !show)}
            aria-label={`Abrir carrito, ${totalItems} productos`}
            className="flex shrink-0 items-center gap-2 rounded bg-[#232F3E] px-3 py-2 text-sm lg:hidden"
          >
            <ShoppingCart size={20} />
            {totalItems}
          </button>

          <div className="hidden items-center gap-6 text-sm lg:flex">
            <div>
              <p className="text-xs opacity-70">Hola, identifícate</p>
              <p className="font-bold">Cuenta y Listas</p>
            </div>
            <div className="flex items-center gap-1 rounded bg-[#232F3E] px-3 py-2">
              <ShoppingCart size={20} />
              <span className="font-bold text-[#F08804]">{totalItems}</span>
              <span className="hidden xl:inline">
                Carrito ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <nav
          aria-label="Categorías"
          className="flex gap-4 overflow-x-auto bg-[#232F3E] px-3 py-1 text-xs text-white lg:hidden"
        >
          <span>Prime</span>
          <span>Los más vendidos</span>
          <span>Ofertas</span>
          <span>Electrónicos</span>
        </nav>
      </header>

      <main className="mx-auto grid w-full max-w-[1600px] flex-1 grid-cols-1 gap-5 p-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-5">
        <section
          aria-label="Productos"
          className="grid content-start grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {isLoading && <p role="status">Cargando productos...</p>}
          {loadError && <p role="alert">{loadError}</p>}
          {!isLoading &&
            !loadError &&
            filtered.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-xl"
              >
                <div className="flex h-56 items-center justify-center rounded bg-[#F7F7F7] p-2">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain transition group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-sm text-gray-500">Sin imagen</span>
                  )}
                </div>
                <div className="mt-3 flex-1">
                  <h2 className="line-clamp-2 min-h-10 text-[15px] font-medium leading-tight">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#067D62]">
                    {product.category}
                  </p>
                  <p className="mt-2 text-[21px] font-bold">
                    <sup className="text-xs">$</sup>
                    {product.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-[#067600]">Envío GRATIS</p>
                </div>
                <button
                  type="button"
                  onClick={() => addToCart(product)}
                  className="mt-3 w-full rounded-full border border-[#FCD200] bg-[#FFD814] py-2 text-sm shadow-sm hover:bg-[#F1CA00]"
                >
                  Agregar al carrito
                </button>
              </article>
            ))}
          {!isLoading && !loadError && filtered.length === 0 && (
            <p>No se encontraron productos para &quot;{search}&quot;.</p>
          )}
        </section>

        <aside
          aria-label="Resumen del pedido"
          className={`${
            showCartMobile
              ? "fixed inset-0 z-40 m-3 mt-20 block overflow-auto lg:static lg:m-0 lg:mt-0"
              : "hidden lg:sticky lg:top-[76px] lg:block"
          } h-fit rounded-lg bg-white p-5 shadow-sm`}
        >
          <div className="flex justify-between lg:block">
            <h3 className="text-lg font-bold">Resumen del pedido</h3>
            <button
              type="button"
              onClick={() => setShowCartMobile(false)}
              aria-label="Cerrar carrito"
              className="text-2xl lg:hidden"
            >
              ×
            </button>
          </div>
          <p className="mt-2 text-sm text-[#067600]">
            Tu pedido es elegible para envío GRATIS
          </p>
          <hr className="my-3" />
          {cart.length === 0 ? (
            <p className="text-sm text-gray-500">
              Tu carrito de Amazon está vacío
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 border-b py-3 text-sm"
              >
                <span className="flex-1 line-clamp-2 pr-2">{item.name}</span>
                <div className="flex items-center gap-1 rounded-full bg-gray-100 px-1">
                  <button
                    type="button"
                    onClick={() => removeOne(item.id)}
                    className="rounded-full px-2 py-1 hover:bg-white"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold">{item.qty}</span>
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="rounded-full px-2 py-1 hover:bg-white"
                  >
                    +
                  </button>
                </div>
                <span className="w-[55px] text-right font-bold">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))
          )}
          <hr className="my-3" />
          <p className="text-lg font-bold">
            Total ({totalItems} productos):{" "}
            <span className="text-[#B12704]">${totalPrice.toFixed(2)}</span>
          </p>
          <button
            type="button"
            disabled={cart.length === 0}
            className="mt-4 w-full rounded-lg bg-[#FFD814] py-2.5 text-sm font-medium shadow hover:bg-[#F7CA00] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Proceder al pago
          </button>
          <div className="mt-4 lg:hidden">
            <button
              type="button"
              onClick={() => setShowCartMobile(false)}
              className="w-full rounded-lg border py-2"
            >
              Seguir comprando
            </button>
          </div>
        </aside>
      </main>

      <footer className="mt-10">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-full cursor-pointer bg-[#37475A] py-4 text-center text-sm text-white hover:bg-[#485769]"
        >
          Volver al inicio
        </button>
        <div className="grid grid-cols-2 gap-8 bg-[#232F3E] px-6 py-10 text-sm text-[#DDDDDD] lg:grid-cols-4 lg:px-20">
          <div>
            <h4 className="mb-2 font-bold text-white">Conócenos</h4>
            <p>Trabaja en Amazon</p>
            <p>Acerca de Amazon</p>
          </div>
          <div>
            <h4 className="mb-2 font-bold text-white">Gana dinero</h4>
            <p>Vende en Amazon</p>
            <p>Publica tus libros</p>
          </div>
          <div>
            <h4 className="mb-2 font-bold text-white">Pagos</h4>
            <p>Métodos de pago</p>
            <p>Meses sin intereses</p>
          </div>
          <div>
            <h4 className="mb-2 font-bold text-white">Ayuda</h4>
            <p>Tu cuenta</p>
            <p>Devoluciones</p>
          </div>
        </div>
        <div className="bg-[#131A22] py-6 text-center text-xs text-[#999]">
          Día 4 - Reto 7 días - Tailwind Full Responsive - Hecho por mí
        </div>
      </footer>
    </div>
  );
}
