import fs from "fs-extra";
import os from "os";
import path from "path";
import { accountManager } from "./account-manager";
import { windowManager } from "./window-manager";
import type { SerializedAccount } from "./account-manager";

const CONFIG_VERSION = 9;

function getConfigDir(name) {
  switch (process.platform) {
    case "win32":
      if (process.env.APPDATA) return path.join(process.env.APPDATA, name);
      else return path.join(os.homedir(), "AppData", "Roaming", name);
    case "darwin":
      return path.join(os.homedir(), "Library", "Application Support", name);
    case "linux":
      if (process.env.XDG_CONFIG_HOME)
        return path.join(process.env.XDG_CONFIG_HOME, name);
      else return path.join(os.homedir(), ".config", name);
    default:
      throw new Error("Unknown platform");
  }
}

export type Config = {
  version: number;
  accounts: SerializedAccount[];
  window: {};
};

class ConfigStoreImpl {
  dir: string;
  file: string;
  locked: boolean;

  constructor() {
    this.dir = getConfigDir(require("../../package.json").build.productName);
    this.file = path.join(this.dir, "config.json");
    fs.ensureFileSync(this.file);

    // Prevent serializing when deserializing.
    this.locked = false;

    // Read config.
    const content = fs.readFileSync(this.file);
    if (content.length === 0) fs.writeFileSync(this.file, "{}");
    else this.deserialize(JSON.parse(content.toString()));
  }

  serialize() {
    if (this.locked) return;
    const config = {
      version: CONFIG_VERSION,
      accounts: accountManager.serialize(),
      window: windowManager.serialize(),
    };
    fs.writeJsonSync(this.file, config, { spaces: 2 });
  }

  deserialize(config) {
    this.locked = true;
    if (config.version != CONFIG_VERSION) config = {}; // TODO Report error here
    if (Array.isArray(config.accounts))
      accountManager.deserialize(config.accounts);
    if (config.window) windowManager.initWithConfig(config.window);
    this.locked = false;
  }
}

export const configStore = new ConfigStoreImpl();
