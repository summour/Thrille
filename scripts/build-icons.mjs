import fs from 'fs';
import sharp from 'sharp';

// High-fidelity SVG based on the uploaded icon-trille0.png
const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <style>
      .bg { fill: #DB1F18; }
      .letter-body { fill: #FFEA00; }
      .letter-outline { stroke: #000000; stroke-width: 8; stroke-linejoin: round; stroke-linecap: round; }
      .letter-inline { stroke: #000000; stroke-width: 2.6; stroke-linejoin: round; stroke-linecap: round; fill: none; }
      .creature-body { fill: #FFEA00; stroke: #000000; stroke-width: 7; stroke-linejoin: round; stroke-linecap: round; }
      .creature-feature { fill: #000000; }
    </style>
  </defs>

  <!-- Background: Saturated Vibrant Red -->
  <rect width="512" height="512" class="bg" />

  <g id="thrille-logo">
    <!-- ==================== Letter T ==================== -->
    <g id="letter-T">
      <path class="letter-outline letter-body" d="
        M 46 182 
        L 118 182 
        C 122 182, 124 185, 123 192 
        L 119 204 
        C 118 208, 115 209, 110 209 
        L 96 209 
        L 96 247 
        C 96 252, 98 254, 104 254 
        L 108 254 
        L 108 265 
        L 56 265 
        L 56 254 
        L 60 254 
        C 66 254, 68 252, 68 247 
        L 68 209 
        L 55 209 
        C 50 209, 47 208, 46 204 
        L 42 192 
        C 41 185, 43 182, 46 182 Z
      " />
      <path class="letter-inline" d="
        M 52 188 L 112 188 L 110 201 L 89 201 L 89 250 L 98 250 L 98 258 L 66 258 L 66 250 L 75 250 L 75 201 L 54 201 Z
      " />
    </g>

    <!-- ==================== Letter h ==================== -->
    <g id="letter-h">
      <path class="letter-outline letter-body" d="
        M 124 184 
        L 144 184 
        C 147 184, 149 186, 149 191 
        L 149 211 
        C 155 203, 164 199, 175 199 
        C 188 199, 195 207, 195 221 
        L 195 247 
        C 195 252, 197 254, 202 254 
        L 205 254 
        L 205 265 
        L 173 265 
        L 173 254 
        L 177 254 
        C 181 254, 183 252, 183 247 
        L 183 225 
        C 183 216, 178 212, 170 212 
        C 161 212, 153 218, 149 226 
        L 149 247 
        C 149 252, 151 254, 156 254 
        L 159 254 
        L 159 265 
        L 124 265 
        L 124 254 
        L 128 254 
        C 133 254, 135 252, 135 247 
        L 135 195 
        C 135 188, 132 186, 126 186 Z
      " />
      <path class="letter-inline" d="
        M 137 193 L 143 193 L 143 221 C 149 213, 158 208, 169 208 C 180 208, 186 214, 186 225 L 186 256 L 178 256 L 178 226 C 178 217, 172 215, 166 215 C 158 215, 150 221, 145 230 L 145 256 L 137 256 Z
      " />
    </g>

    <!-- ==================== Letter r ==================== -->
    <g id="letter-r">
      <path class="letter-outline letter-body" d="
        M 203 206 
        L 222 206 
        C 225 206, 226 208, 226 212 
        L 226 219 
        C 231 208, 239 202, 251 202 
        C 255 202, 259 203, 263 206 
        L 257 223 
        C 253 220, 248 219, 244 219 
        C 235 219, 227 225, 226 235 
        L 226 247 
        C 226 252, 228 254, 233 254 
        L 236 254 
        L 236 265 
        L 203 265 
        L 203 254 
        L 207 254 
        C 212 254, 214 252, 214 247 
        L 214 217 
        C 214 210, 211 208, 205 208 Z
      " />
      <path class="letter-inline" d="
        M 217 213 L 221 213 L 222 225 C 228 215, 236 209, 245 209 C 248 209, 252 210, 255 212 L 252 219 C 247 216, 242 215, 238 215 C 229 215, 222 223, 221 234 L 221 257 L 217 257 Z
      " />
    </g>

    <!-- ==================== Letter i ==================== -->
    <g id="letter-i">
      <!-- Dot -->
      <path class="letter-outline letter-body" d="
        M 251 185 
        L 269 185 
        C 272 185, 273 187, 273 191 
        L 273 198 
        C 273 202, 271 203, 267 203 
        L 252 203 
        C 248 203, 246 201, 246 197 
        L 246 190 
        C 246 186, 248 185, 251 185 Z
      " />
      <path class="letter-inline" d="
        M 252 190 L 267 190 L 267 198 L 252 198 Z
      " />
      <!-- Stem -->
      <path class="letter-outline letter-body" d="
        M 247 208 
        L 266 208 
        C 269 208, 271 210, 271 214 
        L 271 247 
        C 271 252, 273 254, 278 254 
        L 281 254 
        L 281 265 
        L 247 265 
        L 247 254 
        L 251 254 
        C 256 254, 258 252, 258 247 
        L 258 217 
        C 258 211, 255 210, 249 210 Z
      " />
      <path class="letter-inline" d="
        M 256 214 L 263 214 L 263 256 L 256 256 Z
      " />
    </g>

    <!-- ==================== Creature Head ("ll") ==================== -->
    <g id="creature-ll">
      <!-- Full Creature Outline (Ears + Head + Chin + Snout) -->
      <path class="creature-body" d="
        M 288 262
        C 287 248, 284 238, 288 226
        C 285 215, 285 204, 288 195
        C 292 184, 299 175, 312 176
        C 324 177, 331 187, 336 200
        C 341 190, 347 178, 359 176
        C 371 174, 381 184, 385 197
        C 388 207, 386 218, 391 228
        C 394 236, 393 246, 396 256
        C 400 266, 408 274, 420 286
        C 434 299, 448 314, 447 334
        C 445 352, 434 371, 417 388
        C 402 402, 384 414, 362 414
        C 342 414, 324 402, 311 386
        C 300 371, 294 350, 292 330
        C 290 308, 291 285, 288 262 Z
      " />

      <!-- Ear dividing crease line -->
      <path d="M 336 200 C 342 218, 348 238, 350 256" fill="none" stroke="#000000" stroke-width="4.5" stroke-linecap="round" />

      <!-- Left ear inner fold contour -->
      <path d="M 322 192 C 319 204, 315 218, 312 230" fill="none" stroke="#000000" stroke-width="4" stroke-linecap="round" />

      <!-- Eye: Solid vertical oval -->
      <ellipse class="creature-feature" cx="376" cy="315" rx="7" ry="11" />

      <!-- Nose: Solid round dark button at tip of snout -->
      <circle class="creature-feature" cx="445" cy="336" r="17.5" />
    </g>

    <!-- ==================== Letter e ==================== -->
    <g id="letter-e">
      <path class="letter-outline letter-body" d="
        M 458 227 
        C 458 213, 448 201, 431 201 
        C 415 201, 404 212, 404 230 
        C 404 248, 416 260, 434 260 
        C 446 260, 454 254, 459 247 
        L 446 237 
        C 443 242, 438 245, 433 245 
        C 425 245, 419 239, 419 230 
        L 458 230 Z
        M 419 220 
        C 420 214, 425 210, 431 210 
        C 437 210, 442 214, 443 220 
        L 419 220 Z
      " />
      <path class="letter-inline" d="
        M 431 206 C 420 206, 410 215, 410 230 C 410 244, 419 254, 433 254 C 443 254, 450 249, 454 242 L 447 237 C 443 241, 439 243, 433 243 C 423 243, 416 236, 416 227 L 452 227 C 452 215, 444 206, 431 206 Z
        M 417 221 C 419 214, 424 211, 431 211 C 437 211, 442 214, 444 221 Z
      " />
    </g>
  </g>
</svg>`;

async function build() {
  fs.writeFileSync('public/icon-thrille.svg', svg512);
  fs.writeFileSync('public/favicon.svg', svg512);

  // Generate PNG sizes for PWA
  await sharp(Buffer.from(svg512))
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');

  await sharp(Buffer.from(svg512))
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');

  await sharp(Buffer.from(svg512))
    .resize(512, 512)
    .png()
    .toFile('public/pwa-maskable-512x512.png');

  await sharp(Buffer.from(svg512))
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  // Also save as icon-trille0.png in public so it can be referenced directly by filename
  await sharp(Buffer.from(svg512))
    .resize(512, 512)
    .png()
    .toFile('public/icon-trille0.png');

  console.log('All PWA icons rebuilt successfully!');
}

build().catch(console.error);
