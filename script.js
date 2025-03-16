"use strict";

// Standard-Dateien – index.html, style.css, script.js
let files = [
  {
    id: 1,
    name: "index.html",
    language: "html",
    content: getLanguageTemplate("index.html"),
    history: [getLanguageTemplate("index.html")],
    historyIndex: 0,
  },
  {
    id: 2,
    name: "style.css",
    language: "css",
    content: getLanguageTemplate("style.css"),
    history: [getLanguageTemplate("style.css")],
    historyIndex: 0,
  },
  {
    id: 3,
    name: "script.js",
    language: "javascript",
    content: getLanguageTemplate("script.js"),
    history: [getLanguageTemplate("script.js")],
    historyIndex: 0,
  },
];

let activeFileId = 1;
let theme = "tom"; // "tom" oder "jerry"
const autoSave = true;
let lastSaved = new Date();
let isPreviewFullscreen = false;

// DOM-Elemente
const themeToggle = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");
const uploadBtn = document.getElementById("upload-btn");
const fileUpload = document.getElementById("file-upload");
const exportBtn = document.getElementById("export-btn");
const newFileNameInput = document.getElementById("new-file-name");
const addFileBtn = document.getElementById("add-file-btn");
const fileTabs = document.getElementById("file-tabs");
const errorAlert = document.getElementById("error-alert");
const errorMessage = document.getElementById("error-message");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");
const lastSavedEl = document.getElementById("last-saved");
const refreshPreviewBtn = document.getElementById("refresh-preview-btn");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const previewCard = document.getElementById("preview-card");
const previewIframe = document.getElementById("preview-iframe");
const editorTextarea = document.getElementById("editor");
const toastContainer = document.getElementById("toast-container");

// Debounce-Funktion für Eingaben
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// Initialisierung beim Laden des DOM
document.addEventListener("DOMContentLoaded", init);

function init() {
  // Systembasierten Dark Mode ermitteln, falls keine manuelle Einstellung vorliegt
  if (!localStorage.getItem("theme")) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = "jerry";
      document.body.classList.add("dark-theme");
      themeIcon.textContent = "🐱";
    }
  } else {
    theme = localStorage.getItem("theme");
    if (theme === "jerry") {
      document.body.classList.add("dark-theme");
      themeIcon.textContent = "🐱";
    } else {
      document.body.classList.remove("dark-theme");
      themeIcon.textContent = "🐭";
    }
  }

  setupEventListeners();
  renderFileTabs();
  updateEditor();
  updatePreview();

  // Auto-Save alle 30 Sekunden
  if (autoSave) {
    setInterval(autoSaveCurrentFile, 30000);
  }

  // Globale Tastenkombinationen einrichten
  setupGlobalShortcuts();
}

// Event Listener registrieren
function setupEventListeners() {
  themeToggle.addEventListener("click", toggleTheme);
  uploadBtn.addEventListener("click", () => fileUpload.click());
  fileUpload.addEventListener("change", handleFileUpload);
  exportBtn.addEventListener("click", () => {
    exportFile();
    showToast("Datei exportiert", "success");
  });
  addFileBtn.addEventListener("click", addFile);
  undoBtn.addEventListener("click", undo);
  redoBtn.addEventListener("click", redo);
  refreshPreviewBtn.addEventListener("click", () => {
    refreshPreview();
    showToast("Vorschau aktualisiert", "info");
  });
  fullscreenBtn.addEventListener("click", toggleFullscreen);
  newFileNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addFile();
  });
  // Eingaben im Textarea mit Debounce verarbeiten
  editorTextarea.addEventListener("input", debounce(handleEditorChange, 300));
  editorTextarea.addEventListener("blur", handleEditorBlur);
}

// Globale Tastenkombinationen
function setupGlobalShortcuts() {
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case "s": // Speichern
          e.preventDefault();
          autoSaveCurrentFile();
          showToast("Datei gespeichert", "success");
          break;
        case "z": // Undo
          e.preventDefault();
          undo();
          showToast("Undo", "info");
          break;
        case "y": // Redo (alternativ)
          e.preventDefault();
          redo();
          showToast("Redo", "info");
          break;
      }
      // Dateien wechseln per Ctrl+1, Ctrl+2, ...
      if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key, 10) - 1;
        if (files[index]) {
          switchFile(files[index].id);
          showToast(`Datei ${files[index].name} ausgewählt`, "info");
        }
      }
    }
  });
}

