import { redirect } from "next/navigation";

export default function Home() {
  // When someone opens "/", they will be redirected
  redirect("/admin/dashboard");
}
