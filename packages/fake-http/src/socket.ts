import { EventEmitter } from "events";

export class FakeSocket extends EventEmitter {
  declare encrypted: boolean;
  localAddress: string;
  localPort: number;
  localFamily: string;
  remoteAddress: string;
  remotePort: number;
  remoteFamily: string;

  constructor({
    encrypted = true,
    localAddress = "127.0.0.1",
    localPort = 8080,
    localFamily = "IPv4",
    remoteAddress = "127.0.0.1",
    remotePort = 8888,
    remoteFamily = "IPv4",
  }: {
    encrypted?: boolean;
    localAddress?: string;
    localPort?: number;
    localFamily?: string;
    remoteAddress?: string;
    remotePort?: number;
    remoteFamily?: string;
  } = {}) {
    super();
    if (encrypted) {
      this.encrypted = true;
    }
    this.localAddress = localAddress;
    this.localPort = localPort;
    this.localFamily = localFamily;
    this.remoteAddress = remoteAddress;
    this.remotePort = remotePort;
    this.remoteFamily = remoteFamily;
  }

  setTimeout() {}

  end() {}

  get [Symbol.toStringTag](): string {
    return "FakeSocket";
  }
}
