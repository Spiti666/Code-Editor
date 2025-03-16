// Ändern der initialen Dateien, um alle drei Dateitypen von Anfang an zu haben
// State management
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
]
let activeFileId = 1
let theme = "tom" // "tom" or "jerry"
const autoSave = true
let lastSaved = new Date()
let isPreviewFullscreen = false
let previewKey = 0

// DOM Elements
const appContainer = document.getElementById("app")
const mainContainer = document.getElementById("main-container")
const themeToggle = document.getElementById("theme-toggle")
const themeIcon = document.getElementById("theme-icon")
const uploadBtn = document.getElementById("upload-btn")
const fileUpload = document.getElementById("file-upload")
const exportBtn = document.getElementById("export-btn")
const newFileNameInput = document.getElementById("new-file-name")
const addFileBtn = document.getElementById("add-file-btn")
const fileTabs = document.getElementById("file-tabs")
const errorAlert = document.getElementById("error-alert")
const errorMessage = document.getElementById("error-message")
const undoBtn = document.getElementById("undo-btn")
const redoBtn = document.getElementById("redo-btn")
const lastSavedEl = document.getElementById("last-saved")
const editor = document.getElementById("editor")
const refreshPreviewBtn = document.getElementById("refresh-preview-btn")
const fullscreenBtn = document.getElementById("fullscreen-btn")
const previewCard = document.getElementById("preview-card")
const previewContainer = document.getElementById("preview-container")
const previewIframe = document.getElementById("preview-iframe")

// Initialize the app
function init() {
  // Set up event listeners
  themeToggle.addEventListener("click", toggleTheme)
  uploadBtn.addEventListener("click", () => fileUpload.click())
  fileUpload.addEventListener("change", handleFileUpload)
  exportBtn.addEventListener("click", exportFile)
  addFileBtn.addEventListener("click", addFile)
  undoBtn.addEventListener("click", undo)
  redoBtn.addEventListener("click", redo)
  editor.addEventListener("input", handleEditorChange)
  editor.addEventListener("blur", handleEditorBlur)
  refreshPreviewBtn.addEventListener("click", refreshPreview)
  fullscreenBtn.addEventListener("click", toggleFullscreen)
  newFileNameInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addFile()
  })

  // Initialize the UI
  renderFileTabs()
  updateEditor()
  updatePreview()

  // Set up auto-save
  if (autoSave) {
    setInterval(() => {
      const currentFile = getCurrentFile()
      if (currentFile) {
        localStorage.setItem(`editor_${currentFile.id}`, JSON.stringify(currentFile))
        lastSaved = new Date()
        updateLastSaved()
      }
    }, 30000)
  }
}

// Theme functions
function toggleTheme() {
  theme = theme === "tom" ? "jerry" : "tom"
  themeIcon.textContent = theme === "tom" ? "🐭" : "🐱"

  if (theme === "jerry") {
    document.body.classList.add("dark-theme")
  } else {
    document.body.classList.remove("dark-theme")
  }
}

// File operations
function getCurrentFile() {
  return files.find((f) => f.id === activeFileId)
}

function getLanguageTemplate(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase()
  switch (extension) {
    case "html":
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
</head>
<body>
  <h1>Hello World!</h1>
  <p>Edit this HTML file to see changes in the preview.</p>
</body>
</html>`
    case "css":
      return `/* Write your CSS here */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

h1 {
  color: #333;
  text-align: center;
}

p {
  color: #666;
  line-height: 1.6;
}`
    case "js":
      return `// Write your JavaScript here
document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded!');
  
  // Example: Add a click event to all paragraphs
  const paragraphs = document.querySelectorAll('p');
  paragraphs.forEach(p => {
    p.addEventListener('click', () => {
      p.style.color = getRandomColor();
    });
  });
});

// Generate a random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}`
    default:
      return ""
  }
}

function getLanguageFromFileName(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase()
  switch (extension) {
    case "html":
      return { name: "HTML", template: getLanguageTemplate(fileName) }
    case "css":
      return { name: "CSS", template: getLanguageTemplate(fileName) }
    case "js":
      return { name: "JavaScript", template: getLanguageTemplate(fileName) }
    default:
      return null
  }
}

function addFile() {
  const fileName = newFileNameInput.value.trim()

  if (!fileName) {
    showError("Please enter a file name")
    return
  }

  const languageInfo = getLanguageFromFileName(fileName)
  if (!languageInfo) {
    showError("Invalid file type. Please use .html, .css, or .js extension")
    return
  }

  const newId = Math.max(...files.map((f) => f.id)) + 1
  const newFile = {
    id: newId,
    name: fileName,
    language: languageInfo.name.toLowerCase(),
    content: languageInfo.template,
    history: [languageInfo.template],
    historyIndex: 0,
  }

  files.push(newFile)
  activeFileId = newId
  newFileNameInput.value = ""
  hideError()

  renderFileTabs()
  updateEditor()

  // Force preview update
  setTimeout(() => {
    updatePreview()
    refreshIframe()
  }, 100)
}

