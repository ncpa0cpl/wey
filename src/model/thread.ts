import { MessageList } from "./message-list";
import type { Account } from "./account";

interface Channel {
  account: Account;
  openedThreads: Array<Thread>;
}

export class Thread extends MessageList {
  channel: Channel;

  constructor(channel: Channel, id) {
    super(channel.account, "thread", id);
    this.channel = channel;
    this.channel.openedThreads.push(this);
  }

  clear() {
    super.clear();
    const i = this.channel.openedThreads.indexOf(this);
    if (i === -1) {
      console.error("Removing orphan thread", this.id);
      return;
    }
    this.channel.openedThreads.splice(i, 1);
  }
}
