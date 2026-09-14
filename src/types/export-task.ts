import type { ExportBizType } from "@/lib/export-registry";

export type { ExportBizType };

/** 对齐后端 ExportTaskStatus */
export type ApiExportTaskStatus = "PROCESSING" | "SUCCEEDED" | "FAILED";

export interface ExportRecordPageReq {
  bizType: ExportBizType;
  status?: ApiExportTaskStatus;
  current: number;
  size: number;
}

export interface PagedResult<T> {
  data: T[];
  total: number;
  size: number;
  current: number;
}

/** OPS BFF 返回的导出记录 */
export interface ExportRecord {
  id: string;
  fileName: string;
  createTime: string;
  status: ApiExportTaskStatus;
  failReason?: string;
}

export interface ExportRecordDownloadResp {
  urls: string[];
  expireAt: string;
}
