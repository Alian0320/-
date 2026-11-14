export type AllowedDistrict = '羅東鎮' | '冬山鄉' | '五結鄉';
export type DistrictValue = AllowedDistrict | string; // Could be '宜蘭市', '無法判定', etc.

export type SortMode = 'geo_cluster' | 'original_order';

export interface RawOrderItem {
  id: string;
  sourceIndex: number;       // Original appearance order (0-based)
  sourceLabel?: string;      // e.g., "截圖 #1" or "影片 00:04"
  recipientName: string;
  rawAddress: string;
  rawDistrict?: string;      // District mentioned or inferred by OCR
  rawFloor?: string;         // Floor info extracted
  notes?: string;            // Delivery notes / remarks
  orderCount?: number;       // Default 1, or if screenshot already shows "+2" / "x2"
  ocrConfidence?: 'high' | 'medium' | 'low';
  ocrUncertainReason?: string;
}

export interface ParsedStop {
  id: string;
  sequenceNumber: number;    // Continuous 1..N across all groups
  groupIndex: number;        // 1-based group number
  recipientName: string;
  orderCount: number;        // Total merged orders at this stop
  displayNameWithCount: string; // e.g. "張璇珠+9" or "王小明"
  district: DistrictValue;
  isDistrictConfirmed: boolean;
  isOutOfRange: boolean;     // True if not in 羅東鎮 / 冬山鄉 / 五結鄉 or unknown
  roadName: string;          // Verified or raw road name
  isRoadUncertain: boolean;  // True if flagged ⚠️ [請確認路名]
  roadSuggestion?: string;   // Suggested real Yilan road if uncertain
  ocrCorrectionApplied?: string; // e.g. "清溝綠濲 → 清溝路"
  floorDisplay: string;      // e.g. "(3樓)" or "" (1樓 omitted)
  displayAddress: string;    // Clean address without 宜蘭縣/鄉鎮村里, e.g. "清溝路297巷11號(3樓)"
  navQueryAddress: string;   // With district prefix, no floor/notes, e.g. "冬山鄉清溝路297巷11號"
  singleNavUrl: string;      // Sanitized UTF-8 percent-encoded Google Maps search URL
  warnings: string[];        // e.g. ["⚠️ [請確認路名]", "⚠️ [超出範圍/需確認]"]
  sourceOrders: RawOrderItem[]; // Constituent raw orders merged into this stop
  corridorName: string;      // Geographic micro-cluster corridor label
}

export interface RouteGroup {
  groupNumber: number;       // 1, 2, 3...
  stops: ParsedStop[];       // Max 8 stops
  multiStopNavUrl: string;   // Sanitized UTF-8 Google Maps dir URL with waypoints & destination
  districtSummary: string;   // e.g. "冬山鄉 · 羅東鎮"
}

export interface RouteParseResult {
  stats: {
    totalOrders: number;     // 總共幾筆
    uniqueStops: number;     // 不重複幾筆
    totalGroups: number;     // 共幾組
    warningCount: number;
    mergedDuplicateCount: number;
  };
  sortMode: SortMode;
  groups: RouteGroup[];
  formattedMarkdown: string;
  formattedPlainText: string;
}
