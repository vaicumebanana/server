// server.ts
import { serve } from "https://deno.land/std@0.152.0/http/server.ts";

const clients = new Map<string, WebSocket>();

const handler = (req: Request): Response => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Not a WebSocket request", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);

  const clientId = crypto.randomUUID();
  clients.set(clientId, socket);

  socket.onopen = () => {
    console.log(`Cliente conectado: ${clientId}`);
  };

  socket.onmessage = (e) => {
    // Transmite mensagem para todos os clientes exceto o remetente
    clients.forEach((client, id) => {
      if (id !== clientId && client.readyState === WebSocket.OPEN) {
        client.send(e.data);
      }
    });
  };

  socket.onclose = () => {
    clients.delete(clientId);
  };

  return response;
};

serve(handler, { port: 8000 });
