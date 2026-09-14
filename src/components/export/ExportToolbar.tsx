"use client";

import { Download, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ExportToolbarProps {
  onExport: () => void | Promise<void>;
  onOpenRecords: () => void;
  exporting?: boolean;
  exportLabel?: string;
  recordsLabel?: string;
}

/**
 * 列表页通用导出工具栏：「导出」+「导出记录」
 */
export function ExportToolbar({
  onExport,
  onOpenRecords,
  exporting = false,
  exportLabel = "导出",
  recordsLabel = "导出记录",
}: ExportToolbarProps) {
  return (
    <div className="flex items-center border-b border-[var(--color-ops-border)] px-4 py-3">
      <Button
        variant="outline"
        className="h-[32px] border-[var(--primary)] text-[var(--primary)]"
        onClick={onExport}
        disabled={exporting}
      >
        <Download className="mr-1.5 size-4" />
        {exporting ? "提交中…" : exportLabel}
      </Button>
      <Button
        variant="ghost"
        className="ml-2 h-[32px] text-[13px] text-[#666] hover:text-[var(--primary)]"
        onClick={onOpenRecords}
      >
        <FileOutput className="mr-1.5 size-4" />
        {recordsLabel}
      </Button>
    </div>
  );
}
