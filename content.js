// This script runs on the webpage (e.g., DriveCentric)

console.log("CRM Polyglot Content Script Active");

document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();

  if (selectedText.length > 0) {
    // Send to the extension runtime (background/sidepanel)
    try {
      chrome.runtime.sendMessage({
        type: 'SELECTED_TEXT',
        text: selectedText
      });
    } catch (e) {
      // Connection might not be established yet if side panel is closed
      console.log('Extension context not ready or sidepanel closed');
    }
  }
});