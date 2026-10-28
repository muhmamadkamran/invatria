import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

// Sharp ships with Next.js. The committed PNG needs no generator or network at runtime.
// This is a product illustration, not a screenshot or a customer endorsement.
const outputDirectory = new URL("../public/images/", import.meta.url);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fffdf8"/>
  <rect x="24" y="24" width="1152" height="582" rx="24" fill="none" stroke="#e6d3ae" stroke-width="2"/>
  <path d="M776 24H1152Q1176 24 1176 48V582Q1176 606 1152 606H850Z" fill="#faf3e7"/>
  <circle cx="970" cy="316" r="224" fill="#f5ecdb"/>
  <g fill="#9b7a14">
    <circle cx="91" cy="101" r="26"/>
    <path d="M82 86H100V90H94V112H100V116H82V112H88V90H82Z" fill="#fffdf8"/>
  </g>
  <text x="132" y="114" fill="#24211e" font-family="Cambria,Georgia,serif" font-size="48">Invitra</text>
  <text x="66" y="220" fill="#9b7a14" font-family="Arial,sans-serif" font-size="17" letter-spacing="3">DESIGN. SHARE. CELEBRATE.</text>
  <text x="63" y="302" fill="#24211e" font-family="Cambria,Georgia,serif" font-size="68">One invitation.</text>
  <text x="63" y="375" fill="#24211e" font-family="Cambria,Georgia,serif" font-size="68">Every detail.</text>
  <text x="66" y="438" fill="#4d4740" font-family="Arial,sans-serif" font-size="25">Create free digital invitations</text>
  <text x="66" y="474" fill="#4d4740" font-family="Arial,sans-serif" font-size="25">and collect guest RSVPs online.</text>
  <path d="M66 528H622" stroke="#e6d3ae" stroke-width="2"/>
  <text x="66" y="565" fill="#4d4740" font-family="Arial,sans-serif" font-size="19">Weddings · Birthdays · Baby showers · Nikah</text>
  <g transform="translate(788 144) rotate(7 155 170)">
    <rect x="9" y="12" width="280" height="344" rx="16" fill="#d9c193" opacity="0.3"/>
    <rect width="280" height="344" rx="16" fill="#fffdf8" stroke="#d9c193" stroke-width="2"/>
    <rect x="16" y="16" width="248" height="312" rx="6" fill="none" stroke="#e6d3ae"/>
    <path d="M140 58L149 71L140 84L131 71Z" fill="#c9a227"/>
    <path d="M89 71H119M161 71H191" stroke="#d9c193" stroke-width="2"/>
    <text x="140" y="133" text-anchor="middle" fill="#9b7a14" font-family="Cambria,Georgia,serif" font-size="29">You’re invited</text>
    <path d="M70 166H210M88 185H192M102 204H178" stroke="#d9c193" stroke-width="3" stroke-linecap="round"/>
    <path d="M99 242H181" stroke="#e6d3ae" stroke-width="2"/>
    <text x="140" y="275" text-anchor="middle" fill="#4d4740" font-family="Arial,sans-serif" font-size="16">A moment to celebrate</text>
  </g>
  <g transform="translate(829 409) rotate(-5 136 58)">
    <rect width="272" height="116" rx="10" fill="#10513f"/>
    <path d="M8 9L136 82L264 9M8 107L102 55M264 107L170 55" fill="none" stroke="#8baa95" stroke-width="2"/>
    <circle cx="136" cy="69" r="22" fill="#c9a227"/>
    <path d="M127 69L133 75L146 62" fill="none" stroke="#fffdf8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(new URL("invitra-share.svg", outputDirectory), svg);
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(fileURLToPath(new URL("invitra-share.png", outputDirectory)));
console.log("Generated public/images/invitra-share.svg and invitra-share.png (1200 × 630).");
