# Navigation Interaction System / 导航交互系统

Version: **1.0.0** (first independent release)

An interactive specimen board for the pixel-style button language used by Gongshui. It demonstrates 24 tactile button states and remains deliberately separate from the real website navigation.

## Run

Serve this directory over HTTP and open `index.html`.

## Structure

- `index.html` — standalone 24-button specimen board.
- `styles/navigation.css` — isolated visual system.
- `scripts/navigation.js` — selection and pressed-state interaction.

## Boundary

The website continues to own actual navigation, routes, history, and accessibility behavior. This project owns only the independent interaction specimen. It must never be used as a replacement for the host application's routing or navigation logic.

## Rights

The original Gongshui artwork and project source remain copyrighted by their author unless a file states otherwise. No blanket redistribution license is granted by this repository.
