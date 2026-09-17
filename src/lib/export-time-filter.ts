/** 日期控件 yyyy-MM-dd → 接口用的闭区间时间字符串 */
export function buildCreateTimeRange(startDate?: string, endDate?: string): {
  createTimeStart?: string;
  createTimeEnd?: string;
} {
  if (!startDate && !endDate) return {};
  return {
    ...(startDate ? { createTimeStart: `${startDate} 00:00:00` } : {}),
    ...(endDate ? { createTimeEnd: `${endDate} 23:59:59` } : {}),
  };
}

export function parseExportRecordTime(createTime: string): number {
  return new Date(createTime.replace(" ", "T")).getTime();
}

export function matchesCreateTimeRange(
  createTime: string,
  createTimeStart?: string,
  createTimeEnd?: string,
): boolean {
  const ts = parseExportRecordTime(createTime);
  if (createTimeStart) {
    const start = parseExportRecordTime(createTimeStart);
    if (ts < start) return false;
  }
  if (createTimeEnd) {
    const end = parseExportRecordTime(createTimeEnd);
    if (ts > end) return false;
  }
  return true;
}
