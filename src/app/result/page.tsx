import ResultClient from "@/components/result/ResultClient";
import { Suspense } from "react";

export default function ResultPage() {
  return (
    // Add a key to Suspense to force re-mounting when search params change
    <Suspense>
      <ResultClient />
    </Suspense>
  );
}
