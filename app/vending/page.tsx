import type { Metadata } from "next";
import VendingExperience from "@/components/VendingMachine/VendingExperience";

export const metadata: Metadata = {
  title: "Khrystyna Arnoldy — UX/Product Designer",
};

export default function VendingPage() {
  return <VendingExperience />;
}
