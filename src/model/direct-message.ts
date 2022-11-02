import Signal from "mini-signals";
import { MessageList } from "./message-list";
import type { Account } from "./account";
import type { Message } from "./message";

export class DirectMessage extends MessageList {
  name: string;
  userId: string | null;
  isMultiParty: boolean;
  isAway: boolean;

  onUpdateAwayState = new Signal();

  constructor(account: Account, id: string, name: string) {
    super(account, "dm", id);
    this.name = name;
    this.userId = null;
    this.isMultiParty = false;
    this.isAway = false;
  }

  setAway(isAway: boolean) {
    if (this.isAway !== isAway) {
      this.isAway = isAway;
      this.onUpdateAwayState.dispatch();
    }
  }

  markRead() {
    super.markRead();
    if (!this.account.isRead) {
      this.account.updateReadState();
      this.account.updateMentions();
    }
  }

  async dispatchMessage(message: Message) {
    await super.dispatchMessage(message);
    if (!this.isDisplaying) {
      this.account.setReadState(false);
      this.account.updateMentions();
    }
  }
}
