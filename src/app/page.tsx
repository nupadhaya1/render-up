// app/page.tsx
import { redirect } from "next/navigation";

export default function RootPage() {
  // all requests to “/” will 302 → “/home”
  redirect("/home");
}