function deleteFile(id) {
  if (files.length <= 1) return

  files = files.filter((f) => f.id !== id)

  if (activeFileId === id) {
    activeFileId = files[0].id
  }

  renderFileTabs()
  updateEditor()

  // Force preview update
  setTimeout(() => {
    updatePreview()
    refreshIframe()
  }, 100)
}

function switchFile(id) {
  activeFileId = id
  renderFileTabs()
  updateEditor()
  updatePreview()
}

function handleFileUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result
    if (content) {
      const languageInfo = getLanguageFromFileName(file.name)

      if (!languageInfo) {
        showError("Invalid file type. Please upload .html, .css, or .js files")
        return
      }

      // For HTML files, check if we already have an HTML file
      if (file.name.endsWith(".html")) {
        // If we already have an HTML file, replace it
        const existingHtmlFile = files.find((f) => f.name.endsWith(".html"))
        if (existingHtmlFile) {
          files = files.map((f) => {
            if (f.id === existingHtmlFile.id) {
              return {
                ...f,
                name: file.name,
                content: content,
                history: [content],
                historyIndex: 0,
              }
            }
            return f
          })
          activeFileId = existingHtmlFile.id

          renderFileTabs()
          updateEditor()

          // Force preview update with the new content
          setTimeout(() => {
            setPreviewContent(content)
            refreshIframe()
            console.log("HTML file replaced, preview updated")
          }, 50)
          return
        }
      }

      // Add new file
      const newId = Math.max(...files.map((f) => f.id)) + 1
      const newFile = {
        id: newId,
        name: file.name,
        language: languageInfo.name.toLowerCase(),
        content: content,
        history: [content],
        historyIndex: 0,
      }

      files.push(newFile)
      activeFileId = newId
      hideError()

      renderFileTabs()
      updateEditor()

      // For HTML files, directly update the preview
      if (file.name.endsWith(".html")) {
        setTimeout(() => {
          setPreviewContent(content)
          refreshIframe()
          console.log("New HTML file added, preview updated")
        }, 50)
      } else {
        // For CSS and JS files, regenerate the preview
        setTimeout(() => {
          updatePreview()
          refreshIframe()
          console.log("Non-HTML file added, preview updated")
        }, 50)
      }
    }
  }
  reader.readAsText(file)

  // Reset the file input so the same file can be uploaded again
  event.target.value = ""
}

