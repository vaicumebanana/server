// server.ts - Servidor WebSocket puro
import { serve } from "https://deno.land/std@0.152.0/http/server.ts";

const clients = new Set<WebSocket>();

serve((req) => {
  if (req.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    clients.add(socket);
    
    socket.onopen = () => console.log("Novo cliente conectado");
    socket.onmessage = (e) => {
      // Retransmite para todos os clientes
      clients.forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(e.data);
        }
      });
    };
    socket.onclose = () => clients.delete(socket);
    
    return response;
  }
  
  return new Response("Servidor WebSocket Deno Puro");
}, { port: 8000 });
