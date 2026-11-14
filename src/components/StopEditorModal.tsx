import React, { useState, useEffect } from 'react';
import { X, Check, AlertTriangle } from 'lucide-react';
import type { ParsedStop } from '../shared/types.ts';
import { ALLOWED_DISTRICTS } from '../shared/yilanRouteEngine.ts';

interface StopEditorModalProps {
  stop: ParsedStop | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: {
    stopId: string;
    recipientName: string;
    district: string;
    rawAddress: string;
    orderCount: number;
  }) => void;
}

export const StopEditorModal: React.FC<StopEditorModalProps> = ({
  stop,
  isOpen,
  onClose,
  onSave,
}) => {
  const [recipientName, setRecipientName] = useState('');
  const [district, setDistrict] = useState('羅東鎮');
  const [rawAddress, setRawAddress] = useState('');
  const [orderCount, setOrderCount] = useState(1);

  useEffect(() => {
    if (stop) {
      setRecipientName(stop.recipientName);
      setDistrict(stop.district === '無法判定' ? '' : stop.district);
      setRawAddress(stop.displayAddress);
      setOrderCount(stop.orderCount);
    }
  }, [stop]);

  if (!isOpen || !stop) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      stopId: stop.id,
      recipientName: recipientName.trim() || '未具名收件人',
      district: district.trim(),
      rawAddress: rawAddress.trim(),
      orderCount: Math.max(1, orderCount),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stop-editor-title"
    >
      <div className="w-full max-w-lg rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 id="stop-editor-title" className="text-base font-semibold text-slate-900">
            校對點位資料 · #{stop.sequenceNumber}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="關閉視窗"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {stop.warnings.length > 0 && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{stop.warnings.join(' · ')}</span>
              </div>
              {stop.roadSuggestion && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-amber-800">
                    建議修正路名為：<strong className="font-semibold">{stop.roadSuggestion}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (stop.roadSuggestion && stop.roadName) {
                        setRawAddress((prev) => prev.replace(stop.roadName, stop.roadSuggestion!));
                      }
                    }}
                    className="px-2.5 py-1 rounded bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors whitespace-nowrap shrink-0"
                  >
                    套用建議路名
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                收件人姓名
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                訂單數量 (+N)
              </label>
              <input
                type="number"
                min={1}
                max={99}
                value={orderCount}
                onChange={(e) => setOrderCount(parseInt(e.target.value, 10) || 1)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono-tabular text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              行政區（宜蘭三區校驗）
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {ALLOWED_DISTRICTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDistrict(d)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    district === d
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="例如：羅東鎮、冬山鄉、五結鄉"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              地址與樓層（系統會自動淨化清單顯示與導航連結）
            </label>
            <input
              type="text"
              value={rawAddress}
              onChange={(e) => setRawAddress(e.target.value)}
              placeholder="例如：清溝路297巷11號(3樓)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              required
            />
          </div>

          {stop.sourceOrders.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="text-xs font-medium text-slate-600 mb-1.5">
                原始合併明細（{stop.sourceOrders.length} 筆來源紀錄）
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-200">
                {stop.sourceOrders.map((src, i) => (
                  <div key={src.id + i} className="truncate">
                    #{src.sourceIndex + 1} · {src.recipientName}
                    {src.orderCount && src.orderCount > 1 ? `+${src.orderCount}` : ''} — {src.rawAddress}
                    {src.notes ? ` (${src.notes})` : ''}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              取消
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0"
            >
              <Check className="w-4 h-4" />
              儲存並重新計算動線
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