// Auto-Save-Funktion
function autoSaveCurrentFile() {
  const currentFile = getCurrentFile();
  if (currentFile) {
    localStorage.setItem(`editor_${currentFile.id}`, JSON.stringify(currentFile));
    lastSaved = new Date();
    updateLastSaved();
  }
}

// Theme umschalten und speichern
function toggleTheme() {
  theme = theme === "tom" ? "jerry" : "tom";
  if (theme === "jerry") {
    document.body.classList.add("dark-theme");
    themeIcon.textContent = "🐱";
  } else {
    document.body.classList.remove("dark-theme");
    themeIcon.textContent = "🐭";
  }
  localStorage.setItem("theme", theme);
}

// Aktuelle Datei holen
function getCurrentFile() {
  return files.find((f) => f.id === activeFileId);
}

// Standard-Inhalt basierend auf Dateityp (angepasst für einen moderneren Start)
function getLanguageTemplate(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "html":
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>My Cool Project</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header>
    <h1>Welcome to My Cool Project</h1>
  </header>
  <main>
    <p>Start editing your HTML, CSS, and JS to see the magic!</p>
  </main>
</body>
</html>`;
    case "css":
      return `/* Default CSS for a modern look */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  background: #f0f2f5;
  color: #333;
}

header {
  background: #2563eb;
  color: #fff;
  padding: 20px;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 2.5rem;
}

main {
  padding: 20px;
  text-align: center;
}

p {
  font-size: 1.125rem;
  line-height: 1.6;
}`;
    case "js":
      return `// Default JavaScript for interactivity
document.addEventListener('DOMContentLoaded', () => {
  console.log('Welcome to My Cool Project!');
  
  // When clicking on the header, change its background color randomly.
  const header = document.querySelector('header');
  if (header) {
    header.addEventListener('click', () => {
      header.style.backgroundColor = getRandomColor();
      console.log('Header color changed to', header.style.backgroundColor);
    });
  }
});

// Function to generate a random hex color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}`;
    default:
      return "";
  }
}

function getLanguageFromFileName(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "html":
      return { name: "HTML", template: getLanguageTemplate(fileName) };
    case "css":
      return { name: "CSS", template: getLanguageTemplate(fileName) };
    case "js":
      return { name: "JavaScript", template: getLanguageTemplate(fileName) };
    default:
      return null;
  }
}

// Neue Datei hinzufügen (über Upload, ohne Drag & Drop)
function addFile() {
  const fileName = newFileNameInput.value.trim();
  if (!fileName) {
    showToast("Bitte Dateinamen eingeben", "error");
    return;
  }
  const languageInfo = getLanguageFromFileName(fileName);
  if (!languageInfo) {
    showToast("Ungültiger Dateityp (nur .html, .css, .js erlaubt)", "error");
    return;
  }
  const newId = files.length ? Math.max(...files.map((f) => f.id)) + 1 : 1;
  const newFile = {
    id: newId,
    name: fileName,
    language: languageInfo.name.toLowerCase(),
    content: languageInfo.template,
    history: [languageInfo.template],
    historyIndex: 0,
  };
  files.push(newFile);
  // activeFileId bleibt unverändert, sodass der aktuell bearbeitete File erhalten bleibt.
  renderFileTabs();
  updateEditor();
  updatePreview();
  showToast(`Datei ${fileName} hinzugefügt`, "success");
}

// Datei löschen
function deleteFile(id) {
  if (files.length <= 1) return;
  files = files.filter((f) => f.id !== id);
  if (activeFileId === id) {
    activeFileId = files[0].id;
  }
  renderFileTabs();
  updateEditor();
  updatePreview();
  showToast("Datei gelöscht", "info");
}

// Zwischen Dateien wechseln
function switchFile(id) {
  activeFileId = id;
  renderFileTabs();
  updateEditor();
  updatePreview();
  const current = getCurrentFile();
  if (current) showToast(`Datei ${current.name} ausgewählt`, "info");
}

