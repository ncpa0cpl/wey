import Signal from "mini-signals";
import { accountManager } from "../controller/account-manager";
import type { Channel } from "./channel";
import type { SerializedConfig } from "./message-list";
import type { Service } from "./service";
import type { User } from "./user";

interface AccountConfig {
  id: string;
  name: string;
  service: null | string;
  icon: string;
  currentChannelId: string;
  channels: Array<SerializedConfig>;
}

export class Account {
  service: Service;
  id: string;
  name: string;
  icon: string | null;
  url: string;
  authorizationHeader: any;
  channels: Channel[];
  channelsConfig: Record<string, SerializedConfig>;
  dms: any[];
  emoji: any;
  currentChannelId: string | null;
  currentUserId: string | null;
  currentUserName: string | null;
  users: Record<string, User>;
  isRead: boolean;
  mentions: number;
  status: string;
  isChannelsReady: boolean;

  onUpdateChannels = new Signal();
  onUpdateInfo = new Signal();
  onUpdateReadState = new Signal();
  onUpdateMentions = new Signal();
  onUpdateConnection = new Signal();
  onAddChannel = new Signal();
  onRemoveChannel = new Signal();
  onOpenDM = new Signal();
  onCloseDM = new Signal();

  constructor(service: Service, id: string, name: string) {
    this.service = service;
    this.id = id;
    this.name = name;
    this.icon = null;
    this.url = `https://${this.id}.${service.id}.com`;
    this.authorizationHeader = null;
    this.channels = [];
    this.dms = [];
    this.emoji = {};
    this.currentChannelId = null;
    this.currentUserId = null;
    this.currentUserName = null;
    this.users = {};
    this.isRead = true;
    this.mentions = 0;

    this.status = "connecting";
    this.isChannelsReady = false;

    accountManager.addAccount(this);
  }

  serialize() {
    const config: AccountConfig = {
      currentChannelId: null,
      icon: null,
      id: this.id,
      name: this.name,
      channels: null as null | any[],
      service: null as null | string,
    };

    if (this.currentChannelId) {
      config.currentChannelId = this.currentChannelId;
    }

    if (this.icon) {
      config.icon = this.icon;
    }

    for (const messageList of this.channels.concat(this.dms)) {
      const c = messageList.serialize();
      if (!c) continue;
      if (!config.channels) config.channels = [];
      config.channels.push(c);
    }

    return config;
  }

  deserialize(config: AccountConfig) {
    if (config.icon) this.icon = config.icon;
    if (config.currentChannelId)
      this.currentChannelId = config.currentChannelId;
    // Save the config of channels, since channels are loaded later.
    if (config.channels)
      this.channelsConfig = config.channels.reduce(
        (r: Record<string, SerializedConfig>, i) => {
          r[i.id] = i;
          return r;
        },
        {}
      );
  }

  channelsLoaded() {
    if (this.channelsConfig) {
      for (const messageList of this.channels.concat(this.dms)) {
        const config = this.channelsConfig[messageList.id];
        if (config) messageList.deserialize(config);
      }
    }
    this.setReadState(this.computeReadState());
    this.updateMentions();
    this.isChannelsReady = true;
    this.onUpdateChannels.dispatch(this.channels);
  }

  findChannelById(id: string) {
    let channel = this.channels.find((c) => c.id == id);
    if (!channel) channel = this.dms.find((c) => c.id == id);
    return channel;
  }

  // DMs treated as channels.
  findChannelByUserId(id: string) {
    return this.dms.find((c) => c.userId === id);
  }

  findUserById(id: string) {
    return this.users[id];
  }

  computeReadState() {
    const compute = (r: boolean, c: Channel) => {
      return c.isRead || c.isMuted ? r : false;
    };
    return this.channels.reduce(compute, this.dms.reduce(compute, true));
  }

  // Save user for ID lookup
  saveUser(newUser: User) {
    this.users[newUser.id] = newUser;
    return newUser;
  }

  setReadState(read: boolean) {
    if (this.isRead !== read) {
      this.isRead = read;
      this.onUpdateReadState.dispatch(this.isRead);
      accountManager.onUpdateReadState.dispatch(
        accountManager.computeReadState()
      );
    }
  }

  updateReadState() {
    this.setReadState(this.computeReadState());
  }

  updateMentions() {
    const compute = (m: number, c: Channel) => {
      return m + c.mentions;
    };
    const mentions = this.channels.reduce(compute, this.dms.reduce(compute, 0));
    if (mentions !== this.mentions) {
      this.mentions = mentions;
      this.onUpdateMentions.dispatch();
      accountManager.updateMentions();
    }
  }

  async disconnect() {
    throw new Error("Should be implemented by subclass");
  }

  async reload() {
    throw new Error("Should be implemented by subclass");
  }

  async getAllChannels() {
    throw new Error("Should be implemented by subclass");
  }

  async join(channel: Channel) {
    throw new Error("Should be implemented by subclass");
  }

  async leave(channel: Channel) {
    throw new Error("Should be implemented by subclass");
  }
}
