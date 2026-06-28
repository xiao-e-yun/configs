// vim install: symlink config into $HOME, fetch vim-plug, install plugins.
// Vim is primary; Neovim is supported if present (init.vim just sources ~/.vimrc).
// Run:  node install.mjs
import { $, link, step, needs, download, platform, panic, at, has, HOME } from "../../utils.mjs";

// vim config locations differ per platform.
const VIMRC = platform({ windows: "~/_vimrc", linux: "~/.vimrc" });
const VIMFILES = platform({ windows: "~/vimfiles", linux: "~/.vim" });
const NVIM = platform({ windows: "~/AppData/Local/nvim", linux: "~/.config/nvim" });

await needs(["git", "node"]); // vim-plug clones via git; coc builds with node/npm
await needs(["rg"], true); // optional: fzf's :Files uses ripgrep

await step("symlink-config", () => {
  link(at("vimrc"), VIMRC);
  link(at("coc-settings.json"), `${VIMFILES}/coc-settings.json`);
  if (has("nvim")) {
    link(at("coc-settings.json"), `${NVIM}/coc-settings.json`);
    link(at("nvim-init.vim"), `${NVIM}/init.vim`);
  }
  return true;
});

await step("fetch-vim-plug", async () => {
  await download(
    "https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim",
    `${VIMFILES}/autoload/plug.vim`
  );
  return true;
});

await step("plug-install", async () => {
  if (has("nvim")) return (await $`nvim --headless +PlugInstall +qa`).exitCode === 0;
  if (has("vim")) {
    const rc = VIMRC.replace("~", HOME);
    return (await $`vim -es -u ${rc} -i NONE -c ${"PlugInstall --sync"} -c qa`).exitCode === 0;
  }
  panic("neither nvim nor vim found");
});

console.log("\nDone. coc language servers: :CocInstall coc-tsserver coc-json ...");
