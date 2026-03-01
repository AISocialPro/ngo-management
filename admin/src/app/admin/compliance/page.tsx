"use client";

import { useMemo, useState, useEffect } from "react";
import LiveDate from "@/components/LiveDate";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  fetchDocuments,
  fetchChecklist,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  fetchActivities,
  fetchStats,
  Document,
  ChecklistItem,
  ComplianceActivity,
  DocCategory
} from "@/lib/api";

function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export default function CompliancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState({
    documents: true,
    checklist: true,
    activities: true,
    stats: true
  });
  const [error, setError] = useState<string | null>(null);
  
  const [docs, setDocs] = useState<Document[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [activities, setActivities] = useState<ComplianceActivity[]>([]);
  const [stats, setStats] = useState({
    totalDocuments: 0,
    compliancePercentage: 0,
    pendingItems: 0,
    upcomingDeadlines: 0,
    stats: { completed: 0, pending: 0, overdue: 0, total: 0 }
  });

  const categories: DocCategory[] = [
    "All",
    "Legal & Regulatory",
    "Financial Reports",
    "Policies",
    "Certifications",
    "Grant Documents",
  ];

  const [active, setActive] = useState<DocCategory>("All");
  const [query, setQuery] = useState("");

  // Load all data
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      loadData();
    }
  }, [status, router]);

  const loadData = async () => {
    try {
      setError(null);
      
      const [documentsData, checklistData, activitiesData, statsData] = await Promise.all([
        fetchDocuments(),
        fetchChecklist(),
        fetchActivities(),
        fetchStats()
      ]);

      setDocs(documentsData);
      setChecklist(checklistData);
      setActivities(activitiesData);
      setStats(statsData);
      
      setLoading({
        documents: false,
        checklist: false,
        activities: false,
        stats: false
      });
    } catch (err) {
      setError("Failed to load data. Please try again.");
      console.error(err);
    }
  };

  const filtered = docs.filter((d) => {
    const byCat = active === "All" ? true : d.category === active;
    const q = query.trim().toLowerCase();
    const bySearch =
      !q ||
      d.title.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q);
    return byCat && bySearch;
  });

  const toggleItem = async (id: string) => {
    try {
      const item = checklist.find(i => i.id === id);
      if (!item) return;

      const updated = {
        done: !item.done,
        status: !item.done ? "Completed" : "Pending" as const
      };

      const updatedItem = await updateChecklistItem(id, updated);
      setChecklist(prev => prev.map(i => i.id === id ? updatedItem : i));
      
      // Refresh stats after update
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      console.error("Failed to update item:", err);
      setError("Failed to update checklist item");
    }
  };

  const addItem = async () => {
    const text = prompt("Enter checklist task:");
    if (!text) return;
    
    const due = prompt("Enter due date (e.g. Feb 20, 2023):") || "TBD";
    
    try {
      const newItem = await createChecklistItem({
        text,
        due,
        status: "Pending",
        done: false
      });
      
      setChecklist(prev => [...prev, newItem]);
      
      // Refresh stats
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      console.error("Failed to add item:", err);
      setError("Failed to add checklist item");
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      await deleteChecklistItem(id);
      setChecklist(prev => prev.filter(i => i.id !== id));
      
      // Refresh stats
      const newStats = await fetchStats();
      setStats(newStats);
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError("Failed to delete checklist item");
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(prev => ({ ...prev, documents: true }));
      const results = await fetchDocuments(active === "All" ? undefined : active, query);
      setDocs(results);
      setLoading(prev => ({ ...prev, documents: false }));
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed");
    }
  };

  if (status === "loading") {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Title + date */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Compliance &amp; Documents</h2>
        <LiveDate className="text-gray-600" />
      </div>

      {/* Search bar box */}
      <div className="relative mb-6">
        <i className="fa-solid fa-search pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          placeholder="Search for documents, policies, or compliance requirements..."
          className="w-full rounded-full border border-slate-300 px-12 py-3 outline-none ring-sky-200 placeholder:text-slate-400 focus:ring"
        />
      </div>

      {/* Overview cards */}
      <div className="mb-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <OverviewCard 
          icon="fa-file-alt" 
          title="Total Documents" 
          subtitle={`${stats.totalDocuments} Files`}
          loading={loading.stats}
        />
        <OverviewCard 
          icon="fa-check-circle" 
          title="Completed" 
          subtitle={`${stats.compliancePercentage}% Compliance`}
          loading={loading.stats}
        />
        <OverviewCard 
          icon="fa-exclamation-triangle" 
          title="Pending" 
          subtitle={`${stats.pendingItems} Items Require Attention`}
          loading={loading.stats}
        />
        <OverviewCard 
          icon="fa-clock" 
          title="Upcoming Deadlines" 
          subtitle={`${stats.upcomingDeadlines} Due This Month`}
          loading={loading.stats}
        />
      </div>

      {/* Categories */}
      <div className="mb-3">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">Document Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => {
                setActive(c);
                // Refetch documents with new category
                fetchDocuments(c === "All" ? undefined : c, query)
                  .then(setDocs)
                  .catch(err => {
                    console.error("Failed to filter documents:", err);
                    setError("Failed to filter documents");
                  });
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm transition-colors",
                active === c ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Documents grid */}
      <div className="mb-8">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">Documents</h3>
        {loading.documents ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="h-24 bg-slate-100"></div>
                <div className="p-5">
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-100 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-slate-200 rounded flex-1"></div>
                    <div className="h-10 bg-slate-200 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((d) => (
              <DocumentCard key={d.id} document={d} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                No documents found. {query && "Try a different search term."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Checklist */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Compliance Checklist</h3>
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 transition-colors"
          >
            <i className="fa fa-plus" /> Add
          </button>
        </div>
        {loading.checklist ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-lg"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {checklist.map((i) => (
              <ChecklistItemRow 
                key={i.id} 
                item={i} 
                onToggle={() => toggleItem(i.id)}
                onDelete={() => deleteItem(i.id)}
              />
            ))}
            {checklist.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No checklist items. Add your first task!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="mb-8">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">Recent Compliance Activities</h3>
        {loading.activities ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-24 mb-2"></div>
                <div className="h-12 bg-slate-50 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, i) => (
              <ActivityItem key={activity.id || i} activity={activity} />
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No recent activities
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload section */}
      <div className="rounded-xl bg-slate-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-800">Need to upload a document?</h3>
        <p className="mt-1 text-slate-600">Ensure all documents are properly labeled and in the correct format</p>
        <button
          onClick={() => {
            // This would open a file upload dialog
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.docx,.xlsx,.txt,.png,.jpg';
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                // Here you would upload the file to your storage service
                // and then create a document record
                alert(`File ${file.name} selected. Upload functionality would be implemented here.`);
              }
            };
            input.click();
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-white hover:bg-sky-700 transition-colors"
        >
          <i className="fa-solid fa-cloud-upload-alt" /> Upload Document
        </button>
      </div>
    </div>
  );
}

