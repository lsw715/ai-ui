import { matchesCreateTimeRange } from "@/lib/export-time-filter";
import { getExportBizMeta, type ExportBizType } from "@/lib/export-registry";
import type {
  ExportRecord,
  ExportRecordDownloadResp,
  ExportRecordPageReq,
  PagedResult,
} from "@/types/export-task";

/** 联调时改为 false，走 OPS 真实接口 */
const USE_MOCK = true;

type MockRecord = ExportRecord & { bizType: ExportBizType };

const MOCK_SEED: MockRecord[] = [
  {
    id: "exp-failed-001",
    bizType: "GATEWAY_PAYMENT",
    fileName: "trans_order_20250910165830.xlsx",
    createTime: "2025-09-10 16:58:30",
    status: "FAILED",
    failReason: "导出超时",
  },
  {
    id: "exp-001",
    bizType: "GATEWAY_PAYMENT",
    fileName: "trans_order_20250912143022.xlsx",
    createTime: "2025-09-12 14:30:22",
    status: "SUCCEEDED",
  },
  {
    id: "exp-002",
    bizType: "GATEWAY_PAYMENT",
    fileName: "trans_order_20250911091540.xlsx",
    createTime: "2025-09-11 09:15:40",
    status: "SUCCEEDED",
  },
  {
    id: "exp-004",
    bizType: "GATEWAY_PAYMENT",
    fileName: "trans_order_20250909112015.xlsx",
    createTime: "2025-09-09 11:20:15",
    status: "SUCCEEDED",
  },
  {
    id: "exp-005",
    bizType: "GATEWAY_PAYMENT",
    fileName: "trans_order_20250908163045.xlsx",
    createTime: "2025-09-08 16:30:45",
    status: "SUCCEEDED",
  },
  {
    id: "exp-ch-001",
    bizType: "CHANNEL_PAYMENT",
    fileName: "channel_order_20250910120000.xlsx",
    createTime: "2025-09-10 12:00:00",
    status: "SUCCEEDED",
  },
  {
    id: "exp-gr-001",
    bizType: "GATEWAY_REFUND",
    fileName: "refund_order_20250911100000.xlsx",
    createTime: "2025-09-11 10:00:00",
    status: "PROCESSING",
  },
  {
    id: "exp-cr-fail",
    bizType: "CHANNEL_REFUND",
    fileName: "channel_refund_20250909140000.xlsx",
    createTime: "2025-09-09 14:00:00",
    status: "FAILED",
    failReason: "数仓查询超时",
    requestParams: { limit: 100, offset: 0 },
  },
];

let mockStore: MockRecord[] = [...MOCK_SEED];
const mockTimers = new Map<string, ReturnType<typeof setTimeout>>();

function nowDisplay(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function nowFileStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function mockPage(req: ExportRecordPageReq): PagedResult<ExportRecord> {
  let list = [...mockStore];
  if (req.bizType) list = list.filter((t) => t.bizType === req.bizType);
  if (req.status) list = list.filter((t) => t.status === req.status);
  if (req.createTimeStart || req.createTimeEnd) {
    list = list.filter((t) =>
      matchesCreateTimeRange(t.createTime, req.createTimeStart, req.createTimeEnd),
    );
  }
  list.sort((a, b) => (a.createTime < b.createTime ? 1 : -1));
  const start = (req.current - 1) * req.size;
  return {
    data: list.slice(start, start + req.size).map(({ bizType, ...rest }) => ({
      ...rest,
      bizType,
    })),
    total: list.length,
    size: req.size,
    current: req.current,
  };
}

/** Mock：模拟某 bizType 提交了一条新导出任务 */
export function mockSubmitExportTask(bizType: ExportBizType): ExportRecord {
  const prefix = getExportBizMeta(bizType).mockFilePrefix;
  const id = `exp-${Date.now()}`;
  const stamp = nowFileStamp();
  const record: MockRecord = {
    id,
    bizType,
    fileName: `${prefix}_${stamp}.xlsx`,
    createTime: nowDisplay(),
    status: "PROCESSING",
  };
  mockStore = [record, ...mockStore];

  const timer = setTimeout(() => {
    mockStore = mockStore.map((t) =>
      t.id === id ? { ...t, status: "SUCCEEDED" as const } : t,
    );
    mockTimers.delete(id);
  }, 2500);
  mockTimers.set(id, timer);

  return {
    id: record.id,
    bizType: record.bizType,
    fileName: record.fileName,
    createTime: record.createTime,
    status: record.status,
    failReason: record.failReason,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new Error(`Export API error: ${res.status}`);
  return res.json() as Promise<T>;
}

/** POST /ops/export/records/page */
export async function pageExportRecords(
  req: ExportRecordPageReq,
): Promise<PagedResult<ExportRecord>> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return mockPage(req);
  }
  return apiFetch("/ops/export/records/page", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

/** POST /ops/export/records/download/{id} */
export async function downloadExportRecord(id: string): Promise<ExportRecordDownloadResp> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const task = mockStore.find((t) => t.id === id);
    if (!task || task.status !== "SUCCEEDED") {
      throw new Error("Task not ready for download");
    }
    return {
      urls: [`mock://download/${id}`],
      expireAt: new Date(Date.now() + 3600_000).toISOString(),
    };
  }
  return apiFetch(`/ops/export/records/download/${id}`, { method: "POST" });
}

/** 触发浏览器下载 */
export async function triggerExportDownload(record: ExportRecord): Promise<void> {
  const resp = await downloadExportRecord(record.id);
  const url = resp.urls[0];
  if (url.startsWith("mock://")) {
    const content = `导出文件：${record.fileName}\n导出时间：${record.createTime}\n任务ID：${record.id}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = record.fileName.replace(/\.xlsx$/, ".txt");
    anchor.click();
    URL.revokeObjectURL(blobUrl);
    return;
  }
  window.open(url, "_blank");
}

export function buildExportPageReq(params: {
  bizType?: ExportBizType;
  status?: ExportRecordPageReq["status"];
  createTimeStart?: string;
  createTimeEnd?: string;
  current: number;
  size: number;
}): ExportRecordPageReq {
  const { bizType, status, createTimeStart, createTimeEnd, current, size } = params;
  return {
    ...(bizType ? { bizType } : {}),
    ...(status ? { status } : {}),
    ...(createTimeStart ? { createTimeStart } : {}),
    ...(createTimeEnd ? { createTimeEnd } : {}),
    current,
    size,
  };
}
