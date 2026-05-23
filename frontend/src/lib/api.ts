const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body, headers = {}, token } = options;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("ct_token") : null);
    if (authToken) {
      requestHeaders["Authorization"] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      // Handle 401 — token expired or invalid
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("ct_token");
        localStorage.removeItem("ct_user_id");
        window.location.href = "/onboarding";
        throw new Error("Session expired. Please reconnect your wallet.");
      }
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.detail || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async getNonce(address: string) {
    return this.request<{ nonce: string; message: string }>("/auth/nonce", {
      method: "POST",
      body: { address },
    });
  }

  async verifySignature(address: string, signature: string, message: string) {
    return this.request<{ token: string; user_id: string; address: string }>("/auth/verify", {
      method: "POST",
      body: { address, signature, message },
    });
  }

  // User
  async getProfile(token: string) {
    return this.request<UserProfile>("/user/profile", { token });
  }

  async updateSettings(token: string, settings: Record<string, unknown>) {
    return this.request<{ status: string; settings: Record<string, unknown> }>("/user/settings", {
      method: "PATCH",
      body: settings,
      token,
    });
  }

  // Analysis — Public (no auth required)
  async publicScan(wallet_address: string, chains: string[]) {
    return this.request<ScanResult>(
      "/analysis/scan/public",
      { method: "POST", body: { wallet_address, chains } }
    );
  }

  // Analysis — Authenticated
  async startScan(token: string, wallet_address: string, chains: string[]) {
    return this.request<{ task_id: string; wallet_id: string; status: string; mode?: string }>(
      "/analysis/scan",
      { method: "POST", body: { wallet_address, chains }, token }
    );
  }

  async scanStatus(token: string, taskId: string) {
    return this.request<{ task_id: string; status: string; progress?: number; result?: ScanResult; error?: string }>(
      `/analysis/scan/${taskId}/status`,
      { token }
    );
  }

  async getAnalysis(token: string, wallet_address: string) {
    return this.request<Analysis>(`/analysis/${wallet_address}`, { token });
  }

  // Trades
  async getTrades(token: string, params: TradeQueryParams) {
    const sp = new URLSearchParams();
    if (params.page) sp.set("page", params.page.toString());
    if (params.limit) sp.set("limit", params.limit.toString());
    if (params.emotion) sp.set("emotion", params.emotion);

    return this.request<PaginatedResponse<Trade>>(`/trades?${sp.toString()}`, { token });
  }

  async getTradeStats(token: string) {
    return this.request<TradeStats>("/trades/stats", { token });
  }

  async getPublicTrades(wallet_address: string, params: TradeQueryParams = {}) {
    const sp = new URLSearchParams();
    sp.set("wallet_address", wallet_address);
    if (params.page) sp.set("page", params.page.toString());
    if (params.limit) sp.set("limit", params.limit.toString());
    return this.request<PaginatedResponse<Trade>>(`/trades/public?${sp.toString()}`);
  }

  // Alerts
  async getAlerts(token: string, params?: { page?: number; limit?: number }) {
    const sp = new URLSearchParams();
    if (params?.page) sp.set("page", params.page.toString());
    if (params?.limit) sp.set("limit", params.limit.toString());
    return this.request<PaginatedResponse<AlertItem>>(`/alerts?${sp.toString()}`, { token });
  }

  async markAlertRead(token: string, alertId: string) {
    return this.request(`/alerts/${alertId}/read`, { method: "PATCH", token });
  }

  // Chat
  async sendChatMessage(token: string, message: string) {
    return this.request<{ response: string }>("/chat", {
      method: "POST",
      body: { message },
      token,
    });
  }

  async sendPublicChatMessage(message: string, analysisData?: Record<string, unknown>) {
    return this.request<{ response: string }>("/chat/public", {
      method: "POST",
      body: { message, analysis_data: analysisData },
    });
  }

  async getChatHistory(token: string, limit?: number) {
    return this.request<ChatMessage[]>(`/chat/history?limit=${limit || 50}`, { token });
  }

  // Wallets
  async getWallets(token: string) {
    return this.request<Wallet[]>("/user/wallets", { token });
  }

  async addWallet(token: string, address: string, label?: string) {
    return this.request<Wallet>("/user/wallets", {
      method: "POST",
      body: { address, label },
      token,
    });
  }

  async removeWallet(token: string, walletId: string) {
    return this.request(`/user/wallets/${walletId}`, { method: "DELETE", token });
  }
}

export const api = new ApiClient(API_BASE);

// ===== Types — ALL snake_case to match backend =====

export interface UserProfile {
  id: string;
  address: string;
  email: string | null;
  subscription: string;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface Wallet {
  id: string;
  address: string;
  label: string | null;
  chains: string[];
  last_scanned: string | null;
}

export interface ScanResult {
  wallet_id: string;
  trades_found: number;
  new_trades: number;
  scores: EmotionalScores;
  personality: PersonalityProfile;
  stats: AnalysisStats;
  insights: string[];
}

export interface Analysis {
  wallet_address: string;
  scores: EmotionalScores;
  personality: PersonalityProfile;
  stats: AnalysisStats;
  insights: string[];
}

export interface EmotionalScores {
  fomo: number;
  panic: number;
  revenge: number;
  overtrade: number;
  diamond_hands: number;
  overall: number;
}

export interface PersonalityProfile {
  key: string;
  name: string;
  emoji?: string;
  description: string;
}

export interface AnalysisStats {
  total_trades: number;
  win_rate: number;
  total_pnl: number;
  emotional_loss: number;
}

export interface Trade {
  id: string;
  hash: string;
  chain: string;
  token_in: string;
  token_out: string;
  amount_in: number;
  amount_out: number;
  value_usd: number;
  pnl_usd: number | null;
  pnl_percent: number | null;
  emotion_tag: string | null;
  emotion_score: number | null;
  hold_duration_minutes: number | null;
  timestamp: string;
}

export interface TradeStats {
  total_trades: number;
  total_pnl: number;
  win_rate: number;
  avg_hold_time: number;
  biggest_win: number;
  biggest_loss: number;
}

export interface TradeQueryParams {
  page?: number;
  limit?: number;
  emotion?: string;
  token?: string;
  chain?: string;
}

export interface AlertItem {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
