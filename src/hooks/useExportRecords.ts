"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildExportPageReq,
  pageExportRecords,
  triggerExportDownload,
} from "@/lib/export-api";
import type { ExportBizType } from "@/lib/export-registry";
import type { ExportRecord } from "@/types/export-task";

const DEFAULT_PAGE_SIZE = 5;
const POLL_INTERVAL_MS = 3000;

export interface UseExportRecordsOptions {
  bizType: ExportBizType;
  open: boolean;
  pageSize?: number;
}

export function useExportRecords({
  bizType,
  open,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseExportRecordsOptions) {
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<ExportRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const result = await pageExportRecords(buildExportPageReq(bizType, pageNum, pageSize));
        setRecords(result.data);
        setTotal(result.total);
        setPage(pageNum);
      } finally {
        setLoading(false);
      }
    },
    [bizType, pageSize],
  );

  const refresh = useCallback(() => fetchPage(page), [fetchPage, page]);

  useEffect(() => {
    if (open) setPage(1);
  }, [open, bizType]);

  useEffect(() => {
    if (!open) return;
    fetchPage(page);
  }, [open, page, fetchPage]);

  useEffect(() => {
    if (!open) return;
    const hasProcessing = records.some((r) => r.status === "PROCESSING");
    if (!hasProcessing) return;
    const timer = setInterval(() => fetchPage(page), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [open, records, page, fetchPage]);

  return {
    records,
    total,
    page,
    pageSize,
    loading,
    setPage,
    refresh,
    download: triggerExportDownload,
  };
}