// Datei-Upload (nur über Upload-Button)
function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result;
    if (content) {
      const languageInfo = getLanguageFromFileName(file.name);
      if (!languageInfo) {
        showToast("Ungültiger Dateityp beim Upload", "error");
        return;
      }
      // Falls HTML: vorhandene HTML-Datei ersetzen
      if (file.name.endsWith(".html")) {
        const existingHtmlFile = files.find((f) => f.name.endsWith(".html"));
        if (existingHtmlFile) {
          files = files.map((f) => {
            if (f.id === existingHtmlFile.id) {
              return {
                ...f,
                name: file.name,
                content: content,
                history: [content],
                historyIndex: 0,
              };
            }
            return f;
          });
          // activeFileId bleibt, wenn bereits diese Datei aktiv ist.
          renderFileTabs();
          updateEditor();
          setPreviewContent(content);
          refreshIframe();
          showToast("HTML-Datei ersetzt", "success");
          return;
        }
      }
      // Neue Datei hinzufügen – activeFileId wird NICHT überschrieben.
      const newId = files.length ? Math.max(...files.map((f) => f.id)) + 1 : 1;
      const newFile = {
        id: newId,
        name: file.name,
        language: languageInfo.name.toLowerCase(),
        content: content,
        history: [content],
        historyIndex: 0,
      };
      files.push(newFile);
      renderFileTabs();
      updateEditor();
      if (file.name.endsWith(".html")) {
        setPreviewContent(content);
        refreshIframe();
      } else {
        updatePreview();
        refreshIframe();
      }
      showToast(`Datei ${file.name} hochgeladen`, "success");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

// Export der aktuellen Datei
function exportFile() {
  const file = getCurrentFile();
  if (!file) return;
  const blob = new Blob([file.content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Datei exportiert", "success");
}

// Editor aktualisieren: textarea füllen
function updateEditor() {
  const currentFile = getCurrentFile();
  if (currentFile) {
    editorTextarea.value = currentFile.content;
  } else {
    editorTextarea.value = "";
  }
}

// Beim Tippen im Editor
function handleEditorChange() {
  const newContent = editorTextarea.value;
  updateFileContent(newContent);
  updatePreview(newContent);
}

// Beim Verlassen des Editors
function handleEditorBlur() {
  const currentFile = getCurrentFile();
  if (currentFile && editorTextarea.value !== currentFile.history[currentFile.historyIndex]) {
    updateFileContent(editorTextarea.value, true);
  }
}

// Aktualisiert den Inhalt und (optional) die History
function updateFileContent(newContent, addToHistory = false) {
  files = files.map((f) => {
    if (f.id === activeFileId) {
      const newFile = { ...f, content: newContent };
      if (addToHistory) {
        newFile.history = [...f.history.slice(0, f.historyIndex + 1), newContent];
        newFile.historyIndex = f.historyIndex + 1;
      }
      return newFile;
    }
    return f;
  });
}

// Undo-Funktion
function undo() {
  const currentFile = getCurrentFile();
  if (!currentFile || currentFile.historyIndex <= 0) return;
  files = files.map((f) => {
    if (f.id === activeFileId) {
      const newContent = f.history[f.historyIndex - 1];
      return {
        ...f,
        content: newContent,
        historyIndex: f.historyIndex - 1,
      };
    }
    return f;
  });
  updateEditor();
  updatePreview();
}

// Redo-Funktion
function redo() {
  const currentFile = getCurrentFile();
  if (!currentFile || currentFile.historyIndex >= currentFile.history.length - 1) return;
  files = files.map((f) => {
    if (f.id === activeFileId) {
      const newContent = f.history[f.historyIndex + 1];
      return {
        ...f,
        content: newContent,
        historyIndex: f.historyIndex + 1,
      };
    }
    return f;
  });
  updateEditor();
  updatePreview();
}

// Vorschau aktualisieren: HTML, CSS und JS zusammenführen
function updatePreview(currentContent = null) {
  try {
    const htmlFiles = files.filter((f) => f.name.endsWith(".html"));
    const cssFiles = files.filter((f) => f.name.endsWith(".css"));
    const jsFiles = files.filter((f) => f.name.endsWith(".js"));

    if (htmlFiles.length === 0) {
      setPreviewContent("<div style='padding: 20px; color: red;'>Keine HTML-Datei gefunden. Bitte erstelle eine index.html.</div>");
      return;
    }
    const htmlFile = htmlFiles[0];
    const currentFile = getCurrentFile();
    let htmlContent = htmlFile.content;
    if (currentContent && currentFile && currentFile.id === htmlFile.id) {
      htmlContent = currentContent;
    }
    let cssContent = "";
    cssFiles.forEach((cssFile) => {
      if (currentContent && currentFile && currentFile.id === cssFile.id) {
        cssContent += currentContent + "\n";
      } else {
        cssContent += cssFile.content + "\n";
      }
    });
    let jsContent = "";
    jsFiles.forEach((jsFile) => {
      if (currentContent && currentFile && currentFile.id === jsFile.id) {
        jsContent += currentContent + "\n";
      } else {
        jsContent += jsFile.content + "\n";
      }
    });

    let fullHtml = htmlContent;
    if (cssContent) {
      if (fullHtml.includes("</head>")) {
        fullHtml = fullHtml.replace("</head>", `<style>${cssContent}</style></head>`);
      } else if (fullHtml.includes("<body")) {
        const bodyIndex = fullHtml.indexOf("<body");
        fullHtml = fullHtml.slice(0, bodyIndex) + `<style>${cssContent}</style>` + fullHtml.slice(bodyIndex);
      } else {
        fullHtml = `<style>${cssContent}</style>${fullHtml}`;
      }
    }
    if (jsContent) {
      if (fullHtml.includes("</body>")) {
        fullHtml = fullHtml.replace("</body>", `<script>${jsContent}</script></body>`);
      } else {
        fullHtml = `${fullHtml}<script>${jsContent}</script>`;
      }
    }
    setPreviewContent(fullHtml);
  } catch (err) {
    console.error("Preview error:", err);
    setPreviewContent(`<div style='padding: 20px; color: red;'>Fehler in der Vorschau: ${err.message}</div>`);
  }
}

// Setzt den Inhalt im Iframe
function setPreviewContent(content) {
  previewIframe.srcdoc = content;
}

// Erzwingt ein kurzes Neuladen des Iframes
function refreshIframe() {
  previewIframe.src = "about:blank";
  setTimeout(() => {
    previewIframe.srcdoc = previewIframe.srcdoc;
  }, 10);
}

// Manuelles Aktualisieren der Vorschau
function refreshPreview() {
  updatePreview();
  refreshIframe();
}

// Fullscreen für die Vorschau umschalten
function toggleFullscreen() {
  isPreviewFullscreen = !isPreviewFullscreen;
  if (isPreviewFullscreen) {
    previewCard.classList.add("fullscreen");
    fullscreenBtn.textContent = "Exit Fullscreen";
  } else {
    previewCard.classList.remove("fullscreen");
    fullscreenBtn.textContent = "Fullscreen";
  }
}

// Rendert die Datei-Tabs
function renderFileTabs() {
  fileTabs.innerHTML = "";
  files.forEach((file) => {
    const fileTab = document.createElement("div");
    fileTab.className = "file-tab";
    const fileTabBtn = document.createElement("button");
    fileTabBtn.className = `file-tab-btn ${file.id === activeFileId ? "active" : ""}`;
    fileTabBtn.textContent = file.name;
    fileTabBtn.addEventListener("click", () => switchFile(file.id));
    fileTab.appendChild(fileTabBtn);
    if (files.length > 1) {
      const deleteTabBtn = document.createElement("button");
      deleteTabBtn.className = "delete-tab-btn";
      deleteTabBtn.textContent = "✕";
      deleteTabBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteFile(file.id);
      });
      fileTab.appendChild(deleteTabBtn);
    }
    fileTabs.appendChild(fileTab);
  });
}

// Aktualisiert den "Last saved" Text
function updateLastSaved() {
  lastSavedEl.textContent = `Last saved: ${lastSaved.toLocaleTimeString()}`;
}

// Toast-Nachricht anzeigen
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toastContainer.contains(toast)) {
      toastContainer.removeChild(toast);
    }
  }, 3000);
}
