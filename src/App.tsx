import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  Upload,
  Video,
  Image as ImageIcon,
  Navigation,
  Copy,
  Check,
  AlertTriangle,
  Pencil,
  Trash2,
  Search,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  FileText,
  ArrowUpDown,
  Plus,
  X,
} from 'lucide-react';
import {
  parseRawTextToOrders,
  processDeliveryOrders,
  ALLOWED_DISTRICTS,
} from './shared/yilanRouteEngine.ts';
import type { ParsedStop, RawOrderItem, SortMode } from './shared/types.ts';
import {
  extractFramesFromVideo,
  fileToProcessedImage,
  type ProcessedImageFrame,
} from './utils/mediaProcessor.ts';
import { SAMPLE_YILAN_TEXT } from './data/sampleBatch.ts';
import { StopEditorModal } from './components/StopEditorModal.tsx';

type ViewMode = 'groups' | 'markdown';
type DistrictFilter = 'all' | '羅東鎮' | '冬山鄉' | '五結鄉' | 'warnings';

export default function App() {
  const [frames, setFrames] = useState<ProcessedImageFrame[]>([]);
  const [rawTextInput, setRawTextInput] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('geo_cluster');
  const [rawOrders, setRawOrders] = useState<RawOrderItem[]>([]);
  const [isExtractingMedia, setIsExtractingMedia] = useState(false);
  const [mediaExtractProgress, setMediaExtractProgress] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoDetectedOrderNotice, setAutoDetectedOrderNotice] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('groups');
  const [markdownTab, setMarkdownTab] = useState<'markdown' | 'plaintext'>('markdown');
  const [districtFilter, setDistrictFilter] = useState<DistrictFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedType, setCopiedType] = useState<'markdown' | 'plaintext' | null>(null);

  const [editingStop, setEditingStop] = useState<ParsedStop | null>(null);
  const [expandedStopIds, setExpandedStopIds] = useState<Record<string, boolean>>({});
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live reactive route computation from rawOrders + sortMode
  const routeResult = useMemo(() => {
    if (rawOrders.length === 0) return null;
    return processDeliveryOrders(rawOrders, sortMode);
  }, [rawOrders, sortMode]);

  const handleFilesSelected = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setErrorMsg(null);
    setIsExtractingMedia(true);
    setMediaExtractProgress(0);

    try {
      const newlyProcessed: ProcessedImageFrame[] = [];
      let imgIdx = frames.length;

      for (const file of files) {
        if (file.type.startsWith('video/')) {
          const vidFrames = await extractFramesFromVideo(file, 14, (pct) => {
            setMediaExtractProgress(pct);
          });
          newlyProcessed.push(...vidFrames);
        } else if (file.type.startsWith('image/')) {
          const processed = await fileToProcessedImage(file, imgIdx++);
          newlyProcessed.push(processed);
        }
      }

      if (newlyProcessed.length === 0) {
        setErrorMsg('請選擇圖片（PNG/JPG/WebP）或外送錄影影片檔（MP4/MOV/WebM）。');
      } else {
        setFrames((prev) => [...prev, ...newlyProcessed]);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '檔案處理失敗');
    } finally {
      setIsExtractingMedia(false);
      setMediaExtractProgress(0);
    }
  }, [frames.length]);

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
        }
      }
      if (imageFiles.length > 0) {
        e.preventDefault();
        await handleFilesSelected(imageFiles);
      }
    },
    [handleFilesSelected]
  );

  const handleParseSubmit = async () => {
    setErrorMsg(null);
    setAutoDetectedOrderNotice(false);

    if (frames.length === 0 && rawTextInput.trim().length === 0) {
      setErrorMsg('請先上傳外送截圖／影片，或在下方輸入訂單清單文字。');
      return;
    }

    const instructionDisabledGeo = /取消地理微聚類|照影片|原始順序|不要聚類|照順序/.test(rawTextInput);
    const effectiveSortMode: SortMode = instructionDisabledGeo ? 'original_order' : sortMode;

    // Fast local path when user only pasted text lines (no screenshots/video frames)
    if (frames.length === 0 && rawTextInput.trim().length > 0) {
      const parsed = parseRawTextToOrders(rawTextInput);
      if (parsed.orders.length === 0) {
        setErrorMsg('無法從文字內容辨識出有效訂單，請確認格式（例如「姓名：地址」）。');
        return;
      }
      if (parsed.detectedDisableGeoCluster) {
        setSortMode('original_order');
        setAutoDetectedOrderNotice(true);
      }
      setRawOrders(parsed.orders);
      setDistrictFilter('all');
      return;
    }

    // Multimodal path: call backend Express + Gemini 4 Hydrogen API
    setIsParsing(true);
    try {
      const response = await fetch('/api/parse-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: frames.map((f) => ({
            base64: f.base64,
            mimeType: f.mimeType,
            label: f.label,
          })),
          rawText: rawTextInput,
          sortMode: effectiveSortMode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '伺服器解析失敗，請稍後再試。');
      }

      if (data.detectedDisableGeoCluster) {
        setSortMode('original_order');
        setAutoDetectedOrderNotice(true);
      }

      const orders: RawOrderItem[] = data.rawOrders || [];
      if (orders.length === 0) {
        setErrorMsg('未能從上傳的截圖或影格中提取到任何地址與收件人，請確認畫面清晰度。');
      } else {
        setRawOrders(orders);
        setDistrictFilter('all');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '解析過程發生錯誤');
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadSample = () => {
    setErrorMsg(null);
    setAutoDetectedOrderNotice(false);
    setFrames([]);
    setRawTextInput(SAMPLE_YILAN_TEXT);
    const parsed = parseRawTextToOrders(SAMPLE_YILAN_TEXT);
    setRawOrders(parsed.orders);
    setSortMode('geo_cluster');
    setDistrictFilter('all');
  };

  const handleResetAll = () => {
    setFrames([]);
    setRawTextInput('');
    setRawOrders([]);
    setErrorMsg(null);
    setAutoDetectedOrderNotice(false);
    setDistrictFilter('all');
    setSearchQuery('');
  };

  const handleApplyRoadSuggestion = (stop: ParsedStop) => {
    if (!stop.roadSuggestion) return;
    const sourceIds = new Set(stop.sourceOrders.map((s) => s.id));
    setRawOrders((prev) =>
      prev.map((order) => {
        if (!sourceIds.has(order.id)) return order;
        const updatedAddr = order.rawAddress.includes(stop.roadName)
          ? order.rawAddress.replace(stop.roadName, stop.roadSuggestion!)
          : `${stop.roadSuggestion}${order.rawAddress}`;
        return {
          ...order,
          rawAddress: updatedAddr,
          ocrConfidence: 'high',
          ocrUncertainReason: undefined,
        };
      })
    );
  };

  const handleSaveEditedStop = (updated: {
    stopId: string;
    recipientName: string;
    district: string;
    rawAddress: string;
    orderCount: number;
  }) => {
    if (!routeResult) return;
    const targetStop = routeResult.groups
      .flatMap((g) => g.stops)
      .find((s) => s.id === updated.stopId);
    if (!targetStop) return;

    const sourceIds = new Set(targetStop.sourceOrders.map((s) => s.id));
    const firstSource = targetStop.sourceOrders[0];

    setRawOrders((prev) => {
      const filtered = prev.filter((o) => !sourceIds.has(o.id));
      const replacement: RawOrderItem = {
        id: firstSource ? firstSource.id : `edited-${Date.now()}`,
        sourceIndex: firstSource ? firstSource.sourceIndex : prev.length,
        sourceLabel: firstSource?.sourceLabel || '手動校對',
        recipientName: updated.recipientName,
        rawAddress: updated.rawAddress,
        rawDistrict: updated.district || undefined,
        orderCount: updated.orderCount,
        ocrConfidence: 'high',
      };
      return [...filtered, replacement].sort((a, b) => a.sourceIndex - b.sourceIndex);
    });
  };

  const handleDeleteStop = (stop: ParsedStop) => {
    const sourceIds = new Set(stop.sourceOrders.map((s) => s.id));
    setRawOrders((prev) => prev.filter((o) => !sourceIds.has(o.id)));
  };

  const handleAddManualStop = () => {
    const newItem: RawOrderItem = {
      id: `manual-${Date.now()}`,
      sourceIndex: rawOrders.length,
      sourceLabel: '手動新增',
      recipientName: '新收件人',
      rawAddress: '羅東鎮公正路100號',
      rawDistrict: '羅東鎮',
      orderCount: 1,
      ocrConfidence: 'high',
    };
    setRawOrders((prev) => [...prev, newItem]);
  };

  const handleCopy = async (type: 'markdown' | 'plaintext') => {
    if (!routeResult) return;
    const content =
      type === 'markdown' ? routeResult.formattedMarkdown : routeResult.formattedPlainText;
    try {
      await navigator.clipboard.writeText(content);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      setErrorMsg('複製失敗，請手動選取文字複製。');
    }
  };

  // Filtered groups for display
  const filteredGroups = useMemo(() => {
    if (!routeResult) return [];
    const q = searchQuery.trim().toLowerCase();

    return routeResult.groups
      .map((group) => {
        const stops = group.stops.filter((stop) => {
          if (districtFilter === 'warnings' && stop.warnings.length === 0) return false;
          if (
            districtFilter !== 'all' &&
            districtFilter !== 'warnings' &&
            stop.district !== districtFilter
          ) {
            return false;
          }
          if (q) {
            const haystack = `${stop.recipientName} ${stop.displayAddress} ${stop.district} ${stop.corridorName}`.toLowerCase();
            if (!haystack.includes(q)) return false;
          }
          return true;
        });
        return { ...group, visibleStops: stops };
      })
      .filter((g) => g.visibleStops.length > 0);
  }, [routeResult, districtFilter, searchQuery]);

  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = { 羅東鎮: 0, 冬山鄉: 0, 五結鄉: 0 };
    if (!routeResult) return counts;
    for (const g of routeResult.groups) {
      for (const s of g.stops) {
        if (ALLOWED_DISTRICTS.includes(s.district as '羅東鎮' | '冬山鄉' | '五結鄉')) {
          counts[s.district] = (counts[s.district] || 0) + 1;
        }
      }
    }
    return counts;
  }, [routeResult]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col" onPaste={handlePaste}>
      {/* Top Bar Contract: strictly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element brand wordmark */}
          <a
            href="#top"
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            外送路線解析器 v10
          </a>

          {/* Zone 2: Concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#import-panel"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              截圖匯入
            </a>
            <button
              type="button"
              onClick={() => setViewMode('groups')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'groups' ? 'text-slate-900 underline underline-offset-4' : ''
              }`}
            >
              分組動線
            </button>
            <button
              type="button"
              onClick={() => setViewMode('markdown')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'markdown' ? 'text-slate-900 underline underline-offset-4' : ''
              }`}
            >
              標準輸出
            </button>
            <a
              href="#rules-summary"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              三區校驗規範
            </a>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              載入宜蘭範例
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main id="top" className="flex-1 max-w-[1360px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Multimodal Upload & Instruction Console */}
          <section
            id="import-panel"
            className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-base font-semibold text-slate-900">
                  截圖 / 錄影與清單匯入
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  宜蘭羅東鎮 · 冬山鄉 · 五結鄉專用解析器
                </p>
              </div>
              {(frames.length > 0 || rawTextInput || rawOrders.length > 0) && (
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  清空
                </button>
              )}
            </div>

            {/* Drag & Drop / File Picker */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files) {
                  handleFilesSelected(e.dataTransfer.files);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className={`cursor-pointer rounded-lg border border-dashed p-5 text-center transition-colors ${
                isDragging
                  ? 'border-blue-600 bg-blue-50/50'
                  : 'border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFilesSelected(e.target.files);
                    e.target.value = '';
                  }
                }}
              />
              <div className="flex items-center justify-center gap-2 text-slate-700 mb-2">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">點擊上傳截圖或錄影，或直接 Ctrl+V 貼上</span>
              </div>
              <p className="text-xs text-slate-500">
                支援多張截圖合併、MP4/MOV 螢幕錄影自動抽幀
              </p>
            </div>

            {isExtractingMedia && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-blue-600" />
                    正在擷取影片關鍵影格...
                  </span>
                  <span className="font-mono-tabular">{mediaExtractProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-150"
                    style={{ width: `${mediaExtractProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Uploaded Thumbnails */}
            {frames.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <ImageIcon className="w-3.5 h-3.5" />
                    已載入 {frames.length} 張畫面
                  </span>
                  <button
                    type="button"
                    onClick={() => setFrames([])}
                    className="text-slate-500 hover:text-red-600 transition-colors"
                  >
                    移除全部畫面
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                  {frames.map((frame) => (
                    <div
                      key={frame.id}
                      className="group relative aspect-square rounded-md overflow-hidden border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={frame.previewUrl}
                        alt={frame.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFrames((prev) => prev.filter((f) => f.id !== frame.id));
                        }}
                        aria-label={`移除 ${frame.label}`}
                        className="absolute top-1 right-1 p-1 rounded bg-slate-900/75 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input / Instructions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="raw-text-input" className="text-xs font-medium text-slate-700">
                  文字清單或排序補充指令
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setRawTextInput((prev) =>
                      prev.includes('取消地理微聚類')
                        ? prev
                        : `${prev ? prev + '\n' : ''}取消地理微聚類就照影片上的順序排列`
                    )
                  }
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0"
                >
                  + 插入「照影片順序」指令
                </button>
              </div>
              <textarea
                id="raw-text-input"
                rows={6}
                value={rawTextInput}
                onChange={(e) => setRawTextInput(e.target.value)}
                placeholder="可貼上外送文字清單（例如：張璇珠：清溝路297巷11號），或搭配截圖輸入指令如「取消地理微聚類就照影片上的順序排列」..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-xs leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>

            {/* Sorting Mode Segmented Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 inline-flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  分組排序邏輯（每組上限 8 筆）
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSortMode('geo_cluster')}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    sortMode === 'geo_cluster'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  地理微聚類動線
                </button>
                <button
                  type="button"
                  onClick={() => setSortMode('original_order')}
                  className={`px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                    sortMode === 'original_order'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  原始影片／清單順序
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                {sortMode === 'geo_cluster'
                  ? '預設依宜蘭主幹道與巷弄微聚類排序，減少折返跑。'
                  : '已取消地理微聚類，嚴格依來源影片或清單原始出現順序分組。'}
              </p>
            </div>

            {autoDetectedOrderNotice && (
              <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-900">
                已偵測到「取消地理微聚類」指令，系統已自動切換為原始順序排列。
              </div>
            )}

            {errorMsg && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-xs text-red-800 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleParseSubmit}
              disabled={isParsing || isExtractingMedia}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {isParsing
                ? '正在執行 OCR 提取與三區校對...'
                : frames.length > 0
                  ? `解析 ${frames.length} 張畫面並生成路線`
                  : '解析清單並生成路線'}
            </button>

            {/* Rules Reference Block (concise, unboxed dividers) */}
            <div id="rules-summary" className="pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-500">
              <div className="font-medium text-slate-700">v10 解析核心規則</div>
              <ul className="space-y-1 list-disc list-inside leading-relaxed">
                <li>全局合併重複收件人與相同地址，標示 +N 筆數</li>
                <li>宜蘭路名同音字反向校對（如清溝綠濲 → 清溝路）</li>
                <li>嚴格校驗羅東鎮、冬山鄉、五結鄉三區範圍</li>
                <li>清單隱藏行政區與村里，1 樓省略、2 樓以上標 (X樓)</li>
                <li>導航連結自動補全鄉鎮並淨化樓層備註與 UTF-8 編碼</li>
              </ul>
            </div>
          </section>

          {/* Right Column: Parsed Statistics, Groups & Formatted Output */}
          <section className="lg:col-span-8 space-y-5">
            {/* Header Statistics (Rule 1: Always clearly displayed at the very top of parsed results) */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="grid grid-cols-3 divide-x divide-slate-200">
                <div className="pr-4">
                  <div className="text-xs font-medium text-slate-500">總共幾筆</div>
                  <div className="mt-1 text-2xl sm:text-3xl font-bold font-mono-tabular text-slate-900">
                    {routeResult ? routeResult.stats.totalOrders : 0}
                    <span className="ml-1 text-sm font-normal text-slate-500">筆</span>
                  </div>
                </div>
                <div className="px-4">
                  <div className="text-xs font-medium text-slate-500">不重複幾筆</div>
                  <div className="mt-1 text-2xl sm:text-3xl font-bold font-mono-tabular text-blue-600">
                    {routeResult ? routeResult.stats.uniqueStops : 0}
                    <span className="ml-1 text-sm font-normal text-slate-500">筆</span>
                  </div>
                </div>
                <div className="pl-4">
                  <div className="text-xs font-medium text-slate-500">共幾組（每組上限 8 筆）</div>
                  <div className="mt-1 text-2xl sm:text-3xl font-bold font-mono-tabular text-slate-900">
                    {routeResult ? routeResult.stats.totalGroups : 0}
                    <span className="ml-1 text-sm font-normal text-slate-500">組</span>
                  </div>
                </div>
              </div>

              {routeResult && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>
                      已全局合併重複訂單{' '}
                      <strong className="font-mono-tabular text-slate-800">
                        {routeResult.stats.mergedDuplicateCount}
                      </strong>{' '}
                      筆
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      排序：{routeResult.sortMode === 'geo_cluster' ? '地理微聚類動線' : '原始影片／清單順序'}
                    </span>
                    {routeResult.stats.warningCount > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 font-medium text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          需確認項目 {routeResult.stats.warningCount} 筆
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddManualStop}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      新增點位
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopy('markdown')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                    >
                      {copiedType === 'markdown' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          已複製 Markdown
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          複製標準清單
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {isParsing && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
                <div className="text-sm font-medium text-slate-700">
                  正在進行多圖 OCR 提取、宜蘭路名反向校對與動線分組...
                </div>
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-11 rounded-lg bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isParsing && !routeResult && (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-4">
                <div className="mx-auto w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Navigation className="w-5 h-5" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h2 className="text-base font-semibold text-slate-900">
                    尚未載入外送路線
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    請於左側上傳外送截圖或螢幕錄影，或直接於頁面按 Ctrl+V 貼上截圖。您也可以載入宜蘭三區範例測試全部 v10 規則。
                  </p>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="w-4 h-4" />
                    載入宜蘭範例測試（28 筆合併示範）
                  </button>
                </div>
              </div>
            )}

            {/* Populated Workspace */}
            {!isParsing && routeResult && (
              <div className="space-y-4">
                {/* Filter & View Switcher Bar */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setViewMode('groups')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                        viewMode === 'groups'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      分組導航清單
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('markdown')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                        viewMode === 'markdown'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      標準格式化文字
                    </button>
                  </div>

                  {viewMode === 'groups' && (
                    <div className="relative flex-1 sm:max-w-xs">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜尋姓名、路名或門牌..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                      />
                    </div>
                  )}
                </div>

                {viewMode === 'groups' ? (
                  <>
                    {/* District & Warning Filter Bar */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(
                        [
                          { id: 'all', label: `全部 (${routeResult.stats.uniqueStops})` },
                          { id: '羅東鎮', label: `羅東鎮 (${districtCounts['羅東鎮'] || 0})` },
                          { id: '冬山鄉', label: `冬山鄉 (${districtCounts['冬山鄉'] || 0})` },
                          { id: '五結鄉', label: `五結鄉 (${districtCounts['五結鄉'] || 0})` },
                          {
                            id: 'warnings',
                            label: `待確認項目 (${routeResult.stats.warningCount})`,
                          },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setDistrictFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                            districtFilter === tab.id
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Group Cards (Single Elevation, Max 8 Stops per Group, Continuous Numbering) */}
                    {filteredGroups.length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500">
                        目前篩選條件下沒有符合的點位。
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredGroups.map((group) => {
                          const firstSeq = group.stops[0]?.sequenceNumber ?? 1;
                          const lastSeq = group.stops[group.stops.length - 1]?.sequenceNumber ?? 1;

                          return (
                            <div
                              key={group.groupNumber}
                              className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                            >
                              {/* Group Header */}
                              <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                  <span className="font-semibold text-slate-900">
                                    第 {group.groupNumber} 組
                                  </span>
                                  <span className="text-slate-300" aria-hidden="true">
                                    ·
                                  </span>
                                  <span className="font-mono-tabular text-xs text-slate-600">
                                    #{firstSeq}–#{lastSeq}（{group.stops.length} / 8 站）
                                  </span>
                                  <span className="text-slate-300" aria-hidden="true">
                                    ·
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {group.districtSummary}
                                  </span>
                                </div>

                                <a
                                  href={group.multiStopNavUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
                                >
                                  <Navigation className="w-3.5 h-3.5" />
                                  開啟多點導航（{group.stops.length} 站）
                                  <ExternalLink className="w-3 h-3 opacity-80" />
                                </a>
                              </div>

                              {/* Stop Rows */}
                              <div className="divide-y divide-slate-100">
                                {group.visibleStops.map((stop) => {
                                  const isExpanded = Boolean(expandedStopIds[stop.id]);
                                  return (
                                    <div
                                      key={stop.id}
                                      className="px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
                                    >
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                          {/* Continuous Sequence Number */}
                                          <span className="w-7 text-right font-mono-tabular text-sm font-semibold text-slate-400 shrink-0 pt-0.5">
                                            {stop.sequenceNumber}.
                                          </span>

                                          <div className="min-w-0 space-y-1">
                                            {/* Primary v10 Format Line: 姓名+數量：[地址](導航連結) */}
                                            <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1 text-sm">
                                              <span className="font-semibold text-slate-900">
                                                {stop.displayNameWithCount}
                                              </span>
                                              <span className="text-slate-400">：</span>
                                              <a
                                                href={stop.singleNavUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={`導航至：${stop.navQueryAddress}`}
                                                className="font-medium text-blue-600 hover:text-blue-800 underline decoration-blue-300 underline-offset-4 inline-flex items-center gap-1"
                                              >
                                                <span>{stop.displayAddress}</span>
                                                <ExternalLink className="w-3 h-3 shrink-0" />
                                              </a>
                                            </div>

                                            {/* Clean Unboxed Metadata Line */}
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                              <span
                                                className={
                                                  stop.isOutOfRange ? 'text-red-700 font-medium' : ''
                                                }
                                              >
                                                {stop.district}
                                              </span>
                                              <span aria-hidden="true">·</span>
                                              <span>{stop.corridorName}</span>
                                              <span aria-hidden="true">·</span>
                                              <span className="font-mono-tabular text-[11px] text-slate-400">
                                                導航鍵字：{stop.navQueryAddress}
                                              </span>
                                              {stop.ocrCorrectionApplied && (
                                                <>
                                                  <span aria-hidden="true">·</span>
                                                  <span className="text-emerald-700 font-medium">
                                                    已校對：{stop.ocrCorrectionApplied}
                                                  </span>
                                                </>
                                              )}
                                              {stop.orderCount > 1 && (
                                                <>
                                                  <span aria-hidden="true">·</span>
                                                  <button
                                                    type="button"
                                                    onClick={() =>
                                                      setExpandedStopIds((prev) => ({
                                                        ...prev,
                                                        [stop.id]: !prev[stop.id],
                                                      }))
                                                    }
                                                    className="text-slate-600 hover:text-slate-900 underline underline-offset-2"
                                                  >
                                                    {isExpanded
                                                      ? '收合合併明細'
                                                      : `合併 ${stop.orderCount} 筆訂單（${stop.sourceOrders.length} 條來源）`}
                                                  </button>
                                                </>
                                              )}
                                            </div>

                                            {/* Warnings (Never hue-only: explicit icon + warning text) */}
                                            {stop.warnings.length > 0 && (
                                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                                {stop.warnings.map((w) => (
                                                  <span
                                                    key={w}
                                                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                                                      w.includes('超出範圍')
                                                        ? 'text-red-700'
                                                        : 'text-amber-700'
                                                    }`}
                                                  >
                                                    {w}
                                                  </span>
                                                ))}
                                                {stop.roadSuggestion && (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleApplyRoadSuggestion(stop)}
                                                    className="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-medium transition-colors whitespace-nowrap"
                                                  >
                                                    一鍵修正為「{stop.roadSuggestion}」
                                                  </button>
                                                )}
                                              </div>
                                            )}

                                            {/* Expandable Raw Merged Source Orders */}
                                            {isExpanded && stop.sourceOrders.length > 0 && (
                                              <div className="mt-2 pl-3 border-l border-slate-200 space-y-1 text-xs text-slate-500">
                                                {stop.sourceOrders.map((src, sIdx) => (
                                                  <div key={src.id + sIdx}>
                                                    原始 #{src.sourceIndex + 1}（{src.sourceLabel || '來源'}）：
                                                    {src.recipientName}
                                                    {src.orderCount && src.orderCount > 1
                                                      ? `+${src.orderCount}`
                                                      : ''}{' '}
                                                    — {src.rawAddress}
                                                    {src.notes ? ` · 備註：${src.notes}` : ''}
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Row Actions */}
                                        <div className="flex items-center gap-1.5 pl-10 sm:pl-0 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => setEditingStop(stop)}
                                            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                            title="編輯此點位"
                                            aria-label={`編輯 ${stop.recipientName}`}
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteStop(stop)}
                                            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            title="移除此點位"
                                            aria-label={`移除 ${stop.recipientName}`}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  /* Standard Formatted Markdown / Plaintext Export View */
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                      <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setMarkdownTab('markdown')}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                            markdownTab === 'markdown'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Markdown 連結格式（姓名+數量：[地址](網址)）
                        </button>
                        <button
                          type="button"
                          onClick={() => setMarkdownTab('plaintext')}
                          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                            markdownTab === 'plaintext'
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          純文字 LINE 傳送格式
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(markdownTab)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                      >
                        {copiedType === markdownTab ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            已複製到剪貼簿
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            複製全文
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-5 text-xs leading-relaxed font-mono-tabular text-slate-800 whitespace-pre-wrap break-all overflow-x-auto max-h-[680px]">
                      {markdownTab === 'markdown'
                        ? routeResult.formattedMarkdown
                        : routeResult.formattedPlainText}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      <StopEditorModal
        stop={editingStop}
        isOpen={Boolean(editingStop)}
        onClose={() => setEditingStop(null)}
        onSave={handleSaveEditedStop}
      />
    </div>
  );
}
