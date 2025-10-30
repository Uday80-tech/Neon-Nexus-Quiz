import ResultClient from "@/components/result/ResultClient";
import { Suspense } from "react";

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading results...</div>}>
      <ResultClient />
    </Suspense>
  );
}
