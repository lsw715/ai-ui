import { mockSubmitExportTask } from "@/lib/export-api";
import type { ExportBizType } from "@/lib/export-registry";

const USE_MOCK = true;

/** 与 OPS 各业务 export 接口路径一致，统一导出中心失败重试用 */
const EXPORT_SUBMIT_PATH: Record<ExportBizType, string> = {
  GATEWAY_PAYMENT: "/ops/trans/export",
  GATEWAY_REFUND: "/ops/refund/export",
  CHANNEL_PAYMENT: "/ops/trans/channel/export",
  CHANNEL_REFUND: "/ops/refund/channel/export",
};

/** 使用任务快照 requestParams 重新提交导出（无单独 retry 接口） */
export async function retryExportFromRecord(record: {
  bizType?: ExportBizType;
  requestParams?: Record<string, unknown>;
}): Promise<void> {
  const { bizType, requestParams } = record;
  if (!bizType) {
    throw new Error("缺少 bizType，无法重试");
  }
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    mockSubmitExportTask(bizType);
    return;
  }
  const body = requestParams ?? {};
  const res = await fetch(EXPORT_SUBMIT_PATH[bizType], {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Export retry failed: ${res.status}`);
  }
}
