"use client";

import { useCallback, useState } from "react";
import { Download, Loader2, RefreshCw, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EXPORT_STATUS_COLORS,
  EXPORT_STATUS_LABELS,
} from "@/lib/export-task-mapper";
import { cn } from "@/lib/utils";
import type { ExportRecord } from "@/types/export-task";

export interface ExportRecordsPanelProps {
  title?: string;
  open: boolean;
  onClose: () => void;
  records: ExportRecord[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void | Promise<void>;
  onDownload: (record: ExportRecord) => void;
  onRetry?: () => void;
  loading?: boolean;
}

function StatusBadge({ status }: { status: ExportRecord["status"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[12px]",
        EXPORT_STATUS_COLORS[status],
      )}
    >
      {status === "PROCESSING" ? <Loader2 className="size-3 animate-spin" /> : null}
      {EXPORT_STATUS_LABELS[status]}
    </span>
  );
}

export function ExportRecordsPanel({
  title = "导出记录",
  open,
  onClose,
  records,
  total,
  page,
  pageSize,
  onPageChange,
  onRefresh,
  onDownload,
  onRetry,
  loading = false,
}: ExportRecordsPanelProps) {
  const [refreshing, setRefreshing] = useState(false);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  }, [onRefresh]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-[760px] flex-col rounded-[6px] bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#e8e8ef] px-5 py-4">
          <h2 className="text-[16px] font-medium text-[#333]">{title}</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="h-[32px] text-[13px]"
            >
              <RefreshCw className={cn("mr-1.5 size-3.5", (refreshing || loading) && "animate-spin")} />
              刷新
            </Button>
            <button type="button" onClick={onClose} className="text-[#999] hover:text-[#333]">
              <X className="size-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {loading && records.length === 0 ? (
            <div className="px-6 py-16 text-center text-[13px] text-[#999]">加载中…</div>
          ) : total === 0 ? (
            <div className="px-6 py-16 text-center text-[13px] text-[#999]">暂无导出记录</div>
          ) : (
            <table className="w-full border-collapse text-[13px]">
              <thead className="sticky top-0 bg-[var(--color-ops-table-header)]">
                <tr className="border-b border-[var(--color-ops-border)] text-left text-[#666]">
                  <th className="px-5 py-3 font-normal">文件名</th>
                  <th className="w-[160px] px-3 py-3 font-normal">导出时间</th>
                  <th className="w-[88px] px-3 py-3 font-normal">状态</th>
                  <th className="w-[100px] px-3 py-3 font-normal">失败原因</th>
                  <th className="w-[72px] px-5 py-3 text-center font-normal">操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b border-[var(--color-ops-border)] hover:bg-[#fafafa]">
                    <td className="max-w-[220px] truncate px-5 py-3 text-[#333]" title={record.fileName}>
                      {record.fileName}
                    </td>
                    <td className="px-3 py-3 text-[#666]">{record.createTime}</td>
                    <td className="px-3 py-3">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-3 py-3 text-[#666]">
                      {record.status === "FAILED" && record.failReason ? (
                        <span className="text-[#ff4d4f]">{record.failReason}</span>
                      ) : (
                        <span className="text-[#bbb]">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {record.status === "SUCCEEDED" ? (
                        <button
                          type="button"
                          onClick={() => onDownload(record)}
                          className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                        >
                          <Download className="size-3.5" />
                          下载
                        </button>
                      ) : null}
                      {record.status === "FAILED" && onRetry ? (
                        <button
                          type="button"
                          onClick={onRetry}
                          className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                        >
                          <RotateCcw className="size-3.5" />
                          重试
                        </button>
                      ) : null}
                      {record.status === "PROCESSING" ? (
                        <span className="text-[#bbb]">-</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {total > 0 ? (
          <div className="flex shrink-0 items-center justify-between border-t border-[var(--color-ops-border)] px-5 py-3 text-[13px] text-[#666]">
            <span>共 {total} 条</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => onPageChange(page - 1)}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                上一页
              </button>
              <span className="min-w-[32px] rounded border border-[var(--primary)] bg-[var(--primary)] px-2 py-1 text-center text-white">
                {page}
              </span>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => onPageChange(page + 1)}
                className="rounded border px-3 py-1 disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex shrink-0 justify-end border-t border-[#e8e8ef] px-5 py-4">
          <Button variant="outline" onClick={onClose} className="h-[34px]">
            关闭
          </Button>
        </div>
      </div>
    </div>
  );
}
