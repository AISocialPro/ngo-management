import { Document, ChecklistItem, ComplianceActivity, DocCategory } from './models';

const API_BASE = '/api';

export async function fetchDocuments(category?: string, search?: string): Promise<Document[]> {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search) params.append('search', search);
  
  const response = await fetch(`${API_BASE}/documents?${params}`);
  if (!response.ok) throw new Error('Failed to fetch documents');
  return response.json();
}

export async function createDocument(document: Omit<Document, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Document> {
  const response = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(document),
  });
  if (!response.ok) throw new Error('Failed to create document');
  return response.json();
}

export async function fetchChecklist(): Promise<ChecklistItem[]> {
  const response = await fetch(`${API_BASE}/checklist`);
  if (!response.ok) throw new Error('Failed to fetch checklist');
  return response.json();
}

export async function createChecklistItem(item: Omit<ChecklistItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ChecklistItem> {
  const response = await fetch(`${API_BASE}/checklist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!response.ok) throw new Error('Failed to create checklist item');
  return response.json();
}

export async function updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<ChecklistItem> {
  const response = await fetch(`${API_BASE}/checklist`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...updates }),
  });
  if (!response.ok) throw new Error('Failed to update checklist item');
  return response.json();
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/checklist?id=${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete checklist item');
}

export async function fetchActivities(): Promise<ComplianceActivity[]> {
  const response = await fetch(`${API_BASE}/activities`);
  if (!response.ok) throw new Error('Failed to fetch activities');
  return response.json();
}

export async function fetchStats(): Promise<{
  totalDocuments: number;
  compliancePercentage: number;
  pendingItems: number;
  upcomingDeadlines: number;
  stats: {
    completed: number;
    pending: number;
    overdue: number;
    total: number;
  };
}> {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}