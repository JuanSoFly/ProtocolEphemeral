import type * as Party from "partykit/server";

export default class ChatServer implements Party.Server {
  messages: string[] = [];

  constructor(readonly room: Party.Room) { }

  onConnect(conn: Party.Connection) {
    this.updatePresence();
  }

  onMessage(message: string, sender: Party.Connection) {
    // Blind relay: opaque payload broadcast
    this.room.broadcast(message, [sender.id]);

    // RAM buffer for reloads
    if (this.messages.length >= 20) this.messages.shift();
    this.messages.push(message);
  }

  onClose() {
    this.updatePresence();
  }

  updatePresence() {
    const count = [...this.room.getConnections()].length;
    this.room.broadcast(JSON.stringify({ type: "presence", count }));
  }
}
