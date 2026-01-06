// Allows users to open the side panel by clicking the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Optional: specific logic for DriveCentric can be added here
chrome.runtime.onInstalled.addListener(() => {
  console.log("CRM Polyglot Assistant Installed");
});