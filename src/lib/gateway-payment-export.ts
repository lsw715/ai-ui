import { mockSubmitExportTask } from "@/lib/export-api";
import type { PaymentSearchFilters } from "@/types/payment-order";

const USE_MOCK = true;

function filtersToExportBody(filters: PaymentSearchFilters) {
  return {
    merchantId: filters.merchantId || undefined,
    merchantName: filters.merchantName || undefined,
    gatewayOrderId: filters.gatewayOrderId || undefined,
    transId: filters.transId || undefined,
    status: filters.orderStatus || undefined,
    currency: filters.currency || undefined,
    paymentMethod: filters.paymentMethod || undefined,
  };
}

/** POST /ops/trans/export — 网关支付订单模块专用 */
export async function submitGatewayPaymentExport(
  filters: PaymentSearchFilters,
): Promise<{ taskId?: string; fileUrl?: string }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300));
    const record = mockSubmitExportTask("GATEWAY_PAYMENT");
    return { taskId: record.id };
  }
  const res = await fetch("/ops/trans/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filtersToExportBody(filters)),
  });
  if (!res.ok) throw new Error(`Export submit failed: ${res.status}`);
  return res.json();
}
