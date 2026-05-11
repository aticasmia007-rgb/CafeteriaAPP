// Central API service layer — all backend communication lives here

const BASE_URL = "http://localhost:8000/api";
const REDSYS_URL = "https://sis-t.redsys.es:25443/sis/realizarPago"; // test TPV

const TOKEN_KEY = "cafeteria_access_token";
const REFRESH_KEY = "cafeteria_refresh_token";

// ── Token helpers ──────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

// ── API error class ────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: string,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Core fetch wrapper with JWT + auto-refresh ─────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  if (isRefreshing) return refreshPromise;
  const refresh = getRefreshToken();
  if (!refresh) return null;

  isRefreshing = true;
  refreshPromise = fetch(`${BASE_URL}/userauth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  })
    .then(async (r) => {
      const json = await r.json();
      if (json.access) {
        setTokens(json.access, json.refresh ?? refresh);
        return json.access as string;
      }
      clearTokens();
      return null;
    })
    .catch(() => {
      clearTokens();
      return null;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const newToken = await tryRefresh();
    if (newToken) return apiFetch<T>(path, options, false);
    clearTokens();
    throw new ApiError("02", "Sesión expirada. Por favor, inicia sesión de nuevo.");
  }

  const json = await res.json().catch(() => ({}));
  console.log("API response:", { path, status: res.status, body: json });
  if (json.status !== "00") {
    throw new ApiError(
      json.status ?? "99",
      json.msg ?? "Error desconocido",
      json.errors
    );
  }

  // Auth endpoints return tokens at the top level (no `data` wrapper)
  return (json.data !== undefined ? json.data : json) as T;
}

// ── Response types ─────────────────────────────────────────────────────────

export interface ApiUser {
  id?: string;
  user_id?: string;  // auth endpoints return user_id; profile endpoint returns id
  email: string;
  name: string;
  avatar?: string;
  auth_provider: "GOOGLE" | "INHOUSE" | "google" | "inhouse";
  role: "client" | "staff" | "admin";
}

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  category: { category_id: string; name: string; image?: string }[];
  allergens: { allergen_id: string; name: string; icon?: string }[];
  image?: string;
  available: boolean;
  stock: number;
  prepare_required: boolean;
}

export interface ApiCategory {
  category_id: string; // UUID
  name: string;
  image?: string;
  active: boolean;
  product_count?: number;
}

export interface ApiAllergen {
  allergen_id: string; // UUID
  name: string;
  icon?: string;
}

export interface ApiSlot {
  slot_id: string;
  label: string;
  start_time?: string;
  end_time?: string;
  capacity: number;
  remaining?: number;
  active?: boolean;
}

export interface ApiOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
}

export interface ApiOrder {
  id: string;
  state: "pending" | "paid" | "preparing" | "ready" | "collected" | "cancelled";
  total: string;
  pickup_code?: string;
  slot: { id: string; label: string };
  items: ApiOrderItem[];
  paid_at?: string;
  created_at: string;
  client?: { id: string; name: string; email: string };
}

export interface ApiPaymentStatus {
  order_id: string;
  payment_state: string;
  paid_at?: string;
  pickup_code?: string;
}

export interface ApiRedsysParams {
  Ds_SignatureVersion: string;
  Ds_MerchantParameters: string;
  Ds_Signature: string;
}

// ── Auth ───────────────────────────────────────────────────────────────────

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: ApiUser;
}

export async function authGoogle(code: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/userauth/google/", {
    method: "POST",
    body: JSON.stringify({ token: code }),
  });
}

export async function authLogin(email: string, password: string): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/userauth/login/", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function authRegister(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/userauth/register/", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function authLogout(refreshToken: string): Promise<void> {
  await apiFetch("/userauth/logout/", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  }).catch(() => {});
}

export async function getMe(): Promise<ApiUser> {
  return apiFetch<ApiUser>("/userprofile/me/");
}

// ── Catalog ────────────────────────────────────────────────────────────────

export async function getProducts(params?: {
  category?: string;
  search?: string;
}): Promise<ApiProduct[]> {
  const qs = new URLSearchParams();
  if (params?.category) qs.set("category", params.category);
  if (params?.search) qs.set("search", params.search);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<ApiProduct[]>(`/products/${query}`);
}

export async function getCategories(): Promise<ApiCategory[]> {
  return apiFetch<ApiCategory[]>("/categories/");
}

export async function getAllergens(): Promise<ApiAllergen[]> {
  return apiFetch<ApiAllergen[]>("/allergens/");
}

// ── Delivery slots ─────────────────────────────────────────────────────────

export async function getAvailableSlots(date?: string): Promise<ApiSlot[]> {
  const query = date ? `?date=${date}` : "";
  return apiFetch<ApiSlot[]>(`/deliveryslots/available/${query}`);
}

export async function getAdminSlots(): Promise<ApiSlot[]> {
  return apiFetch<ApiSlot[]>("/deliveryslots/");
}

export async function updateSlot(
  id: string,
  data: { capacity?: number; active?: boolean }
): Promise<void> {
  await apiFetch(`/deliveryslots/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ── Orders (client) ────────────────────────────────────────────────────────

export async function getMyOrders(): Promise<ApiOrder[]> {
  return apiFetch<ApiOrder[]>("/orders/");
}

export async function createOrder(
  slotId: string,
  items: { product_id: string; quantity: number }[]
): Promise<ApiOrder> {
  return apiFetch<ApiOrder>("/orders/", {
    method: "POST",
    body: JSON.stringify({ slot_id: slotId, items }),
  });
}

// ── Payments ───────────────────────────────────────────────────────────────

export async function initiatePayment(orderId: string): Promise<ApiRedsysParams> {
  return apiFetch<ApiRedsysParams>("/payments/", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId }),
  });
}

