import type { Theme } from "../theme/dark";
import { darkTheme } from "../theme/dark";

class ThemeManagerImpl {
  theme: Theme;
  constructor() {
    this.theme = darkTheme;
  }
}

export const themeManager = new ThemeManagerImpl();
