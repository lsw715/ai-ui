import type { ExportBizType } from "@/lib/export-registry";

export type { ExportBizType };

/** 对齐后端 ExportTaskStatus */
export type ApiExportTaskStatus = "PROCESSING" | "SUCCEEDED" | "FAILED";

export interface ExportRecordPageReq {
  /** 不传则查询当前用户全部导出类型 */
  bizType?: ExportBizType;
  status?: ApiExportTaskStatus;
  /** yyyy-MM-dd HH:mm:ss，任务创建/导出提交时间 */
  createTimeStart?: string;
  createTimeEnd?: string;
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
  bizType?: ExportBizType;
  fileName: string;
  createTime: string;
  status: ApiExportTaskStatus;
  failReason?: string;
  requestParams?: Record<string, unknown>;
}

export interface ExportRecordDownloadResp {
  urls: string[];
  expireAt: string;
}
