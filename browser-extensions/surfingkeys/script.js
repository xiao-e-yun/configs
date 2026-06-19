// ============================================================
//  Surfingkeys 自訂設定
//  貼進 Surfingkeys 圖示 → Settings 的設定框即可。
// ============================================================
const { map, mapkey, cmap, Normal, RUNTIME, Front, addSearchAlias } = api;

// ---------- Visual ----------
// 複製後自動回到 Normal 模式
settings.modeAfterYank = 'Normal';

// ---------- 搜尋別名 ----------
// 把別名 e 設為 Google（覆蓋預設連到 Wikipedia 的 e）
// 之後 oe 開 Google 搜尋 Omnibar、se 用 Google 搜尋選取的文字
addSearchAlias('e', 'google', 'https://www.google.com/search?q=');

// ---------- Link hints ----------
// s 當成 f 的別名（easymotion 手感）
// ⚠ 這會遮蔽所有 s 開頭的指令，包含 su（編輯網址）、sg 等
map('s', 'f');

// 半頁捲動（Vim 手感;效果同預設 e/d，要整頁改 fullPageDown/fullPageUp）
mapkey('<Ctrl-d>', 'Half page down', () => Normal.scroll('pageDown'));
mapkey('<Ctrl-u>', 'Half page up',   () => Normal.scroll('pageUp'));

// ---------- 分頁 ----------
// <c-p>：模糊切換瀏覽器分頁（Omnibar，預設 MRU 順序;接續你 fzf Ctrl-P 的手感）
mapkey('<Alt-p>', 'Choose a tab', () => Front.openOmnibar({ type: 'Tabs' }));
map('<Ctrl-p>', 'T');


// Omnibar 內用 <c-j>/<c-k> 上下移動候選（對到內建的 Tab / Shift-Tab）
cmap('<Ctrl-j>', '<Tab>');
cmap('<Ctrl-k>', '<Shift-Tab>');


// 切回上一個 / 下一個「使用過」的分頁（MRU，兩個方向都有）
mapkey('<Ctrl-o>', 'Previous used tab',
  () => RUNTIME('historyTab', { backward: true }),
  { repeatIgnore: true });
mapkey('<Ctrl-i>', 'Next used tab',
  () => RUNTIME('historyTab', { backward: false }),
  { repeatIgnore: true });
  
// 順序切換左右分頁（⚠ 瀏覽器層級鍵，見訊息說明可能被攔截）
map('<Ctrl-l>', 'R');   // 下一個分頁
map('<Alt-l>', 'R');
map('<Ctrl-h>', 'E');   // 上一個分頁
map('<Alt-h>', 'E');

// ---------- 瀏覽歷史 ----------
// u 後退;前進改到 <c-r>（⚠ Ctrl+R 是瀏覽器重新整理，可能被攔截;小寫 r 仍可重整）
mapkey('u', 'Go back in history',           () => history.go(-1));
mapkey('<Ctrl-r>', 'Go forward in history', () => history.go(1));

// ---------- 捲動區塊聚焦 ----------
// w：用 hint 挑可捲動區塊並設為捲動目標（alias 到內建的 ;fs，會正確生 hint 並改捲動目標）
map('w', ';fs');

