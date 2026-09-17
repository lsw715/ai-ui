import { Suspense } from "react";
import { ExportCenterView } from "@/components/export/ExportCenterView";
import { OpsLayout } from "@/components/ops/OpsLayout";

export default function ExportRecordsPage() {
  return (
    <OpsLayout breadcrumbs={["导出中心"]}>
      <Suspense
        fallback={
          <div className="rounded-[4px] bg-white p-8 text-center text-[13px] text-[#999] shadow-sm">
            加载中…
          </div>
        }
      >
        <ExportCenterView />
      </Suspense>
    </OpsLayout>
  );
}
