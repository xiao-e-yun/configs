// tmux install: symlink config into $HOME and clone tpm (plugin manager).
// After running, open tmux and press `prefix + I` to install plugins.
// Run:  node install.mjs
import fs from "node:fs";
import { $, link, step, needs, at, HOME } from "../../utils.mjs";

await needs(["git", "tmux"]); // tpm clones via git

await step("symlink-config", () => {
  link(at("tmux.conf"), "~/.tmux.conf");
  link(at("configs"), "~/.tmux/configs"); // modal-keybindings.conf etc.
  return true;
});

await step("fetch-tpm", async () => {
  const tpm = `${HOME}/.tmux/plugins/tpm`;
  if (fs.existsSync(tpm)) return true; // already cloned
  return (await $`git clone https://github.com/tmux-plugins/tpm ${tpm}`).exitCode === 0;
});

console.log("\nDone. Open tmux and press `prefix + I` to install plugins.");
