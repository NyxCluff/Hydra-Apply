# Hydra-Apply

Gnome extension to apply random wallpapers using [Hydrapaper](https://hydrapaper.gabmus.org).

### Currently only works with the flatpak version of Hydrapaper.

Uses systemd-run to create transient timers that will run the hydrapaper flatpak with the -r command line option. 

Only tested on Pop_Os, Gnome 42.1 with X11.

# Installation
Not yet on Gnome Extensions so to install, clone the repository and chuck the folder into your local extensions folder. 

Likely:
``` code
~/.local/share/gnome-shell/extensions/
```
Then run,
```
gnome-extensions apply hydra-apply@nullstrom.com
```

It should now show up in the extensions app.

**Remember: You should have the flatpak of Hydrapaper installed and setup with all your wallpapers already for this to work. It is also beholden to the limitaions of hydrapaper. For instance, you will likely need to have your system settings set to light mode for the wallpapers to apply properly.**

The timers will clean themselves up when the extension is disabled and restart when enabled. So it will not change the background while the screen is locked.
