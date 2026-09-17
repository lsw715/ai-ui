"use client";

import { Download, Loader2, RotateCcw } from "lucide-react";
import {
  EXPORT_STATUS_COLORS,
  EXPORT_STATUS_LABELS,
} from "@/lib/export-task-mapper";
import { getExportBizMeta, type ExportBizType } from "@/lib/export-registry";
import { cn } from "@/lib/utils";
import type { ExportRecord } from "@/types/export-task";

export interface ExportRecordsTableProps {
  records: ExportRecord[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onDownload: (record: ExportRecord) => void;
  onRetry?: (record: ExportRecord) => void;
  loading?: boolean;
  showBizType?: boolean;
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

function bizTypeLabel(bizType?: ExportBizType) {
  if (!bizType) return "-";
  return getExportBizMeta(bizType).label;
}

export function ExportRecordsTable({
  records,
  total,
  page,
  pageSize,
  onPageChange,
  onDownload,
  onRetry,
  loading = false,
  showBizType = false,
}: ExportRecordsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (loading && records.length === 0) {
    return <div className="px-6 py-16 text-center text-[13px] text-[#999]">加载中…</div>;
  }

  if (total === 0) {
    return <div className="px-6 py-16 text-center text-[13px] text-[#999]">暂无导出记录</div>;
  }

  return (
    <>
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-[13px]">
          <thead className="sticky top-0 bg-[var(--color-ops-table-header)]">
            <tr className="border-b border-[var(--color-ops-border)] text-left text-[#666]">
              {showBizType ? (
                <th className="w-[140px] px-5 py-3 font-normal">导出类型</th>
              ) : null}
              <th className="px-5 py-3 font-normal">文件名</th>
              <th className="w-[160px] px-3 py-3 font-normal">导出时间</th>
              <th className="w-[88px] px-3 py-3 font-normal">状态</th>
              <th className="w-[100px] px-3 py-3 font-normal">失败原因</th>
              <th className="w-[72px] px-5 py-3 text-center font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className="border-b border-[var(--color-ops-border)] hover:bg-[#fafafa]"
              >
                {showBizType ? (
                  <td className="px-5 py-3 text-[#666]">{bizTypeLabel(record.bizType)}</td>
                ) : null}
                <td
                  className="max-w-[220px] truncate px-5 py-3 text-[#333]"
                  title={record.fileName}
                >
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
                      onClick={() => onRetry(record)}
                      className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline"
                    >
                      <RotateCcw className="size-3.5" />
                      重试
                    </button>
                  ) : null}
                  {record.status === "PROCESSING" ? <span className="text-[#bbb]">-</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
    </>
  );
}
