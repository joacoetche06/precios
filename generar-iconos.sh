#!/usr/bin/env bash
# Genera los íconos de la app a partir del logo (necesita ImageMagick).
# Uso: ./generar-iconos.sh ../stock-template/frontend/public/logo.png
set -euo pipefail
LOGO="${1:-logo.png}"
IM="$(command -v magick || command -v convert || true)"
[ -z "$IM" ] && { echo "Falta ImageMagick: sudo apt install imagemagick"; exit 1; }

[ "$LOGO" != "logo.png" ] && cp "$LOGO" logo.png
# Fondo blanco, logo casi a tamaño completo
"$IM" logo.png -background white -alpha remove -alpha off -resize 176x176 -gravity center -extent 192x192 icon-192.png
"$IM" logo.png -background white -alpha remove -alpha off -resize 470x470 -gravity center -extent 512x512 icon-512.png
# Maskable: Android recorta en círculo, el logo va dentro del 70% central
"$IM" logo.png -background white -alpha remove -alpha off -resize 350x350 -gravity center -extent 512x512 icon-maskable-512.png
echo "Listo: logo.png, icon-192.png, icon-512.png, icon-maskable-512.png"