export async function getOrderPaymentStatus(orderId: string): Promise<ApiPaymentStatus> {
  return apiFetch<ApiPaymentStatus>(`/payments/${orderId}/`);
}

/** Build and auto-submit a Redsys payment form.  */
export function submitRedsysForm(params: ApiRedsysParams): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = REDSYS_URL;

  const fields: [string, string][] = [
    ["Ds_SignatureVersion", params.Ds_SignatureVersion],
    ["Ds_MerchantParameters", params.Ds_MerchantParameters],
    ["Ds_Signature", params.Ds_Signature],
  ];

  fields.forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

// ── Admin orders ───────────────────────────────────────────────────────────

export async function getAllOrders(params?: {
  state?: string;
  slot_id?: string;
}): Promise<ApiOrder[]> {
  const qs = new URLSearchParams();
  if (params?.state) qs.set("state", params.state);
  if (params?.slot_id) qs.set("slot_id", params.slot_id);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch<ApiOrder[]>(`/orders/all/${query}`);
}

export async function updateOrderState(
  id: string,
  state: string
): Promise<ApiOrder> {
  return apiFetch<ApiOrder>(`/orders/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ state }),
  });
}

// ── Admin products ─────────────────────────────────────────────────────────

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  image?: string;
  available?: boolean;
  prepare_required?: boolean;
  category?: string[]; // UUID strings
  allergens?: string[];  // UUID strings
}): Promise<{ id: string }> {
  console.log(data);
  
  return apiFetch<{ id: string }>("/products/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    image: string;
    available: boolean;
    prepare_required: boolean;
    category: string[]; // UUID strings
    allergens: string[];  // UUID strings
  }>
): Promise<{ id: string }> {
  return apiFetch<{ id: string }>(`/products/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`/products/${id}/`, { method: "DELETE" });
}

// ── Mapping helpers ────────────────────────────────────────────────────────

import type { Product } from "../data/mockData";
import { ALLERGENS } from "../data/mockData";

/** Map a backend ApiProduct to the frontend Product shape. */
export function mapApiProduct(p: ApiProduct): Product {
  const allergenIds = p.allergens.map((a) => {
    const match = ALLERGENS.find(
      (al) => al.label.toLowerCase() === a.name.toLowerCase()
    );
    return match?.id ?? a.name.toLowerCase().replace(/\s+/g, "_");
  });

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    image: p.image ?? "🍽️",
    categories: p.category.map((c) => c.category_id),
    allergens: allergenIds.length > 0 ? allergenIds : undefined,
    stock: p.stock,
    available: p.available,
    requiresPreparation: p.prepare_required || undefined,
    // discount and recommended are frontend-only — not in the backend
  };
}

/** Map a backend ApiCategory to the frontend category shape. */
export function mapApiCategory(c: ApiCategory): { id: string; name: string; icon: string } {
  return {
    id: c.category_id,
    name: c.name,
    icon: c.image ?? "🍽️",
  };
}

/** Map an ApiOrder to a display-ready PendingOrder shape. */
export function mapApiOrderToPending(
  order: ApiOrder,
  allProducts: Product[]
): import("../data/mockData").PendingOrder {
  const items = order.items.map((item) => {
    const product =
      allProducts.find((p) => p.id === item.product_id) ?? {
        id: item.product_id,
        name: item.product_name,
        price: parseFloat(item.unit_price),
        image: "🍽️",
        categories: [],
        description: "",
      };
    return { product, quantity: item.quantity };
  });

  const createdAt = new Date(order.created_at);
  const diffMs = Date.now() - createdAt.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const placedAt =
    diffMin < 1
      ? "Ahora"
      : diffMin < 60
        ? `Hace ${diffMin} min`
        : `Hace ${Math.floor(diffMin / 60)}h`;

  return {
    id: order.pickup_code ? `#${order.pickup_code}` : `#${order.id.slice(-6)}`,
    items,
    total: parseFloat(order.total),
    claimSlot: order.slot.label,
    placedAt,
  };
}

/** Map an ApiOrder to the OrderGroup history shape. */
export function mapApiOrderToGroup(
  order: ApiOrder,
  allProducts: Product[]
): import("../data/mockData").OrderGroup & { total: number; code: string } {
  const createdAt = new Date(order.created_at);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let dateLabel: string;
  if (createdAt.toDateString() === today.toDateString()) {
    dateLabel = `Hoy, ${createdAt.getHours().toString().padStart(2, "0")}:${createdAt.getMinutes().toString().padStart(2, "0")}`;
  } else if (createdAt.toDateString() === yesterday.toDateString()) {
    dateLabel = `Ayer, ${createdAt.getHours().toString().padStart(2, "0")}:${createdAt.getMinutes().toString().padStart(2, "0")}`;
  } else {
    dateLabel = createdAt.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const items = order.items.flatMap((item) => {
    const product =
      allProducts.find((p) => p.id === item.product_id) ?? {
        id: item.product_id,
        name: item.product_name,
        price: parseFloat(item.unit_price),
        image: "🍽️",
        categories: [],
        description: "",
      };
    return Array.from({ length: item.quantity }, () => product);
  });

  return {
    id: order.id,
    code: order.pickup_code ?? order.id.slice(-6).toUpperCase(),
    date: dateLabel,
    items,
    total: parseFloat(order.total),
  };
}
