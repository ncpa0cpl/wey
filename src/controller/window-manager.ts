import gui from "gui";
import AppMenu from "../view/app-menu";

export type WindowManagerConfig = {};

class WindowManagerImpl {
  windows: any[];
  config: WindowManagerConfig;
  appMenu?: AppMenu;
  menubars?: any[];

  constructor() {
    this.windows = [];
    this.config = {};

    if (process.platform === "darwin") {
      this.appMenu = new AppMenu();
      gui.app.setApplicationMenu(this.appMenu.menu);
      gui.lifetime.onActivate = () => {
        const MainWindow = require("../view/main-window");
        new MainWindow();
      };
    } else {
      this.menubars = [];
    }
  }

  initWithConfig(config: WindowManagerConfig) {
    this.config = config;
  }

  getConfig() {
    for (const win of this.windows) Object.assign(this.config, win.getConfig());
    return this.config;
  }

  addWindow(win) {
    if (this.windows.includes(win))
      throw new Error("Can not add existing window");
    this.windows.push(win);
    if (process.platform !== "darwin") {
      const menubar = new AppMenu(win);
      this.menubars.push(menubar);
      win.window.setMenuBar(menubar.menu);
    }
    win.initWithConfig(this.config);
    win.window.onClose = () => this.removeWindow(win);
  }

  removeWindow(win) {
    const i = this.windows.indexOf(win);
    if (i === -1) throw new Error("Removing unknown window");
    this.windows.splice(i, 1);
    win.unload();

    if (process.platform !== "darwin") {
      this.menubars[i].unload();
      this.menubars.splice(i, 1);
    }
    process.gc(true, 2);
  }

  getCurrentWindow() {
    for (const win of this.windows) {
      if (win.window.isActive()) return win;
    }
    return null;
  }

  quit() {
    for (const win of this.windows) win.window.close();

    require("../view/notification-center").unload();
    require("../controller/config-store").serialize();
    gui.MessageLoop.quit();
    process.gc(true, 2);

    // Ignore pending Node.js works.
    process.exit(0);
  }
}

export const windowManager = new WindowManagerImpl();
