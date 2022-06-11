'use strict';

const { Adw, Gio, Gtk } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();


function init() {
}

function fillPreferencesWindow(window) {
    // Use the same GSettings schema as in `extension.js`
    const settings = ExtensionUtils.getSettings(
        'org.gnome.shell.extensions.hydra-apply');

    // Create a preferences page and group
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup();
    page.add(group);

    // Create a new preferences row
    const autoRow = new Adw.ActionRow({title: 'Change On Timer'});
    group.add(autoRow);
    const row = new Adw.ActionRow({ title: 'Minutes between change' });
    group.add(row);

    const autoChange = new Gtk.Switch({
        active: settings.get_boolean('auto'),
        valign: Gtk.Align.CENTER,
    });

    // Create the switch and bind its value to the `show-indicator` key
    const secondsToChange = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 1,
            upper: 60,
            step_increment: 1,
        }),
        halign: Gtk.Align.END,
        hexpand: true,
        visible: true
    });
    secondsToChange.connect('value-changed', () =>{
        Me.remakeTimer();
    });
    settings.bind(
        'minutes',
        secondsToChange,
        'value',
        Gio.SettingsBindFlags.DEFAULT
    );
    settings.bind(
        'auto',
        autoChange,
        'state',
        Gio.SettingsBindFlags.DEFAULT
    )

    // Add the switch to the row
    row.add_suffix(secondsToChange);
    row.activatable_widget = secondsToChange;

    autoRow.add_suffix(autoChange);
    autoRow.activatable_widget = autoChange;

    // Add our page to the window
    window.add(page);
}
