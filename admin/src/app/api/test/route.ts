import { transporter } from "@/lib/mailer";

transporter.verify((error, success) => {
  if (error) console.error("❌ SMTP not working:", error);
  else console.log("✅ SMTP server ready:", success);
});
