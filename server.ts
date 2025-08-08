// server.ts
import { serve } from "https://deno.land/std@0.152.0/http/server.ts";

// Conexões ativas
const clients = new Map<string, WebSocket>();

const handler = async (req: Request): Promise<Response> => {
  // Upgrade para WebSocket
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);

    const clientId = crypto.randomUUID();
    clients.set(clientId, socket);

    socket.onopen = () => {
      console.log(`Cliente conectado: ${clientId}`);
    };

    socket.onmessage = (e) => {
      // Broadcast para todos exceto o remetente
      clients.forEach((client, id) => {
        if (id !== clientId && client.readyState === WebSocket.OPEN) {
          client.send(e.data);
        }
      });
    };

    socket.onclose = () => {
      clients.delete(clientId);
      console.log(`Cliente desconectado: ${clientId}`);
    };

    return response;
  }

  // Resposta para requisições HTTP normais
  return new Response("Servidor WebSocket pronto", { status: 200 });
};

// Inicie o servidor na porta 8080
serve(handler, { port: 8080 });
