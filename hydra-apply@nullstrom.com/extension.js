/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const GETTEXT_DOMAIN = 'my-indicator-extension';

const {GObject, St} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const _ = ExtensionUtils.gettext;
const Gio = imports.gi.Gio;

const randCommand = ['flatpak', 'run', 'org.gabmus.hydrapaper', '-r'];

const serviceCommandStop = ['systemctl', '--user', 'stop', 'nullstrom-hydra-apply.timer'];

const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, _('Hydra-Apply'));

            this.add_child(new St.Icon({
                icon_name: 'media-playlist-shuffle-symbolic',
                style_class: 'system-status-icon',
            }));

            this.settings = ExtensionUtils.getSettings(
                'org.gnome.shell.extensions.hydra-apply');


            let item = new PopupMenu.PopupMenuItem(_('Randomise'));
            let toggle = new PopupMenu.PopupSwitchMenuItem('Auto Change', this.settings.get_boolean('auto'));

            //toggle.setToggleState(this.settings.get_boolean('auto'));
            item.connect('activate', () => {
                randomiseWallpaper();
            });
            toggle.connect('toggled', () => {
                toggleService(toggle.state);
            });
            this.menu.addMenuItem(item);
            this.menu.addMenuItem(toggle);
        }
    });

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this.settings = ExtensionUtils.getSettings(
            'org.gnome.shell.extensions.hydra-apply');
        if(this.settings.get_boolean('auto')===true)
        {
            startTimerSend();
        }
        this._indicator = new Indicator();

        Main.panel.addToStatusArea(this._uuid, this._indicator);

    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;

        stopTimerSend();
    }

    remakeTimer() {
        stopTimerSend();
        startTimerSend();
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}

function randomiseWallpaper() {
    try {
        let randProc = Gio.Subprocess.new(
            randCommand,
            Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
        );
    } catch (e) {
        logError(e);
    }
};

function toggleService(state) {
    this.settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.hydra-apply');
    if (state === true) {
        try {
            startTimerSend();
            this.settings.set_boolean('auto', true);
        } catch (e) {
            this.settings.set_boolean('auto', false);
            logError(e);
        }
    } else {
        try {
            stopTimerSend();
            this.settings.set_boolean('auto', false);
        } catch (e) {
            this.settings.set_boolean('auto', true);
            logError(e);
        }
    }
}

function stopTimerSend() {
    let stopTimer = Gio.Subprocess.new(
        serviceCommandStop,
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
    );
    stopTimer.communicate_utf8_async(null, null, (proc, res) => {
        try {
            let [, stdout, stderr] = stopTimer.communicate_utf8_finish(res);

            if (proc.get_successful()) {
                log(stdout);
            } else {
                throw new Error(stderr);
            }
        } catch (e) {
            logError(e);
        }
    });
}

function startTimerSend() {
    let settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.hydra-apply');
    let minutesToChange = settings.get_int('minutes');

    let serviceCommandStart = ['systemd-run', '--user', '--collect', '--unit=nullstrom-hydra-apply', '--on-calendar',
        '*:0/' + minutesToChange, '/bin/sh', '-c', 'flatpak run org.gabmus.hydrapaper -r'];

    let startTimer = Gio.Subprocess.new(
        serviceCommandStart,
        Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
    );
    startTimer.communicate_utf8_async(null, null, (proc, res) => {
        try {
            let [, stdout, stderr] = startTimer.communicate_utf8_finish(res);

            if (proc.get_successful()) {
                log(stdout);
            } else {
                throw new Error(stderr);
            }
        } catch (e) {
            logError(e);
        }
    });
}