function exportFile() {
  const file = getCurrentFile()
  if (!file) return

  const blob = new Blob([file.content], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = file.name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Editor functions
function updateEditor() {
  const currentFile = getCurrentFile()
  if (currentFile) {
    editor.value = currentFile.content
  } else {
    editor.value = ""
  }
}

function handleEditorChange(e) {
  const newContent = e.target.value
  updateFileContent(newContent)
  updatePreview(newContent)
}

function handleEditorBlur(e) {
  const currentFile = getCurrentFile()
  if (currentFile && e.target.value !== currentFile.history[currentFile.historyIndex]) {
    updateFileContent(e.target.value, true)
  }
}

function updateFileContent(newContent, addToHistory = false) {
  files = files.map((f) => {
    if (f.id === activeFileId) {
      const newFile = { ...f, content: newContent }
      if (addToHistory) {
        newFile.history = [...f.history.slice(0, f.historyIndex + 1), newContent]
        newFile.historyIndex = f.historyIndex + 1
      }
      return newFile
    }
    return f
  })
}

function undo() {
  const currentFile = getCurrentFile()
  if (!currentFile || currentFile.historyIndex <= 0) return

  files = files.map((f) => {
    if (f.id === activeFileId) {
      const newContent = f.history[f.historyIndex - 1]
      return {
        ...f,
        content: newContent,
        historyIndex: f.historyIndex - 1,
      }
    }
    return f
  })

  updateEditor()
  updatePreview()
}

function redo() {
  const currentFile = getCurrentFile()
  if (!currentFile || currentFile.historyIndex >= currentFile.history.length - 1) return

  files = files.map((f) => {
    if (f.id === activeFileId) {
      const newContent = f.history[f.historyIndex + 1]
      return {
        ...f,
        content: newContent,
        historyIndex: f.historyIndex + 1,
      }
    }
    return f
  })

  updateEditor()
  updatePreview()
}

// Preview functions
function updatePreview(currentContent = null) {
  try {
    // Get all files
    const htmlFiles = files.filter((f) => f.name.endsWith(".html"))
    const cssFiles = files.filter((f) => f.name.endsWith(".css"))
    const jsFiles = files.filter((f) => f.name.endsWith(".js"))

    // If no HTML file, show error
    if (htmlFiles.length === 0) {
      setPreviewContent(
        "<div style='padding: 20px; color: red;'>No HTML file found. Create an index.html file to see the preview.</div>",
      )
      return
    }

    // Get the main HTML file (first one)
    const htmlFile = htmlFiles[0]

    // Get current file being edited
    const currentFile = getCurrentFile()

    // Determine if we should use the current content
    let htmlContent = htmlFile.content
    if (currentContent && currentFile && currentFile.id === htmlFile.id) {
      htmlContent = currentContent
    }

    // Collect all CSS
    let cssContent = ""
    cssFiles.forEach((cssFile) => {
      if (currentContent && currentFile && currentFile.id === cssFile.id) {
        cssContent += currentContent + "\n"
      } else {
        cssContent += cssFile.content + "\n"
      }
    })

    // Collect all JS
    let jsContent = ""
    jsFiles.forEach((jsFile) => {
      if (currentContent && currentFile && currentFile.id === jsFile.id) {
        jsContent += currentContent + "\n"
      } else {
        jsContent += jsFile.content + "\n"
      }
    })

    // Create a complete HTML document
    let fullHtml = htmlContent

    // Add CSS if needed
    if (cssContent) {
      // Check if there's a head tag
      if (fullHtml.includes("</head>")) {
        fullHtml = fullHtml.replace("</head>", `<style>${cssContent}</style></head>`)
      } else if (fullHtml.includes("<body")) {
        // Insert before body
        const bodyIndex = fullHtml.indexOf("<body")
        fullHtml = fullHtml.slice(0, bodyIndex) + `<style>${cssContent}</style>` + fullHtml.slice(bodyIndex)
      } else {
        // Just prepend
        fullHtml = `<style>${cssContent}</style>${fullHtml}`
      }
    }

    // Add JS if needed
    if (jsContent) {
      // Check if there's a body end tag
      if (fullHtml.includes("</body>")) {
        fullHtml = fullHtml.replace("</body>", `<script>${jsContent}</script></body>`)
      } else {
        // Just append
        fullHtml = `${fullHtml}<script>${jsContent}</script>`
      }
    }

    // Set the preview
    setPreviewContent(fullHtml)

    console.log("Preview updated with:", {
      htmlLength: htmlContent.length,
      cssLength: cssContent.length,
      jsLength: jsContent.length,
    })
  } catch (err) {
    console.error("Preview error:", err)
    setPreviewContent(`<div style='padding: 20px; color: red;'>Error generating preview: ${err.message}</div>`)
  }
}

function setPreviewContent(content) {
  previewIframe.srcdoc = content
}

function refreshIframe() {
  previewKey++
  previewIframe.src = "about:blank"
  setTimeout(() => {
    previewIframe.srcdoc = previewIframe.srcdoc
  }, 10)
}

function refreshPreview() {
  updatePreview()
  refreshIframe()
}

function toggleFullscreen() {
  isPreviewFullscreen = !isPreviewFullscreen

  if (isPreviewFullscreen) {
    previewCard.classList.add("fullscreen")
    fullscreenBtn.textContent = "Exit Fullscreen"
  } else {
    previewCard.classList.remove("fullscreen")
    fullscreenBtn.textContent = "Fullscreen"
  }
}

// UI functions
function renderFileTabs() {
  fileTabs.innerHTML = ""

  files.forEach((file) => {
    const fileTab = document.createElement("div")
    fileTab.className = "file-tab"

    const fileTabBtn = document.createElement("button")
    fileTabBtn.className = `file-tab-btn ${file.id === activeFileId ? "active" : ""}`
    fileTabBtn.textContent = file.name
    fileTabBtn.addEventListener("click", () => switchFile(file.id))

    fileTab.appendChild(fileTabBtn)

    if (files.length > 1) {
      const deleteTabBtn = document.createElement("button")
      deleteTabBtn.className = "delete-tab-btn"
      deleteTabBtn.textContent = "✕"
      deleteTabBtn.addEventListener("click", () => deleteFile(file.id))

      fileTab.appendChild(deleteTabBtn)
    }

    fileTabs.appendChild(fileTab)
  })
}

function updateLastSaved() {
  lastSavedEl.textContent = `Last saved: ${lastSaved.toLocaleTimeString()}`
}

function showError(message) {
  errorMessage.textContent = message
  errorAlert.classList.remove("hidden")
}

function hideError() {
  errorAlert.classList.add("hidden")
}

// Initialize the app when the DOM is loaded
document.addEventListener("DOMContentLoaded", init)

