#!/bin/sh
set -eu
cd "$(dirname "$0")"
for panel in eye:0 scream:512 apparition:1024; do
  name=${panel%:*}
  offset=${panel#*:}
  ffmpeg -hide_banner -loglevel error -y -i source-art/nightmare-triptych.png \
    -vf "crop=512:1024:${offset}:0,zoompan=z='1.08+0.05*sin(on/24)':x='iw/2-iw/zoom/2+12*sin(on/29)':y='ih/2-ih/zoom/2+18*cos(on/37)':d=192:s=512x768:fps=24,geq=lum='lum(X+8*sin(Y/58+T*2),Y)':cb='cb(X,Y)':cr='cr(X,Y)',noise=alls=4:allf=t,format=yuv420p" \
    -t 8 -c:v libx264 -preset fast -crf 25 -movflags +faststart -an "dist/assets/${name}.mp4"
done
