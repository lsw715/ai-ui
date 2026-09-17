"use client";

import Link from "next/link";
import { Download, FileOutput } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ExportToolbarProps {
  onExport: () => void | Promise<void>;
  exporting?: boolean;
  exportLabel?: string;
  /** 跳转统一导出中心；可带 ?bizType= 预筛选 */
  recordsHref?: string;
  recordsLabel?: string;
}

/**
 * 列表页导出工具栏：「导出」+ 跳转「导出中心」
 */
export function ExportToolbar({
  onExport,
  exporting = false,
  exportLabel = "导出",
  recordsHref = "/export-records",
  recordsLabel = "导出中心",
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
      <Link
        href={recordsHref}
        className="ml-2 inline-flex h-[32px] items-center rounded-md px-3 text-[13px] text-[#666] hover:bg-[#f5f5f5] hover:text-[var(--primary)]"
      >
        <FileOutput className="mr-1.5 size-4" />
        {recordsLabel}
      </Link>
    </div>
  );
}
