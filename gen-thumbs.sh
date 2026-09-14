#!/usr/bin/env bash
# Régénère les vignettes de la galerie (dossier thumbs/) à partir des
# photos de nord/ et sud/. À relancer après tout ajout ou remplacement
# de photo. Nécessite ffmpeg.
set -e
cd "$(dirname "$0")"
mkdir -p thumbs/nord thumbs/sud
for f in nord/*.jpg nord/*.JPG sud/*.jpg sud/*.JPG; do
  [ -e "$f" ] || continue
  ffmpeg -y -loglevel error -i "$f" -vf "scale=800:-2" -q:v 4 "thumbs/$f"
done
echo "Vignettes régénérées dans thumbs/ :"
du -sh thumbs
