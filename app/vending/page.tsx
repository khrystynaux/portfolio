import { permanentRedirect } from "next/navigation";

/** The machine previewed here before it became the homepage; keep old links working. */
export default function VendingPage() {
  permanentRedirect("/");
}
