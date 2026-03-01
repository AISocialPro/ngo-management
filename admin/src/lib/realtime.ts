// src/lib/realtime.ts
type Client = { id: string; write: (chunk: string) => void };

class SSEHub {
  private clients = new Map<string, Client>();

  add(clientId: string, write: (chunk: string) => void) {
    this.clients.set(clientId, { id: clientId, write });
  }
  remove(clientId: string) {
    this.clients.delete(clientId);
  }
  broadcast(event: string, data: unknown) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const c of this.clients.values()) c.write(payload);
  }
}

export const eventsHub = new SSEHub();