/* ------------------------- Small UI Components ------------------------- */
function OverviewCard({ 
  icon, 
  title, 
  subtitle, 
  loading = false 
}: { 
  icon: string; 
  title: string; 
  subtitle: string;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5 text-center shadow-sm ring-1 ring-slate-200">
      <div className="mb-2 text-3xl text-sky-600">
        <i className={cn("fa-solid", icon)} />
      </div>
      <h4 className="text-slate-800">{title}</h4>
      {loading ? (
        <div className="h-4 bg-slate-200 rounded mt-1 animate-pulse"></div>
      ) : (
        <p className="text-sm text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}

function DocumentCard({ document }: { document: Document }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="grid place-items-center bg-slate-50 py-6 text-3xl text-sky-600">
        <i className={cn("fa-solid", document.icon)} />
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-slate-800">{document.title}</h3>
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span>{document.type} • {document.size}</span>
          <span>
            {document.updated ? `Updated: ${document.updated}` : 
             document.expires ? `Expires: ${document.expires}` : null}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (document.fileUrl) {
                window.open(document.fileUrl, '_blank');
              } else {
                alert(`Viewing ${document.title} (${document.type})`);
              }
            }}
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-3 py-2 text-sm text-white hover:bg-sky-700 transition-colors"
          >
            <i className="fa-solid fa-eye" /> View
          </button>
          <button
            onClick={() => {
              if (document.fileUrl) {
                const link = document.createElement('a');
                link.href = document.fileUrl;
                link.download = document.title;
                link.click();
              } else {
                alert(`Downloading ${document.title}`);
              }
            }}
            className="inline-flex items-center gap-2 rounded-md border border-sky-600 px-3 py-2 text-sm text-sky-700 hover:bg-sky-50 transition-colors"
          >
            <i className="fa-solid fa-download" /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

function ChecklistItemRow({ 
  item, 
  onToggle, 
  onDelete 
}: { 
  item: ChecklistItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={cn(
      "flex items-center rounded-lg border border-slate-200 bg-white p-3",
      item.done && "opacity-90"
    )}>
      <input
        type="checkbox"
        checked={item.done}
        onChange={onToggle}
        className="mr-3 h-5 w-5 accent-sky-600"
      />
      <span className={cn("flex-1", item.done && "line-through text-slate-500")}>
        {item.text}
      </span>
      <span className="mr-3 text-xs text-slate-500">Due: {item.due}</span>
      <span
        className={cn(
          "rounded-full px-3 py-1 text-[11px] font-medium mr-2",
          item.status === "Completed" && "bg-emerald-100 text-emerald-700",
          item.status === "Pending" && "bg-amber-100 text-amber-700",
          item.status === "Overdue" && "bg-rose-100 text-rose-700"
        )}
      >
        {item.status}
      </span>
      <button
        onClick={onDelete}
        className="text-slate-400 hover:text-rose-500 transition-colors"
      >
        <i className="fa-solid fa-trash" />
      </button>
    </div>
  );
}

function ActivityItem({ activity }: { activity: ComplianceActivity }) {
  return (
    <div className="relative border-l-2 border-sky-600 pl-6">
      <span className="absolute -left-[7px] top-3 h-3.5 w-3.5 rounded-full bg-sky-600" />
      <div className="text-xs text-slate-500">{activity.date}</div>
      <div className="mt-1 rounded-lg bg-slate-50 p-3">{activity.text}</div>
    </div>
  );
}