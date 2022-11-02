import { MessageList } from "./message-list";
import type { Account } from "./account";
import type { Message } from "./message";
import type { Reaction } from "./reaction";
import type { Thread } from "./thread";

export class Channel extends MessageList {
  name: string;
  description: string;
  isMember: boolean;
  isPrivate: boolean;
  isDefault: boolean;
  openedThreads: Thread[];

  constructor(account: Account, type: string, id: string, name: string) {
    super(account, type, id);
    this.name = name;
    this.description = "(No description)";

    this.isMember = false;
    this.isPrivate = false;
    this.isDefault = false;

    this.openedThreads = [];
  }

  findThread(id: string) {
    return this.openedThreads.find((t) => t.id === id);
  }

  openThread(id: string) {
    const thread = this.findThread(id);
    return thread ? thread : this.openThreadImpl(id);
  }

  openThreadImpl(id: string) {
    throw new Error("Should be implemented by subclasses");
  }

  markRead() {
    super.markRead();
    if (!this.account.isRead) {
      this.account.updateReadState();
      this.account.updateMentions();
    }
  }

  markUnread() {
    super.markUnread();
    if (!this.isMuted && this.account.isRead) this.account.setReadState(false);
  }

  updateMessageStar(id: string, timestamp: number, hasStar: boolean) {
    const message = super.updateMessageStar(id, timestamp, hasStar);
    if (message && message.threadId) {
      const thread = this.findThread(message.threadId);
      if (thread) thread.updateMessageStar(id, timestamp, hasStar);
    }
    return message;
  }

  reactionAdded(id: string, timestamp: number, reaction: Reaction) {
    const message = super.reactionAdded(id, timestamp, reaction);
    if (message && message.threadId) {
      const thread = this.findThread(message.threadId);
      if (thread) thread.reactionAdded(id, timestamp, reaction);
    }
    return message;
  }

  reactionRemoved(id: string, timestamp: number, reaction: Reaction) {
    const message = super.reactionRemoved(id, timestamp, reaction);
    if (message && message.threadId) {
      const thread = this.findThread(message.threadId);
      if (thread) thread.reactionRemoved(id, timestamp, reaction);
    }
    return message;
  }

  async dispatchMessage(message: Message) {
    await super.dispatchMessage(message);
    if (!this.isDisplaying) this.account.updateMentions();
  }
}
