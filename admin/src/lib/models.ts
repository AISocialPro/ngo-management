import { z } from "zod";

/* ----------------------------- Types ----------------------------- */
export type DocCategory =
  | "All"
  | "Legal & Regulatory"
  | "Financial Reports"
  | "Policies"
  | "Certifications"
  | "Grant Documents";

export type DocumentType = "PDF" | "DOCX" | "XLSX" | "TXT" | "PNG" | "JPG";

export type ChecklistStatus = "Completed" | "Pending" | "Overdue";

/* ---------------------------- Schemas ---------------------------- */
export const DocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  size: z.string(),
  updated: z.string().optional(),
  expires: z.string().optional(),
  icon: z.string(),
  type: z.enum(["PDF", "DOCX", "XLSX", "TXT", "PNG", "JPG"]),
  category: z.enum([
    "Legal & Regulatory",
    "Financial Reports",
    "Policies",
    "Certifications",
    "Grant Documents"
  ]),
  userId: z.string(),
  fileUrl: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export const ChecklistItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, "Task text is required"),
  due: z.string(),
  status: z.enum(["Completed", "Pending", "Overdue"]),
  done: z.boolean().default(false),
  userId: z.string(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

export const ComplianceActivitySchema = z.object({
  id: z.string(),
  date: z.string(),
  text: z.string(),
  type: z.enum(["document", "meeting", "review", "submission", "update"]),
  userId: z.string(),
  createdAt: z.date().default(() => new Date())
});

export type Document = z.infer<typeof DocumentSchema>;
export type ChecklistItem = z.infer<typeof ChecklistItemSchema>;
export type ComplianceActivity = z.infer<typeof ComplianceActivitySchema>;