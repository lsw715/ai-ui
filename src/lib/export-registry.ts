/** 与 OPS ExportBizTypeEnum 保持一致，新增模块在此注册 */
export const EXPORT_BIZ_REGISTRY = {
  GATEWAY_PAYMENT: {
    label: "网关支付订单",
    mockFilePrefix: "trans_order",
  },
  GATEWAY_REFUND: {
    label: "网关退款订单",
    mockFilePrefix: "refund_order",
  },
} as const;

export type ExportBizType = keyof typeof EXPORT_BIZ_REGISTRY;

export function getExportBizMeta(bizType: ExportBizType) {
  return EXPORT_BIZ_REGISTRY[bizType];
}
