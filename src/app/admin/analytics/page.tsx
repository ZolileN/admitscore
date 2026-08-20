import { Suspense } from "react";
import AdminAnalyticsClient from "./AdminAnalyticsClient";

export const metadata = {
  title: "Analytics — AdmitScore Admin",
  robots: { index: false, follow: false },
};

export default function AdminAnalyticsPage() {
  return (
    <Suspense fallback={<main className="container-app py-10"><div className="skeleton h-10 w-64" /></main>}>
      <AdminAnalyticsClient />
    </Suspense>
  );
}
