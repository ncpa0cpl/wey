import fs from "fs";
import path from "path";
import Signal from "mini-signals";
import type { Account } from "../model/account";

export type SerializedAccount = {
  id: string;
  name: string;
  channels: any[];
  service: string;
};

class AccountsManagerImpl {
  servicesPath: string;
  accounts: Account[];
  onAddAccount: Signal;
  onRemoveAccount: Signal;
  onUpdateReadState: Signal;
  onUpdateMentions: Signal;

  constructor() {
    this.servicesPath = path.resolve(__dirname, "..", "service");
    this.accounts = [];

    this.onAddAccount = new Signal();
    this.onRemoveAccount = new Signal();
    this.onUpdateReadState = new Signal();
    this.onUpdateMentions = new Signal();
  }

  serialize(): SerializedAccount[] {
    return this.accounts.map((account) => {
      const config = account.serialize();
      config.service = account.service.id;
      return config;
    });
  }

  deserialize(config) {
    for (const c of config) {
      const service = require(path.join(this.servicesPath, c.service));
      const account = service.createAccount(c.id, c.name, c.token);
      account.deserialize(c);
    }
  }

  getServices() {
    const services = fs.readdirSync(this.servicesPath);
    return services.map((s) => require(path.join(this.servicesPath, s)));
  }

  addAccount(account: Account) {
    // When adding duplicate account, just focus on it.
    const a = this.findAccountById(account.id);
    if (a) {
      const win = require("./window-manager").getCurrentWindow();
      if (win && win.selectAccount) win.selectAccount(a);
      return;
    }

    this.onAddAccount.dispatch(account);
    this.accounts.push(account);
  }

  removeAccount(account: Account) {
    const index = this.accounts.indexOf(account);
    if (index === -1) {
      console.error("Removing orphan account", account.name);
      return;
    }
    this.onRemoveAccount.dispatch(account, index);
    this.accounts.splice(index, 1);
    account.disconnect();
  }

  findAccountById(id: string) {
    return this.accounts.find((a) => a.id == id);
  }

  computeReadState() {
    return this.accounts.reduce((r, a) => {
      return a.isRead ? r : false;
    }, true);
  }

  updateMentions() {
    const mentions = this.accounts.reduce((m, a) => {
      return m + a.mentions;
    }, 0);
    this.onUpdateMentions.dispatch(mentions);
  }
}

export const accountManager = new AccountsManagerImpl();
