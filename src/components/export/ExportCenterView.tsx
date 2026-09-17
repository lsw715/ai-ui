"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RefreshCw, RotateCcw, Search } from "lucide-react";
import { ExportRecordsTable } from "@/components/export/ExportRecordsTable";
import { Button } from "@/components/ui/button";
import { useExportRecords } from "@/hooks/useExportRecords";
import { EXPORT_STATUS_LABELS } from "@/lib/export-task-mapper";
import { buildCreateTimeRange } from "@/lib/export-time-filter";
import {
  getExportBizMeta,
  listExportBizTypes,
  parseExportBizType,
  type ExportBizType,
} from "@/lib/export-registry";
import { retryExportFromRecord } from "@/lib/export-submit";
import { cn } from "@/lib/utils";
import type { ApiExportTaskStatus } from "@/types/export-task";

const PAGE_SIZE = 10;

interface ExportFilters {
  bizType?: ExportBizType;
  status?: ApiExportTaskStatus;
  exportDateStart: string;
  exportDateEnd: string;
}

const EMPTY_FILTERS: ExportFilters = {
  exportDateStart: "",
  exportDateEnd: "",
};

function parseStatus(value: string | null): ApiExportTaskStatus | undefined {
  if (!value || !(value in EXPORT_STATUS_LABELS)) return undefined;
  return value as ApiExportTaskStatus;
}

function filtersFromSearchParams(sp: URLSearchParams): ExportFilters {
  return {
    bizType: parseExportBizType(sp.get("bizType")),
    status: parseStatus(sp.get("status")),
    exportDateStart: sp.get("dateStart") ?? "",
    exportDateEnd: sp.get("dateEnd") ?? "",
  };
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[13px] text-[#666]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[34px] min-w-[140px] rounded-[3px] border border-[var(--color-ops-border)] bg-white px-2 text-[13px] text-[#333]"
      >
        {options.map((opt) => (
          <option key={opt.value || "__all"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateRangeFilter({
  start,
  end,
  onStartChange,
  onEndChange,
}: {
  start: string;
  end: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-[13px] text-[#666]">导出时间</span>
      <input
        type="date"
        value={start}
        onChange={(e) => onStartChange(e.target.value)}
        className="h-[34px] rounded-[3px] border border-[var(--color-ops-border)] px-2 text-[13px] text-[#333]"
      />
      <span className="text-[#999]">至</span>
      <input
        type="date"
        value={end}
        onChange={(e) => onEndChange(e.target.value)}
        className="h-[34px] rounded-[3px] border border-[var(--color-ops-border)] px-2 text-[13px] text-[#333]"
      />
    </div>
  );
}

export function ExportCenterView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialApplied = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const [draft, setDraft] = useState<ExportFilters>(initialApplied);
  const [applied, setApplied] = useState<ExportFilters>(initialApplied);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const timeRange = useMemo(
    () => buildCreateTimeRange(applied.exportDateStart, applied.exportDateEnd),
    [applied.exportDateStart, applied.exportDateEnd],
  );

  const syncUrl = useCallback(
    (next: ExportFilters) => {
      const params = new URLSearchParams();
      if (next.bizType) params.set("bizType", next.bizType);
      if (next.status) params.set("status", next.status);
      if (next.exportDateStart) params.set("dateStart", next.exportDateStart);
      if (next.exportDateEnd) params.set("dateEnd", next.exportDateEnd);
      const q = params.toString();
      router.replace(q ? `/export-records?${q}` : "/export-records", { scroll: false });
    },
    [router],
  );

  const bizOptions = useMemo(
    () => [
      { value: "", label: "全部类型" },
      ...listExportBizTypes().map((t) => ({ value: t, label: getExportBizMeta(t).label })),
    ],
    [],
  );

  const statusOptions = useMemo(
    () => [
      { value: "", label: "全部状态" },
      ...(Object.entries(EXPORT_STATUS_LABELS) as [ApiExportTaskStatus, string][]).map(
        ([value, label]) => ({ value, label }),
      ),
    ],
    [],
  );

  const { records, total, page, pageSize, loading, setPage, refresh, download } = useExportRecords({
    bizType: applied.bizType,
    status: applied.status,
    createTimeStart: timeRange.createTimeStart,
    createTimeEnd: timeRange.createTimeEnd,
    enabled: true,
    pageSize: PAGE_SIZE,
  });

  const applyFilters = () => {
    setApplied({ ...draft });
    syncUrl(draft);
  };

  const resetFilters = () => {
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    syncUrl(EMPTY_FILTERS);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setTimeout(() => setRefreshing(false), 300);
    }
  };

  const handleRetry = async (record: (typeof records)[number]) => {
    setRetryingId(record.id);
    try {
      await retryExportFromRecord(record);
      await refresh();
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[4px] bg-white shadow-sm">
      <div className="border-b border-[var(--color-ops-border)] px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <FilterSelect
            label="导出类型"
            value={draft.bizType ?? ""}
            onChange={(value) =>
              setDraft((p) => ({ ...p, bizType: parseExportBizType(value || undefined) }))
            }
            options={bizOptions}
          />
          <FilterSelect
            label="状态"
            value={draft.status ?? ""}
            onChange={(value) => setDraft((p) => ({ ...p, status: parseStatus(value || null) }))}
            options={statusOptions}
          />
          <DateRangeFilter
            start={draft.exportDateStart}
            end={draft.exportDateEnd}
            onStartChange={(exportDateStart) => setDraft((p) => ({ ...p, exportDateStart }))}
            onEndChange={(exportDateEnd) => setDraft((p) => ({ ...p, exportDateEnd }))}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <Button onClick={applyFilters} className="h-[34px] bg-[var(--primary)] px-5 text-white">
              <Search className="mr-1.5 size-4" />
              查询
            </Button>
            <Button variant="outline" onClick={resetFilters} className="h-[34px]">
              <RotateCcw className="mr-1.5 size-4" />
              重置
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="h-[34px] text-[13px]"
          >
            <RefreshCw className={cn("mr-1.5 size-4", (refreshing || loading) && "animate-spin")} />
            刷新
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <ExportRecordsTable
          records={records}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onDownload={download}
          onRetry={(record) => {
            if (retryingId) return;
            void handleRetry(record);
          }}
          loading={loading || Boolean(retryingId)}
          showBizType
        />
      </div>
    </div>
  );
}
