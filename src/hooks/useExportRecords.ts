"use client";

import { useCallback, useEffect, useState } from "react";
import {
  buildExportPageReq,
  pageExportRecords,
  triggerExportDownload,
} from "@/lib/export-api";
import type { ExportBizType } from "@/lib/export-registry";
import type { ApiExportTaskStatus, ExportRecord } from "@/types/export-task";

const DEFAULT_PAGE_SIZE = 10;
const POLL_INTERVAL_MS = 3000;

export interface UseExportRecordsOptions {
  bizType?: ExportBizType;
  status?: ApiExportTaskStatus;
  createTimeStart?: string;
  createTimeEnd?: string;
  /** 为 false 时不拉取 */
  enabled?: boolean;
  pageSize?: number;
}

export function useExportRecords({
  bizType,
  status,
  createTimeStart,
  createTimeEnd,
  enabled = true,
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
        const result = await pageExportRecords(
          buildExportPageReq({
            bizType,
            status,
            createTimeStart,
            createTimeEnd,
            current: pageNum,
            size: pageSize,
          }),
        );
        setRecords(result.data);
        setTotal(result.total);
        setPage(pageNum);
      } finally {
        setLoading(false);
      }
    },
    [bizType, status, createTimeStart, createTimeEnd, pageSize],
  );

  const refresh = useCallback(() => fetchPage(page), [fetchPage, page]);

  useEffect(() => {
    if (!enabled) return;
    setPage(1);
    fetchPage(1);
  }, [enabled, bizType, status, createTimeStart, createTimeEnd, pageSize, fetchPage]);

  useEffect(() => {
    if (!enabled || page <= 1) return;
    fetchPage(page);
  }, [enabled, page, fetchPage]);

  useEffect(() => {
    if (!enabled) return;
    const hasProcessing = records.some((r) => r.status === "PROCESSING");
    if (!hasProcessing) return;
    const timer = setInterval(() => fetchPage(page), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [enabled, records, page, fetchPage]);

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
