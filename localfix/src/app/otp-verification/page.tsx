import { Suspense } from "react";
import OTPVerificationClient from "./OTPVerificationClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <OTPVerificationClient />
    </Suspense>
  );
}
