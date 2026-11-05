# twen-mods

Mods maintained by [Carricaner](https://github.com/Carricaner).

| Mod | For | What it does |
| --- | --- | --- |
| [twen](plugins/twen) | Claude Code | A smiling seal plush above the prompt that moves while Claude works |

Herdr mods are planned. None are available yet.

## Prerequisites

- Claude Code (tested with 2.1.318, older versions are untested)
- A terminal at least 40 columns wide with room for 8 rows above the prompt

## Install Twen

At the prompt of a Claude Code terminal session:

```
/plugin install twen --marketplace Carricaner/twen-mods
```

Answer `y` to add the marketplace, then choose a scope.

From a shell:

```sh
claude plugin install twen --marketplace Carricaner/twen-mods
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `Carricaner/twen-mods`, then Add plugin.

## Use Twen

```
/twen                 show the current moves
/twen idle <move>     lean, lean-hd
/twen busy <move>     bear, guitar, finding, guitar-3d, kongming
```

Twen stays on the screen by itself. It reads nothing from your project, runs no programs and uses no network. It only remembers which moves you picked.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
