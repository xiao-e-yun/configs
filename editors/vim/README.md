# vim config

Vim 為主，Neovim 有則支援（`init.vim` 只 source `~/.vimrc`）。
Repo 是唯一來源，`install.mjs` symlink 回家目錄，改 repo 即時生效。

| repo 檔 | Linux/macOS | Windows |
|---|---|---|
| `vimrc` | `~/.vimrc` | `~/_vimrc` |
| `coc-settings.json` | `~/.vim/`、`~/.config/nvim/` | `~/vimfiles/`、`~/AppData/Local/nvim/` |
| `nvim-init.vim` | `~/.config/nvim/init.vim` | `~/AppData/Local/nvim/init.vim` |

外掛本體不入庫。

## 安裝

```sh
node install.mjs
```

跨平台（Node，需先裝 Node）。Windows 建 symlink 需開發者模式或管理員權限。

腳本會：檢查依賴（`git`、`node` 必要，`rg` 可選）→ symlink 設定 → 抓 vim-plug → 跑 `:PlugInstall`。
失敗會中斷，已完成步驟記在 `.CHECK_POINTS`（已 gitignore），修好重跑會跳過。

之後安裝語言伺服器：`:CocInstall coc-tsserver coc-json ...`
