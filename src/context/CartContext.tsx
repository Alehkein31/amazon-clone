"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  image?: string | null;
};

export type CartItem = Product & {
  qty: number;
};

type CartContextValue = {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isLoaded: boolean;
  storageError: string | null;
};

const CART_STORAGE_KEY = "amazon-cart";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "number" &&
    Number.isFinite(item.id) &&
    typeof item.name === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    typeof item.category === "string" &&
    typeof item.description === "string" &&
    Number.isInteger(item.qty) &&
    (item.qty as number) > 0 &&
    (item.image === undefined ||
      item.image === null ||
      typeof item.image === "string")
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCart() {
      try {
        const savedCart = await Promise.resolve(
          localStorage.getItem(CART_STORAGE_KEY),
        );

        if (savedCart) {
          const parsedCart: unknown = JSON.parse(savedCart);
          if (!Array.isArray(parsedCart) || !parsedCart.every(isCartItem)) {
            throw new Error("Los datos guardados del carrito no son válidos.");
          }

          if (!cancelled) {
            setCart(parsedCart);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setStorageError(
            error instanceof Error
              ? error.message
              : "No se pudo cargar el carrito guardado.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    void loadCart();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || storageError) {
      return;
    }

    let cancelled = false;

    void Promise.resolve()
      .then(() =>
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)),
      )
      .catch((error: unknown) => {
        if (!cancelled) {
          setStorageError(
            error instanceof Error
              ? error.message
              : "No se pudo guardar el carrito.",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cart, isLoaded, storageError]);

  const addToCart = useCallback((product: Product) => {
    setCart((previousCart) => {
      const existingItem = previousCart.find((item) => item.id === product.id);

      if (existingItem) {
        return previousCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }

      return [...previousCart, { ...product, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: number) => {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== id),
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id ? { ...item, qty: quantity } : item,
      ),
    );
  }, [removeFromCart]);

  const cartCount = cart.reduce((total, item) => total + item.qty, 0);
  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0,
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isLoaded,
      storageError,
    }),
    [
      addToCart,
      cart,
      cartCount,
      cartTotal,
      isLoaded,
      removeFromCart,
      storageError,
      updateQuantity,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe usarse dentro de un CartProvider.");
  }

  return context;
}
