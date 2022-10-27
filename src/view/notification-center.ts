import fs from "fs";
import gui from "gui";
import path from "path";

import { accountManager } from "../controller/account-manager";
import { windowManager } from "../controller/window-manager";
import { singleInstance } from "../util/single-instance";
import { MainWindow } from "./main-window";

class NotificationCenterImpl {
  isRead: boolean;
  mentions: number;
  trayIcon: gui.Image;
  attentionIcon: gui.Image;
  mentionIcon: gui.Image;
  tray: gui.Tray;
  subscription: {
    onUpdateReadState: any;
    onUpdateMentions: any;
  };

  constructor() {
    this.isRead = true;
    this.mentions = 0;

    if (process.platform !== "darwin") {
      // Listen for new instances.
      singleInstance.listen(this.activateApp.bind(this));

      // Create tray icon.
      this.trayIcon = gui.Image.createFromPath(
        fs.realpathSync(path.join(__dirname, "tray", "icon.png"))
      );
      this.attentionIcon = gui.Image.createFromPath(
        fs.realpathSync(path.join(__dirname, "tray", "attention.png"))
      );
      this.mentionIcon = gui.Image.createFromPath(
        fs.realpathSync(path.join(__dirname, "tray", "mention.png"))
      );
      this.tray = gui.Tray.createWithImage(this.trayIcon);
      this.tray.onClick = this.activateApp.bind(this);

      const menu = gui.Menu.create([
        {
          label: "Show",
          onClick: this.activateApp.bind(this),
        },
        {
          label: "Quit",
          onClick() {
            windowManager.quit();
          },
        },
      ]);
      this.tray.setMenu(menu);
    }

    this.subscription = {
      onUpdateReadState: accountManager.onUpdateReadState.add(
        this.updateReadState.bind(this)
      ),
      onUpdateMentions: accountManager.onUpdateMentions.add(
        this.updateMentions.bind(this)
      ),
    };
  }

  unload() {
    this.subscription.onUpdateReadState.detach();
    this.subscription.onUpdateMentions.detach();
    this.trayIcon = null;
    this.tray = null;
    if (process.platform !== "darwin") singleInstance.clear();
  }

  updateReadState(isRead: boolean) {
    if (isRead === this.isRead) return;
    this.isRead = isRead;
    this.updateStatus();
  }

  updateMentions(mentions: number) {
    if (mentions === this.mentions) return;
    this.mentions = mentions;
    this.updateStatus();
  }

  updateStatus() {
    if (process.platform === "darwin") {
      const label =
        this.mentions === 0 ? (this.isRead ? "" : "•") : String(this.mentions);
      gui.app.setDockBadgeLabel(label);
    } else {
      this.tray.setImage(
        this.mentions === 0
          ? this.isRead
            ? this.trayIcon
            : this.attentionIcon
          : this.mentionIcon
      );
    }
  }

  activateApp() {
    const win = windowManager.getCurrentWindow();
    if (win) win.window.activate();
    else if (windowManager.windows.length > 0)
      windowManager.windows[0].window.activate();
    else new MainWindow();
  }
}

export const NotificationCenter = new NotificationCenterImpl();
