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
  CHANNEL_PAYMENT: {
    label: "渠道支付订单",
    mockFilePrefix: "channel_order",
  },
  CHANNEL_REFUND: {
    label: "渠道退款订单",
    mockFilePrefix: "channel_refund",
  },
} as const;

export type ExportBizType = keyof typeof EXPORT_BIZ_REGISTRY;

export function getExportBizMeta(bizType: ExportBizType) {
  return EXPORT_BIZ_REGISTRY[bizType];
}

export function listExportBizTypes(): ExportBizType[] {
  return Object.keys(EXPORT_BIZ_REGISTRY) as ExportBizType[];
}

export function parseExportBizType(value: string | null | undefined): ExportBizType | undefined {
  if (!value) return undefined;
  return value in EXPORT_BIZ_REGISTRY ? (value as ExportBizType) : undefined;
}
