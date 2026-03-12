"use client";

import type { Address } from "@zevlin/contracts";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from "react";
import { getCartCount } from "../lib/commerce";

type CheckoutAddress = Address;

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  imagePath: string;
  quantity: number;
  variantId: null;
};

export type CheckoutDraft = {
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  sameAsShipping: boolean;
};

export type LastCheckoutSnapshot = {
  orderId: string;
  items: CartItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  createdAt: string;
};

type StoreState = {
  hydrated: boolean;
  cart: CartItem[];
  checkoutDraft: CheckoutDraft;
  lastCheckout: LastCheckoutSnapshot | null;
};

type PersistedState = Omit<StoreState, "hydrated">;

type AddToCartInput = Omit<CartItem, "quantity" | "variantId"> & {
  quantity?: number;
};

type StoreContextValue = {
  hydrated: boolean;
  cart: CartItem[];
  cartCount: number;
  checkoutDraft: CheckoutDraft;
  lastCheckout: LastCheckoutSnapshot | null;
  addToCart: (input: AddToCartInput) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  saveCheckoutDraft: (draft: CheckoutDraft) => void;
  clearCheckoutDraft: () => void;
  setLastCheckout: (snapshot: LastCheckoutSnapshot) => void;
  clearLastCheckout: () => void;
};

type Action =
  | { type: "hydrate"; payload: PersistedState }
  | { type: "add"; payload: AddToCartInput }
  | { type: "updateQuantity"; productId: string; quantity: number }
  | { type: "remove"; productId: string }
  | { type: "clearCart" }
  | { type: "saveDraft"; draft: CheckoutDraft }
  | { type: "clearDraft" }
  | { type: "setLastCheckout"; snapshot: LastCheckoutSnapshot }
  | { type: "clearLastCheckout" };

const STORAGE_KEY = "zevlin-store-state:v1";

function createEmptyAddress(): CheckoutAddress {
  return {
    name: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  };
}

export function createEmptyCheckoutDraft(): CheckoutDraft {
  return {
    shippingAddress: createEmptyAddress(),
    billingAddress: createEmptyAddress(),
    sameAsShipping: true,
  };
}

const initialState: StoreState = {
  hydrated: false,
  cart: [],
  checkoutDraft: createEmptyCheckoutDraft(),
  lastCheckout: null,
};

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case "hydrate":
      return {
        hydrated: true,
        cart: action.payload.cart,
        checkoutDraft: action.payload.checkoutDraft,
        lastCheckout: action.payload.lastCheckout,
      };
    case "add": {
      const quantity = Math.max(1, action.payload.quantity ?? 1);
      const existing = state.cart.find((item) => item.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.productId === action.payload.productId
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          ),
        };
      }

      return {
        ...state,
        cart: [
          ...state.cart,
          {
            productId: action.payload.productId,
            slug: action.payload.slug,
            name: action.payload.name,
            priceCents: action.payload.priceCents,
            imagePath: action.payload.imagePath,
            quantity,
            variantId: null,
          },
        ],
      };
    }
    case "updateQuantity": {
      if (action.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((item) => item.productId !== action.productId),
        };
      }

      return {
        ...state,
        cart: state.cart.map((item) =>
          item.productId === action.productId ? { ...item, quantity: action.quantity } : item,
        ),
      };
    }
    case "remove":
      return {
        ...state,
        cart: state.cart.filter((item) => item.productId !== action.productId),
      };
    case "clearCart":
      return {
        ...state,
        cart: [],
      };
    case "saveDraft":
      return {
        ...state,
        checkoutDraft: action.draft,
      };
    case "clearDraft":
      return {
        ...state,
        checkoutDraft: createEmptyCheckoutDraft(),
      };
    case "setLastCheckout":
      return {
        ...state,
        lastCheckout: action.snapshot,
      };
    case "clearLastCheckout":
      return {
        ...state,
        lastCheckout: null,
      };
    default:
      return state;
  }
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        dispatch({
          type: "hydrate",
          payload: {
            cart: [],
            checkoutDraft: createEmptyCheckoutDraft(),
            lastCheckout: null,
          },
        });
        return;
      }

      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      dispatch({
        type: "hydrate",
        payload: {
          cart: Array.isArray(parsed.cart) ? parsed.cart : [],
          checkoutDraft: parsed.checkoutDraft ?? createEmptyCheckoutDraft(),
          lastCheckout: parsed.lastCheckout ?? null,
        },
      });
    } catch {
      dispatch({
        type: "hydrate",
        payload: {
          cart: [],
          checkoutDraft: createEmptyCheckoutDraft(),
          lastCheckout: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }

    const payload: PersistedState = {
      cart: state.cart,
      checkoutDraft: state.checkoutDraft,
      lastCheckout: state.lastCheckout,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [state.cart, state.checkoutDraft, state.hydrated, state.lastCheckout]);

  const addToCart = useCallback((input: AddToCartInput) => {
    dispatch({ type: "add", payload: input });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    dispatch({ type: "updateQuantity", productId, quantity });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    dispatch({ type: "remove", productId });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "clearCart" });
  }, []);

  const saveCheckoutDraft = useCallback((draft: CheckoutDraft) => {
    dispatch({ type: "saveDraft", draft });
  }, []);

  const clearCheckoutDraft = useCallback(() => {
    dispatch({ type: "clearDraft" });
  }, []);

  const setLastCheckout = useCallback((snapshot: LastCheckoutSnapshot) => {
    dispatch({ type: "setLastCheckout", snapshot });
  }, []);

  const clearLastCheckout = useCallback(() => {
    dispatch({ type: "clearLastCheckout" });
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      hydrated: state.hydrated,
      cart: state.cart,
      cartCount: getCartCount(state.cart),
      checkoutDraft: state.checkoutDraft,
      lastCheckout: state.lastCheckout,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      saveCheckoutDraft,
      clearCheckoutDraft,
      setLastCheckout,
      clearLastCheckout,
    }),
    [
      addToCart,
      clearCart,
      clearCheckoutDraft,
      clearLastCheckout,
      removeFromCart,
      saveCheckoutDraft,
      setLastCheckout,
      state.cart,
      state.checkoutDraft,
      state.hydrated,
      state.lastCheckout,
      updateQuantity,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }

  return context;
}
