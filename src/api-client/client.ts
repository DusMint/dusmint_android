import axios, { AxiosInstance } from 'axios';
import {
  UserProfile,
  Address,
  ClusterInfo,
  DeliverySlot,
  VendorShop,
  CatalogueCategory,
  CatalogueItem,
  CreateOrderPayload,
  OrderSummary,
  QualityClaimPayload,
} from './types';

const SUPABASE_REST_URL = 'https://pjyyjzghatmgvyufcbln.supabase.co/rest/v1';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqeXlqemdoYXRtZ3Z5dWZjYmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMTIwNzUsImV4cCI6MjEwODU4ODA3NX0.5FWkOKbtu7nn8LWQvHPi6UkrFsDBTeRWSWDH0CV0J5E';

export class DusmintApiClient {
  private client: AxiosInstance;
  private supabase: AxiosInstance;
  private authToken: string | null = null;
  private currentUserId: string = '76a64e55-e036-4d6b-9875-a8a7214ba6d3';

  constructor(baseURL: string = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.102:3000/api/v1') {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.supabase = axios.create({
      baseURL: SUPABASE_REST_URL,
      timeout: 10000,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
    });

    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });
  }

  public setAuthToken(token: string | null, userId?: string) {
    this.authToken = token;
    if (userId) {
      this.currentUserId = userId;
    }
  }

  public setUserId(userId: string) {
    this.currentUserId = userId;
  }

  // --- Auth & Profile ---
  async sendPhoneOtp(phone: string): Promise<{ success: boolean; message: string; devOtp?: string }> {
    const res = await this.client.post('/auth/otp/send', { phone });
    return res.data;
  }

  async verifyPhoneOtp(phone: string, otp: string): Promise<{ token: string; user: UserProfile }> {
    const res = await this.client.post('/auth/otp/verify', { phone, otp });
    return res.data;
  }

  async getProfile(): Promise<UserProfile> {
    const res = await this.client.get('/user/profile');
    return res.data;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const payload: any = {};
      if (updates.fullName !== undefined) payload.name = updates.fullName;
      if (updates.preferredLanguage !== undefined) payload.language = updates.preferredLanguage;
      if (updates.isVegOnly !== undefined) payload.veg_only = updates.isVegOnly;
      if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;

      const res = await this.supabase.patch(`/profiles?id=eq.${this.currentUserId}`, payload);
      if (res.data && res.data.length > 0) {
        const p = res.data[0];
        return {
          id: p.id,
          phone: p.phone,
          fullName: p.name,
          email: `${p.phone ? p.phone.slice(-10) : 'customer'}@dusmint.com`,
          preferredLanguage: p.language || 'en',
          trustTier: p.trust_tier || 1,
          isVegOnly: p.veg_only || false,
          avatarUrl: p.avatar_url,
          createdAt: p.created_at,
        };
      }
    } catch {
      // fallback to fastify
    }
    const res = await this.client.patch('/user/profile', updates);
    return res.data;
  }

  // --- Cluster & Addresses ---
  async checkServiceability(lat: number, lng: number): Promise<ClusterInfo> {
    try {
      // Direct Supabase RPC check if available
      const rpcRes = await this.supabase.post('/rpc/check_cluster_serviceability', {
        p_lat: lat,
        p_lng: lng,
      });
      if (rpcRes.data && rpcRes.data.length > 0) {
        const c = rpcRes.data[0];
        return {
          clusterId: c.cluster_id,
          clusterName: c.cluster_name,
          city: c.city,
          isServiceable: c.is_serviceable,
          distanceMeters: c.distance_meters,
        };
      }
    } catch {
      // fallback to fastify
    }
    const res = await this.client.get('/clusters/check-serviceability', {
      params: { lat, lng },
    });
    return res.data;
  }

  async getSavedAddresses(): Promise<Address[]> {
    try {
      // 1. Try Supabase RPC get_user_addresses
      const rpcRes = await this.supabase.post('/rpc/get_user_addresses', {
        p_user_id: this.currentUserId,
      });
      if (Array.isArray(rpcRes.data) && rpcRes.data.length > 0) {
        return rpcRes.data;
      }

      // 2. Try direct Supabase table query
      const res = await this.supabase.get(
        `/addresses?user_id=eq.${this.currentUserId}&order=is_default.desc,created_at.desc`
      );
      if (res.data && res.data.length > 0) {
        return res.data.map((a: any) => ({
          id: a.id,
          userId: a.user_id,
          clusterId: a.cluster_id,
          label: (a.label || 'home').toLowerCase() as any,
          houseNo: a.house || 'Flat 402',
          buildingName: a.landmark || '',
          streetArea: a.landmark || 'Vijay Nagar, Scheme 54',
          landmark: a.landmark,
          pincode: a.pincode || '452010',
          latitude: a.lat || 22.7533,
          longitude: a.lng || 75.8937,
          isDefault: a.is_default || false,
        }));
      }
    } catch {
      // fallback to fastify
    }
    try {
      const res = await this.client.get('/user/addresses');
      return res.data;
    } catch {
      return [];
    }
  }

  async saveAddress(address: Partial<Address>): Promise<Address> {
    try {
      const lat = address.latitude || 22.7533;
      const lng = address.longitude || 75.8937;
      // 1. Try Supabase RPC save_user_address
      const rpcRes = await this.supabase.post('/rpc/save_user_address', {
        p_user_id: this.currentUserId,
        p_label: address.label || 'Home',
        p_house: address.houseNo || 'Flat 402',
        p_landmark: address.landmark || address.buildingName || '',
        p_street_area: address.streetArea || 'Scheme 54, Vijay Nagar',
        p_pincode: address.pincode || '452010',
        p_lat: lat,
        p_lng: lng,
        p_is_default: address.isDefault ?? true,
        p_cluster_id: address.clusterId || null,
      });
      if (rpcRes.data && rpcRes.data.id) {
        return rpcRes.data;
      }
    } catch {
      // fallback to fastify
    }
    const res = await this.client.post('/user/addresses', address);
    return res.data;
  }

  async deleteAddress(addressId: string): Promise<boolean> {
    try {
      await this.supabase.post('/rpc/delete_user_address', {
        p_address_id: addressId,
        p_user_id: this.currentUserId,
      });
      return true;
    } catch {
      // fallback
    }
    try {
      await this.supabase.delete(`/addresses?id=eq.${addressId}&user_id=eq.${this.currentUserId}`);
      return true;
    } catch {
      // fallback
    }
    try {
      await this.client.delete(`/user/addresses/${addressId}`);
      return true;
    } catch {
      return false;
    }
  }

  // --- Catalogue & Discovery ---
  async getCategories(clusterId?: string): Promise<CatalogueCategory[]> {
    try {
      const res = await this.supabase.get('/categories?is_active=eq.true&order=sort_order.asc');
      if (res.data && res.data.length > 0) {
        return res.data.map((c: any) => ({
          id: c.id,
          slug: c.slug,
          nameEn: c.name_en || c.name || 'Category',
          nameHi: c.name_hi,
          iconUrl: c.image_url || c.icon_url,
          displayOrder: c.sort_order || 0,
        }));
      }
    } catch {
      // fallback to fastify
    }
    const cId = clusterId || '30ed6f87-45ec-484c-9a49-d70166473aa2';
    const res = await this.client.get(`/clusters/${cId}/categories`);
    return res.data;
  }

  async getVendors(clusterId: string, categoryId?: string): Promise<VendorShop[]> {
    const res = await this.client.get(`/clusters/${clusterId}/vendors`, {
      params: { categoryId },
    });
    return res.data;
  }

  async getCatalogueItems(vendorId: string): Promise<CatalogueItem[]> {
    const res = await this.client.get(`/vendors/${vendorId}/items`);
    return res.data;
  }

  async getAllItems(categoryId?: string): Promise<CatalogueItem[]> {
    try {
      let query = '/items?in_stock=eq.true&select=*,vendors(name,category)';
      if (categoryId) query += `&category_id=eq.${categoryId}`;
      const res = await this.supabase.get(query);
      if (res.data && res.data.length > 0) {
        return res.data.map((i: any) => ({
          id: i.id,
          vendorId: i.vendor_id || 'vendor-default',
          vendorName: i.vendors?.name || 'Local Dukandar',
          categoryId: i.category_id || 'cat-general',
          nameEn: i.name_en || i.name || 'Fresh Item',
          nameHi: i.name_hi || i.name_en || i.name,
          unit: i.unit || '1 pc',
          stepQuantity: 1,
          pricePaise: Math.round(Number(i.price || 0) * 100),
          mrpPaise: i.mrp ? Math.round(Number(i.mrp) * 100) : undefined,
          photoUrl: i.photo_url || i.image_url,
          isInStock: i.in_stock !== false,
        }));
      }
    } catch {
      // fallback to fastify
    }
    const res = await this.client.get('/items', {
      params: categoryId ? { categoryId } : undefined,
    });
    return res.data;
  }

  async searchItems(clusterId: string, query: string): Promise<CatalogueItem[]> {
    const res = await this.client.get(`/clusters/${clusterId}/search`, {
      params: { q: query },
    });
    return res.data;
  }

  // --- Slots & Ordering ---
  async getDeliverySlots(clusterId: string): Promise<DeliverySlot[]> {
    const res = await this.client.get(`/clusters/${clusterId}/slots`);
    return res.data;
  }

  async createOrder(payload: CreateOrderPayload): Promise<{ orderId: string; orderCode: string; paymentSessionId?: string }> {
    try {
      // Direct Supabase Serverless Atomic RPC Execution
      const rpcRes = await this.supabase.post('/rpc/place_order_atomic', {
        p_user_id: this.currentUserId,
        p_cluster_id: payload.clusterId,
        p_slot_id: payload.deliverySlotId,
        p_address_id: payload.addressId,
        p_payment_mode: payload.paymentMode,
        p_substitution_pref: payload.substitutionPreference || 'remove',
        p_items: payload.items,
        p_customer_notes: payload.customerNotes || null,
      });

      if (rpcRes.data && rpcRes.data.orderId) {
        return {
          orderId: rpcRes.data.orderId,
          orderCode: rpcRes.data.orderCode,
          paymentSessionId: `session_${rpcRes.data.orderId.slice(0, 8)}`,
        };
      }
    } catch {
      // Fallback seamlessly to Fastify Node.js server
    }

    // Fallback to Fastify Node.js server
    const res = await this.client.post('/orders', payload);
    return res.data;
  }

  async getOrders(): Promise<OrderSummary[]> {
    try {
      // Direct Supabase High-Performance Aggregated JSON RPC
      const rpcRes = await this.supabase.post('/rpc/get_customer_orders_json', {
        p_user_id: this.currentUserId,
        p_limit: 20,
        p_offset: 0,
      });

      if (Array.isArray(rpcRes.data) && rpcRes.data.length > 0) {
        return rpcRes.data;
      }
    } catch {
      // Fallback seamlessly to Fastify Node.js server
    }

    // Fallback to Fastify Node.js server
    const res = await this.client.get('/orders');
    return res.data;
  }

  async getOrderDetail(orderId: string): Promise<OrderSummary> {
    try {
      // Direct Supabase Live Order Details RPC
      const rpcRes = await this.supabase.post('/rpc/get_order_details_json', {
        p_order_id: orderId,
        p_user_id: this.currentUserId,
      });

      if (rpcRes.data && rpcRes.data.id) {
        return rpcRes.data;
      }
    } catch {
      // Fallback seamlessly to Fastify Node.js server
    }

    // Fallback to Fastify Node.js server
    const res = await this.client.get(`/orders/${orderId}`);
    return res.data;
  }

  // --- Claims & Trust ---
  async scanSealAndOpenBag(orderId: string, sealQr: string): Promise<{ claimWindowExpiresAt: string }> {
    try {
      const rpcRes = await this.supabase.post('/rpc/verify_order_seal', {
        p_order_id: orderId,
        p_seal_qr: sealQr,
        p_user_id: this.currentUserId,
      });
      if (rpcRes.data && rpcRes.data.claimWindowExpiresAt) {
        return { claimWindowExpiresAt: rpcRes.data.claimWindowExpiresAt };
      }
    } catch {
      // Fallback seamlessly to Fastify Node.js server
    }

    const res = await this.client.post(`/orders/${orderId}/scan-seal`, { sealQr });
    return res.data;
  }

  async submitQualityClaim(payload: QualityClaimPayload): Promise<{ claimId: string; status: string; decision: string }> {
    const res = await this.client.post('/claims', payload);
    return res.data;
  }
}

export const dusmintApi = new DusmintApiClient();
