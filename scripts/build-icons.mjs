import fs from 'fs';
import sharp from 'sharp';

// Exact SVG of Thrille PWA Icon
const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Filter for crisp comic double-outline effect -->
    <style>
      .bg { fill: #E31C19; }
      .letter-fill { fill: #FFF000; }
      .letter-outer { stroke: #000000; stroke-width: 9; stroke-linejoin: round; stroke-linecap: round; }
      .letter-inner { stroke: #000000; stroke-width: 2.5; stroke-linejoin: round; stroke-linecap: round; fill: none; }
      .creature-body { fill: #FFF000; stroke: #000000; stroke-width: 7; stroke-linejoin: round; stroke-linecap: round; }
      .creature-feature { fill: #000000; }
    </style>
  </defs>

  <!-- Background: Saturated Vibrant Red -->
  <rect width="512" height="512" class="bg" />

  <g id="thrille-logo" transform="translate(4, 0)">
    <!-- ==================== Letter T ==================== -->
    <g id="letter-T">
      <!-- Outer Shape & Fill -->
      <path class="letter-outer letter-fill" d="
        M 48 184 
        L 118 184 
        C 121 184, 123 186, 122 193 
        L 118 206 
        C 117 210, 114 211, 109 211 
        L 96 211 
        L 96 248 
        C 96 253, 98 255, 104 255 
        L 108 255 
        L 108 266 
        L 58 266 
        L 58 255 
        L 62 255 
        C 68 255, 70 253, 70 248 
        L 70 211 
        L 57 211 
        C 52 211, 49 210, 48 206 
        L 44 193 
        C 43 186, 45 184, 48 184 Z
      " />
      <!-- Inner inline detail -->
      <path class="letter-inner" d="
        M 54 190 L 112 190 L 110 203 L 90 203 L 90 250 L 98 250 L 98 259 L 68 259 L 68 250 L 76 250 L 76 203 L 56 203 Z
      " />
    </g>

    <!-- ==================== Letter h ==================== -->
    <g id="letter-h">
      <path class="letter-outer letter-fill" d="
        M 124 186 
        L 144 186 
        C 147 186, 149 188, 149 193 
        L 149 212 
        C 155 204, 163 200, 175 200 
        C 188 200, 195 208, 195 222 
        L 195 248 
        C 195 253, 197 255, 202 255 
        L 205 255 
        L 205 266 
        L 173 266 
        L 173 255 
        L 177 255 
        C 181 255, 183 253, 183 248 
        L 183 226 
        C 183 217, 178 213, 170 213 
        C 161 213, 153 219, 149 227 
        L 149 248 
        C 149 253, 151 255, 156 255 
        L 159 255 
        L 159 266 
        L 124 266 
        L 124 255 
        L 128 255 
        C 133 255, 135 253, 135 248 
        L 135 197 
        C 135 190, 132 188, 126 188 Z
      " />
      <path class="letter-inner" d="
        M 137 195 L 143 195 L 143 222 C 149 214, 158 209, 169 209 C 180 209, 186 215, 186 226 L 186 257 L 178 257 L 178 227 C 178 218, 172 216, 166 216 C 158 216, 150 222, 145 231 L 145 257 L 137 257 Z
      " />
    </g>

    <!-- ==================== Letter r ==================== -->
    <g id="letter-r">
      <path class="letter-outer letter-fill" d="
        M 204 207 
        L 223 207 
        C 226 207, 227 209, 227 213 
        L 227 220 
        C 232 209, 240 203, 252 203 
        C 256 203, 260 204, 264 207 
        L 258 224 
        C 254 221, 249 220, 245 220 
        C 236 220, 228 226, 227 236 
        L 227 248 
        C 227 253, 229 255, 234 255 
        L 237 255 
        L 237 266 
        L 204 266 
        L 204 255 
        L 208 255 
        C 213 255, 215 253, 215 248 
        L 215 218 
        C 215 211, 212 209, 206 209 Z
      " />
      <path class="letter-inner" d="
        M 218 214 L 222 214 L 223 226 C 229 216, 237 210, 246 210 C 249 210, 253 211, 256 213 L 253 220 C 248 217, 243 216, 239 216 C 230 216, 223 224, 222 235 L 222 258 L 218 258 Z
      " />
    </g>

    <!-- ==================== Letter i ==================== -->
    <g id="letter-i">
      <!-- Dot -->
      <path class="letter-outer letter-fill" d="
        M 252 186 
        L 270 186 
        C 273 186, 274 188, 274 192 
        L 274 199 
        C 274 203, 272 204, 268 204 
        L 253 204 
        C 249 204, 247 202, 247 198 
        L 247 191 
        C 247 187, 249 186, 252 186 Z
      " />
      <path class="letter-inner" d="
        M 253 191 L 268 191 L 268 199 L 253 199 Z
      " />
      <!-- Stem -->
      <path class="letter-outer letter-fill" d="
        M 248 209 
        L 267 209 
        C 270 209, 272 211, 272 215 
        L 272 248 
        C 272 253, 274 255, 279 255 
        L 282 255 
        L 282 266 
        L 248 266 
        L 248 255 
        L 252 255 
        C 257 255, 259 253, 259 248 
        L 259 218 
        C 259 212, 256 211, 250 211 Z
      " />
      <path class="letter-inner" d="
        M 257 215 L 264 215 L 264 257 L 257 257 Z
      " />
    </g>

    <!-- ==================== Creature Head ("ll") ==================== -->
    <g id="creature-ll">
      <!-- Outer Silhouette of Bunny / Animal Head with 2 tall ears -->
      <path class="creature-body" d="
        M 292 202
        C 289 194, 286 182, 289 174
        C 292 165, 303 162, 310 167
        C 316 172, 318 181, 321 189
        C 324 196, 328 198, 335 186
        C 341 176, 344 164, 354 165
        C 362 166, 369 173, 370 182
        C 372 192, 375 204, 378 214
        C 383 228, 395 237, 398 252
        C 402 268, 396 280, 420 302
        C 426 308, 431 316, 430 326
        C 428 340, 415 354, 401 364
        C 386 376, 373 388, 355 393
        C 338 398, 322 388, 312 376
        C 304 366, 298 351, 297 338
        C 295 318, 301 306, 298 288
        C 295 272, 288 264, 287 248
        C 286 232, 296 214, 292 202 Z
      " />

      <!-- Left Ear Lobe Creases/Bumps Detail -->
      <path d="M 324 197 C 322 206, 318 216, 315 226" fill="none" stroke="#000000" stroke-width="4.5" stroke-linecap="round" />
      <path d="M 368 214 C 365 226, 360 238, 357 248" fill="none" stroke="#000000" stroke-width="4.5" stroke-linecap="round" />

      <!-- Eye: Solid vertical oval -->
      <ellipse class="creature-feature" cx="361" cy="303" rx="7.5" ry="11" />

      <!-- Nose: Solid round dark snout button -->
      <circle class="creature-feature" cx="423" cy="326" r="17" />
    </g>

    <!-- ==================== Letter e ==================== -->
    <g id="letter-e">
      <path class="letter-outer letter-fill" d="
        M 428 229 
        C 428 214, 418 202, 401 202 
        C 385 202, 374 213, 374 231 
        C 374 249, 386 261, 404 261 
        C 416 261, 424 255, 429 248 
        L 416 238 
        C 413 243, 408 246, 403 246 
        C 395 246, 389 240, 389 231 
        L 428 231 Z
        M 389 221 
        C 390 215, 395 211, 401 211 
        C 407 211, 412 215, 413 221 
        L 389 221 Z
      " />
      <path class="letter-inner" d="
        M 401 207 C 390 207, 380 216, 380 231 C 380 245, 389 255, 403 255 C 413 255, 420 250, 424 243 L 417 238 C 413 242, 409 244, 403 244 C 393 244, 386 237, 386 228 L 422 228 C 422 216, 414 207, 401 207 Z
        M 387 222 C 389 215, 394 212, 401 212 C 407 212, 412 215, 414 222 Z
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

  console.log('Icons generated successfully!');
}

build().catch(console.error);
