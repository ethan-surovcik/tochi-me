# tochi me 🐣

stitch your face onto a tochi — a one-hour build for the "pocket sidekick" hackathon.

upload a photo (or drag, drop, or paste one), drag and zoom it inside the stitched
face patch, pick a scene and a chick color, make it dance, and download your sticker.

## run it

it's a static site — no build step, no dependencies.

```sh
npx serve .
```

or just open `index.html` in a browser.

## how it works

- the chick is hand-drawn svg (body + two wing layers) with a circular face hole cut out via mask
- the photo is composited under the chick on a 1080×1080 canvas, clipped to the hole
- dance mode is a requestAnimationFrame loop: hop, squash-and-stretch, sway, and wing
  flaps around shoulder pivots — your face rides along
- scenes (sunburst, snack rain, sky, disco, sprinkles, sunset) are painted on canvas
- url params for sharing presets: `?bg=disco&chick=strawberry&demo=1&dance=1`
- everything is client-side; your photo never leaves the browser
