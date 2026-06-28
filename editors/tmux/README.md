# tmux config

Repo 是唯一來源，`install.mjs` symlink 回家目錄，改 repo 即時生效。

| repo 檔 | 連到 |
|---|---|
| `tmux.conf` | `~/.tmux.conf` |
| `configs/` | `~/.tmux/configs/`（tmux-modal 鍵位等） |

外掛本體（`~/.tmux/plugins/`）不入庫，由 tpm 重建。

## 安裝

```sh
node install.mjs
```

需要 `git`、`tmux`。腳本會 symlink 設定並 clone tpm。
之後開 tmux 按 `prefix + I`（預設 prefix 為 `C-a`）安裝外掛。
