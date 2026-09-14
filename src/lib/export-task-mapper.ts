import type { ApiExportTaskStatus } from "@/types/export-task";

export const EXPORT_STATUS_LABELS: Record<ApiExportTaskStatus, string> = {
  PROCESSING: "导出中",
  SUCCEEDED: "已完成",
  FAILED: "导出失败",
};

export const EXPORT_STATUS_COLORS: Record<ApiExportTaskStatus, string> = {
  PROCESSING: "border-[#91caff] bg-[#e6f4ff] text-[#1677ff]",
  SUCCEEDED: "border-[#b7eb8f] bg-[#f6ffed] text-[#52c41a]",
  FAILED: "border-[#ffccc7] bg-[#fff2f0] text-[#ff4d4f]",
};
