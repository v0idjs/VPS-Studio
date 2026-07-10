export interface AppSettings {
  default_ssh_port: number;
  polling_interval: number;
  theme: string;
  language: string;
  show_tooltips: boolean;
  compact_mode: boolean;
  auto_connect: boolean;
  max_terminal_lines: number;
  font_size: number;
}

export const defaultSettings: AppSettings = {
  default_ssh_port: 22,
  polling_interval: 30,
  theme: "dark",
  language: "en",
  show_tooltips: true,
  compact_mode: false,
  auto_connect: false,
  max_terminal_lines: 1000,
  font_size: 14,
};
