"use client";

import { ExportRecordsPanel } from "@/components/export/ExportRecordsPanel";
import { useExportRecords } from "@/hooks/useExportRecords";
import { getExportBizMeta, type ExportBizType } from "@/lib/export-registry";

export interface ExportRecordsDialogProps {
  bizType: ExportBizType;
  open: boolean;
  onClose: () => void;
  /** 重试 = 各模块重新提交 export，传入模块自己的 submit 函数 */
  onRetry?: () => void | Promise<void>;
  pageSize?: number;
}

/**
 * 通用导出记录弹窗。各列表页只需传 bizType + onRetry。
 *
 * @example
 * <ExportRecordsDialog
 *   bizType="GATEWAY_PAYMENT"
 *   open={exportOpen}
 *   onClose={() => setExportOpen(false)}
 *   onRetry={() => submitGatewayPaymentExport(appliedFilters)}
 * />
 */
export function ExportRecordsDialog({
  bizType,
  open,
  onClose,
  onRetry,
  pageSize,
}: ExportRecordsDialogProps) {
  const { records, total, page, pageSize: resolvedSize, loading, setPage, refresh, download } =
    useExportRecords({ bizType, open, pageSize });

  const meta = getExportBizMeta(bizType);

  return (
    <ExportRecordsPanel
      title={`${meta.label} · 导出记录`}
      open={open}
      onClose={onClose}
      records={records}
      total={total}
      page={page}
      pageSize={resolvedSize}
      onPageChange={setPage}
      onRefresh={refresh}
      onDownload={download}
      onRetry={onRetry}
      loading={loading}
    />
  );
}
