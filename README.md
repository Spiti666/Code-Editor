Beschreibung des Code-Editors

Der Code-Editor ist eine Webanwendung, die es Benutzern ermöglicht, HTML-, CSS- und JavaScript-Dateien zu erstellen, zu bearbeiten und eine Vorschau der Ergebnisse in Echtzeit zu sehen. Hier ist eine detaillierte Beschreibung der gesamten Seite:

## Allgemeines Layout

Die Anwendung besteht aus einer einzelnen Seite mit einem responsiven Design, das sich an verschiedene Bildschirmgrößen anpasst. Bei größeren Bildschirmen (ab 1024px Breite) werden der Editor und die Vorschau nebeneinander angezeigt, während sie auf kleineren Bildschirmen übereinander angeordnet sind.

## Farbschema und Themes

Die Anwendung bietet zwei Themes:

1. **Tom-Theme**: Ein helles Design mit blauen Akzenten, weißem Hintergrund und dunklem Text
2. **Jerry-Theme**: Ein dunkles Design mit gelben/braunen Akzenten, dunklem Hintergrund und hellem Text


Der Benutzer kann zwischen diesen Themes wechseln, indem er auf die Theme-Schaltfläche klickt, die entweder ein Maus- oder Katzen-Emoji zeigt.

## Hauptkomponenten

### 1. Toolbar (oberer Bereich)

Die Toolbar enthält:

- **Theme-Toggle-Button**: Wechselt zwischen dem hellen und dunklen Theme (Tom/Jerry)
- **Upload-Button**: Ermöglicht das Hochladen von HTML-, CSS- oder JavaScript-Dateien
- **Export-Button**: Ermöglicht das Herunterladen der aktuell geöffneten Datei
- **Dateiname-Eingabefeld**: Ein Textfeld, in das der Benutzer einen neuen Dateinamen eingeben kann
- **Add File-Button**: Erstellt eine neue Datei mit dem eingegebenen Namen


### 2. Datei-Tabs

Unterhalb der Toolbar befindet sich eine horizontale Leiste mit Tabs für jede geöffnete Datei. Jeder Tab zeigt den Dateinamen an und wird hervorgehoben, wenn er aktiv ist. Bei mehr als einer Datei erscheint beim Hover über einem Tab ein Lösch-Button (X), mit dem die Datei gelöscht werden kann.

### 3. Editor-Bereich

Der Editor-Bereich enthält:

- **Undo/Redo-Buttons**: Zum Rückgängigmachen und Wiederherstellen von Änderungen
- **Last Saved-Anzeige**: Zeigt an, wann die Datei zuletzt gespeichert wurde
- **Texteditor**: Ein großes Textarea-Element, in dem der Benutzer Code schreiben kann


### 4. Vorschau-Bereich

Der Vorschau-Bereich enthält:

- **Vorschau-Titel**: Eine Überschrift "Preview"
- **Refresh-Button**: Aktualisiert die Vorschau manuell
- **Fullscreen-Button**: Schaltet die Vorschau in den Vollbildmodus
- **Vorschau-Container**: Ein iframe-Element, das die Vorschau des Codes anzeigt


## Funktionalität

### Dateiverwaltung

1. **Neue Datei erstellen**:

1. Benutzer gibt einen Dateinamen mit Erweiterung (.html, .css oder .js) ein
2. Nach Klick auf "Add File" wird eine neue Datei mit einer Vorlage erstellt
3. Die neue Datei wird automatisch aktiviert



2. **Datei hochladen**:

1. Benutzer kann eine lokale Datei hochladen
2. Wenn bereits eine HTML-Datei existiert und eine neue HTML-Datei hochgeladen wird, wird die bestehende ersetzt
3. Andernfalls wird die hochgeladene Datei als neue Datei hinzugefügt



3. **Datei exportieren**:

1. Die aktuelle Datei kann als Textdatei heruntergeladen werden



4. **Datei löschen**:

1. Dateien können über das X-Symbol im Tab gelöscht werden
2. Es muss immer mindestens eine Datei vorhanden sein





### Editor-Funktionen

1. **Code bearbeiten**:

1. Der Benutzer kann Code im Texteditor schreiben
2. Die Vorschau wird in Echtzeit aktualisiert, während der Benutzer tippt



2. **Undo/Redo**:

1. Änderungen können rückgängig gemacht oder wiederhergestellt werden
2. Die Anwendung speichert einen Verlauf der Änderungen für jede Datei



3. **Automatisches Speichern**:

1. Die Anwendung speichert Änderungen automatisch alle 30 Sekunden im localStorage





### Vorschau-Funktionen

1. **Live-Vorschau**:

1. Die Vorschau wird automatisch aktualisiert, wenn der Code geändert wird
2. HTML-, CSS- und JavaScript-Dateien werden kombiniert, um eine vollständige Webseite zu erstellen



2. **Vollbildmodus**:

1. Die Vorschau kann auf den gesamten Bildschirm erweitert werden
2. Im Vollbildmodus bleibt die Toolbar sichtbar, um zum normalen Modus zurückzukehren



3. **Manuelles Aktualisieren**:

1. Die Vorschau kann manuell über den Refresh-Button aktualisiert werden





## Technische Details

### HTML-Struktur

Die HTML-Struktur besteht aus verschachtelten div-Elementen mit semantischen Klassen:

- Ein Hauptcontainer umschließt die gesamte Anwendung
- Die Toolbar, Tabs, Editor und Vorschau sind in separaten Containern organisiert
- Für die Vorschau wird ein iframe verwendet, um den generierten Code sicher auszuführen


### CSS-Styling

Das CSS verwendet:

- CSS-Variablen für Farben und Themes
- Flexbox für die Toolbar und Tabs
- Grid für das Layout von Editor und Vorschau
- Media Queries für Responsivität
- Transitions und Animationen für flüssige Übergänge


### JavaScript-Funktionalität

Das JavaScript implementiert:

1. **Zustandsverwaltung**:

1. Speichert Dateien, aktive Datei, Theme und andere Zustände
2. Verwaltet den Verlauf für Undo/Redo



2. **Dateioperationen**:

1. Erstellen, Löschen, Hochladen und Exportieren von Dateien
2. Wechseln zwischen Dateien



3. **Editor-Funktionen**:

1. Aktualisieren des Editors basierend auf der aktiven Datei
2. Verarbeiten von Benutzereingaben



4. **Vorschau-Generierung**:

1. Kombinieren von HTML, CSS und JavaScript
2. Aktualisieren des iframe mit dem kombinierten Code



5. **UI-Updates**:

1. Rendern der Datei-Tabs
2. Anzeigen von Fehlermeldungen
3. Aktualisieren der "Last Saved"-Anzeige





## Besonderheiten bei der Implementierung

1. **Vorschau-Generierung**:

1. HTML-Datei dient als Basis
2. CSS wird in ein style-Tag im head-Bereich eingefügt
3. JavaScript wird in ein script-Tag am Ende des body-Bereichs eingefügt
4. Wenn keine HTML-Datei vorhanden ist, wird eine Fehlermeldung angezeigt



2. **Datei-Templates**:

1. Für jede Dateierweiterung (.html, .css, .js) gibt es eine Vorlage
2. Diese Vorlagen werden verwendet, wenn eine neue Datei erstellt wird



3. **Fehlerbehandlung**:

1. Ungültige Dateitypen werden abgelehnt
2. Fehler bei der Vorschau-Generierung werden abgefangen und angezeigt



4. **Responsives Design**:

1. Anpassung an verschiedene Bildschirmgrößen
2. Unterschiedliche Schriftgrößen und Abstände für mobile und Desktop-Ansichten