//
settings.theme = `
.sk_theme {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 13px;
  background: oklch(0.232 0.01 0.937);
  color: oklch(0.938 0.015 358.911);
  border: 1px solid oklch(0.32 0.021 1.593);
}

.sk_theme tbody { color: oklch(0.938 0.015 358.911); }
.sk_theme input { color: oklch(0.938 0.015 358.911); }
.sk_theme .url { color: oklch(0.705 0.081 1.876); }
.sk_theme .annotation { color: oklch(0.658 0.052 0.896); }
.sk_theme .omnibar_highlight { color: oklch(0.604 0.091 2.877); }
.sk_theme .omnibar_timestamp { color: oklch(0.527 0.062 1.979); }
.sk_theme .omnibar_visitcount { color: oklch(0.658 0.052 0.896); }
.sk_theme #sk_omnibarSearchArea .prompt { display: none }
.sk_theme #sk_omnibarSearchArea .resultPage { font-size: small; }
.sk_theme #sk_omnibarSearchResult>ul>li { padding: 0.2rem 1rem; }
.sk_theme #sk_omnibarSearchResult>ul>li:nth-child(odd) { background: oklch(0.211 0.008 0.858); }
.sk_theme #sk_omnibarSearchResult>ul>li.focused { background: oklch(0.292 0.017 1.383); }
#sk_status, #sk_find {
  font-size: 16px;
  background: oklch(0.232 0.01 0.937);
  color: oklch(0.938 0.015 358.911);
  border: 1px solid oklch(0.32 0.021 1.593);
}

/* = Tabs =================================================== */
@keyframes fade_in {
    from { opacity: 0; transform: translateX(-14px); }  /* 由右滑入 + 淡入 */
    to   { opacity: 1; transform: translateX(0); }
}

#sk_tabs { 
    margin-top: 7px;
    background: none;
    overflow: hidden;
}

#sk_tabs .sk_tab {
    background: oklch(0.232 0.01 0.937);   /* --card */
    border: none;                          /* 去黑色 border-top（不要 border-left） */
    box-shadow: none;                      /* 去黃色 glow */
    padding: 1px 8px;                      
    margin-left: 0px;
    margin-bottom: 6px;
    border-radius: 0 3px 3px 0;
    box-shadow: inset 0 0 0 1px oklch(0.32 0.021 1.593);   /* --border */
    animation: fade_in 0.2s ease both;

}

#sk_tabs.vertical .sk_tab {
    display: flex;
    align-items: center;
}
#sk_tabs.vertical div.sk_tab_hint { position: inherit; }

#sk_tabs .sk_tab_hint {
    background: oklch(0.705 0.081 1.876);           /* --primary */
    color: oklch(0.189 0.008 0.871);                /* --primary-foreground */
    border: none;
    box-shadow: none;
    border-radius: 3px;
    font-weight: 700;
    font-family: ui-monospace, monospace;
    min-width: 12px;
    text-align: center;
    margin: 0;
    padding: 0;
}

#sk_tabs .sk_tab_title {
    padding-left: 16px;
    min-width: 0!important;
    color: oklch(0.758 0.052 0.896);                /* --muted-foreground */

}

#sk_tabs .sk_tab_icon { display: none; }

#sk_tabs .tab_rocket { 
    width: 0px;
    padding: 0px;
}

/* active：整盒填 --primary，hint 反相 */
#sk_tabs .sk_tab.active {
    background: oklch(0.705 0.081 1.876);
    box-shadow: inset 0 0 0 1px oklch(0.78 0.08 1.9);

}
#sk_tabs .sk_tab.active .sk_tab_wrap {
    padding-left: 12px;
}

#sk_tabs .sk_tab.active .sk_tab_title {
    color: oklch(0.189 0.008 0.871);                /* --primary-foreground */
}
`;
// 連結 hint（按 f 出現）：白字改深字、加圓角/內距/陰影、等寬粗體
api.Hints.style(`
    font-family: ui-monospace, monospace;
    font-size: 11px;
    font-weight: 700;
    color: oklch(0.189 0.008 0.871);          /* 深字，取代原本的白字 */
    background: oklch(0.78 0.071 1.207);
    border: 1px solid oklch(0.62 0.09 1.3);    /* 邊框比底色深一階，更立體 */
    border-radius: 4px;
    padding: 1px 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35); /* 浮在網頁內容上 */
`);

// 文字 hint：對比本來就 OK，補圓角/內距/陰影，begin 前綴加粗更好認
api.Hints.style(`
    div {
        font-family: ui-monospace, monospace;
        font-size: 11px;
        color: oklch(0.435 0.021 1.102);
        background: oklch(0.991 0.002 3.475);
        border: 1px solid oklch(0.78 0.071 1.207);
        border-radius: 4px;
        padding: 1px 4px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }
    div.begin {
        color: oklch(0.648 0.079 2.077);
        font-weight: 700;
    }
`, 'text');
