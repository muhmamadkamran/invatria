// Refresh the existing Google Fonts families and retain their redistribution licenses.
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const families = [
  ["Amiri:wght@400;700", "amiri"],
  ["Cinzel:wght@400;500;600", "cinzel"],
  ["Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600", "cormorantgaramond"],
  ["Great+Vibes", "greatvibes"],
  ["Inter:wght@300;400;500;600;700", "inter"],
  ["Jost:wght@300;400;500", "jost"],
  ["Marcellus", "marcellus"],
];
const source = `https://fonts.googleapis.com/css2?${families.map(([query]) => `family=${query}`).join("&")}&display=swap`;
async function download(url) {
  const response = await fetch(url, { headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  }, signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}
let css = (await download(source)).toString("utf8");
const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)\s]+/g))];
if (!urls.length) throw new Error("No font files found in the stylesheet.");
const assets = [];
for (let index = 0; index < urls.length; index += 4) {
  assets.push(...await Promise.all(urls.slice(index, index + 4).map(async (url) => {
    const extension = new URL(url).pathname.split(".").pop();
    if (extension !== "woff2") throw new Error(`Expected WOFF2: ${url}`);
    const name = `${createHash("sha256").update(url).digest("hex").slice(0, 20)}.woff2`;
    return { url, name, data: await download(url) };
  })));
}
const licenses = await Promise.all(families.map(async ([, folder]) => ({
  name: `${folder}-OFL.txt`,
  data: await download(`https://raw.githubusercontent.com/google/fonts/main/ofl/${folder}/OFL.txt`),
})));
const directory = new URL("../public/fonts/", import.meta.url);
await mkdir(directory, { recursive: true });
for (const asset of assets) {
  css = css.replaceAll(asset.url, `/fonts/${asset.name}`);
  await writeFile(new URL(asset.name, directory), asset.data);
}
for (const license of licenses) await writeFile(new URL(license.name, directory), license.data);
await writeFile(new URL("invitra.css", directory), `/* Self-hosted fonts. See accompanying OFL licenses. */\n${css}`);
await writeFile(new URL("README.md", directory), `# Self-hosted fonts\n\nDownloaded from the Google Fonts CSS API using scripts/vendor-fonts.mjs.\nOriginal stylesheet: ${source}\n\nThe accompanying OFL files contain each family's license and copyright notices.\nRun node scripts/vendor-fonts.mjs to refresh these assets.\n`);
console.log(`Saved ${assets.length} WOFF2 files (${assets.reduce((total, asset) => total + asset.data.length, 0)} bytes), stylesheet and seven licenses.`);
