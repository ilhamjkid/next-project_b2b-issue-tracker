import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function ClientDashboardPage() {
  return <h1 className="text-4xl font-semibold">Client Dashboard</h1>;
}
