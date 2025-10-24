import { createFileRoute } from "@tanstack/react-router";
import { FraudDetectionPage } from "@/features/fraud-detection";

export const Route = createFileRoute("/_authenticated/fraud/" as any)({
  component: FraudDetectionPage,
});
