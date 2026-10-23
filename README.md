# Stardew Valley Archipelago Tracker

This is a basic web tracker for Stardew Valley Archipelagos.

I found that I was creating my own paper tracker
for several categories so I could quickly see what
needed to be done.

The tracker can be self-hosted,
but it can also just be accessed at my website (whenever that occurs).

## Setup

### Node

You'll need a modern version of Node.
I'm using Node v22.18.0.

If you use a node manager like [fnm](https://github.com/schniz/fnm),
you can setup for it to automatically use the
correct node version based on the `.node-version` file.
See [this documentation](https://github.com/Schniz/fnm/blob/master/docs/configuration.md).

### PNPM

The project uses [pnpm](https://pnpm.io/installation).
It's faster than npm while being simple to use.

After downloading or pulling changes,
you will need to update the code:

```bash
pnpm install
```

## Development

The app uses NextJS with app router
and server components.

Styling is done via css modules.

To run the project, use:

```bash
pnpm run dev
```

## Planned features

* Login to any archipelago
* Automatically reconnect on page refresh
* Show all checks
* Group checks together
* Display the status of checks
* Cache page data
* Show shorter formats for checks
* Show all hints
* Allow hinting from the tracker
* Manually track randomized locations
