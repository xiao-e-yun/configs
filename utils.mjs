// Shared helpers for config install scripts. Cross-platform (Node, ESM).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, execSync } from "node:child_process";

export const HOME = os.homedir();
const isWin = process.platform === "win32";

// Print a message and abort cleanly (no stack trace). Return type is `never`.
export const panic = (err) => {
  console.error(err);
  process.exit(1);
};

// Pick a per-platform branch as-is (does NOT execute it). `linux` is default.
//   const dir = platform({ windows: winPath, linux: linPath });  // value
//   platform({ windows() {...}, linux() {...} })();              // call it
export const platform = (b) => (isWin && "windows" in b ? b.windows : b.linux);

// Join paths relative to the entry script's dir (the file passed to `node`),
// not the cwd. Works when each install.mjs is run as its own process
// (incl. `node sub/install.mjs`); do NOT use if importing installers in-process.
//   at("vimrc") -> <script dir>/vimrc
export const at = (...f) => path.join(path.dirname(process.argv[1]), ...f);

// Is a command available on PATH? -> boolean
export const has = (cmd) => {
  try {
    return execSync(`${isWin ? "where" : "command -v"} ${cmd}`, { stdio: "ignore" }), true;
  } catch {
    return false;
  }
};

// Quote one interpolated value so spaces/specials survive the shell.
const shquote = (v) => {
  const s = String(v);
  if (isWin) return /[\s"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  return s === "" || /[^A-Za-z0-9_@%+=:,./-]/.test(s) ? `'${s.replace(/'/g, `'\\''`)}'` : s;
};

// Bun-like shell: await $`cmd`  ->  { stdout, stderr, exitCode }
//   .text()  -> stdout string (throws on non-zero exit)
//   .quiet() -> capture without echoing to console
export function $(strings, ...values) {
  const cmd = strings.reduce((acc, str, i) => {
    if (i === 0) return str;
    const v = values[i - 1];
    return acc + (Array.isArray(v) ? v.map(shquote).join(" ") : shquote(v)) + str;
  }, "");

  let quiet = false;
  const p = new Promise((resolve, reject) => {
    const child = spawn(isWin ? "cmd" : "sh", [isWin ? "/c" : "-c", cmd], {
      stdio: ["inherit", "pipe", "pipe"],
    });
    let out = "", err = "";
    child.stdout.on("data", (d) => ((out += d), quiet || process.stdout.write(d)));
    child.stderr.on("data", (d) => ((err += d), quiet || process.stderr.write(d)));
    child.on("error", reject);
    child.on("close", (code) => resolve({ stdout: out, stderr: err, exitCode: code }));
  });

  p.quiet = () => ((quiet = true), p);
  p.text = () =>
    p.then((r) => {
      if (r.exitCode !== 0) throw new Error(`command failed (${r.exitCode}): ${cmd}\n${r.stderr}`);
      return r.stdout;
    });
  return p;
}

const expand = (p) => (p.startsWith("~") ? path.join(HOME, p.slice(1)) : p);

// Symlink src -> dst. Idempotent: repoints existing symlinks, backs up real
// files to *.bak. On Windows, symlinks need Developer Mode or admin.
export function link(src, dst) {
  src = path.resolve(src);
  dst = expand(dst);
  fs.mkdirSync(path.dirname(dst), { recursive: true });

  const stat = fs.lstatSync(dst, { throwIfNoEntry: false });
  if (stat?.isSymbolicLink()) fs.unlinkSync(dst); // repoint
  else if (stat) {
    fs.renameSync(dst, dst + ".bak");
    console.log(`backed up existing ${dst} -> ${dst}.bak`);
  }

  // 'junction' is invalid for files on Windows; use 'file'/'dir'.
  const type = isWin ? (fs.statSync(src).isDirectory() ? "dir" : "file") : undefined;
  fs.symlinkSync(src, dst, type);
  console.log(`linked ${dst} -> ${src}`);
}

// Download url -> dest, creating parent dirs. Uses curl if present, else fetch.
export async function download(url, dest) {
  dest = dest.startsWith("~") ? path.join(HOME, dest.slice(1)) : dest;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (has("curl")) {
    if ((await $`curl -fLo ${dest} --create-dirs ${url}`).exitCode !== 0)
      panic(`download failed: ${url}`);
    return;
  }
  const res = await fetch(url);
  if (!res.ok) panic(`download failed (${res.status}): ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

// Resumable step. Records completed steps to .CHECK_POINTS (NAME1,NAME2,...) in
// the entry script's dir (via at) so re-running skips done steps. callback
// returning false (or throwing) aborts: the step is NOT recorded and the error
// propagates.
const checkPointFile = () => at(".CHECK_POINTS");
const readCheckPoints = () => {
  try {
    return fs.readFileSync(checkPointFile(), "utf8").split(",").map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
};

export async function step(name, callback) {
  const done = readCheckPoints();
  if (done.includes(name)) return void console.log(`[skip] ${name}`);

  console.log(`[run]  ${name}`);
  if ((await callback()) === false) panic(`checkpoint failed: ${name}`);

  fs.writeFileSync(checkPointFile(), [...done, name].join(","));
}

// Read a single line from stdin with a prompt.
const ask = (prompt) =>
  new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.resume();
    process.stdin.once("data", (d) => (process.stdin.pause(), resolve(d.toString().trim())));
  });

// Check external dependencies (does not install them).
//   needs(["node", "rg"])        -> panic (throw) if any are missing
//   needs(["node", "rg"], true)  -> optional: prompt to skip; "yes" continues,
//                                   anything else (default No) panics
export async function needs(deps, optional = false) {
  const missing = deps.filter((d) => !has(d));
  if (!missing.length) return;
  if (!optional) panic(`missing required dependencies: ${missing.join(", ")}`);

  const answer = await ask(`Needs ${missing.join(", ")} skip? (yes/No)\n> `);
  if (answer.toLowerCase() !== "yes") panic(`missing dependencies: ${missing.join(", ")}`);
}
