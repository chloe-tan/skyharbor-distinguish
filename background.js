const TITLE_SUFFIXES = {
  DEV: "[DEV]",
  STAGING: "[STG]",
  PROD: "[PRD]"
}

function updateTitle(suffixTitle) {
  if (!document.title.startsWith(suffixTitle)) { // Prevent multiple updates
    document.title = `${suffixTitle} ${document.title}`;
  }
}

async function modifyTab(tab) {
  // Update suffix title if a dev / stg / prd tab is detected
  let suffixTitle = "";
  if (tab.url.includes("localhost:8889")) {
    console.log("SKYHARBOR DEV");
    suffixTitle = TITLE_SUFFIXES.DEV
  } else if (tab.url.includes("skyharbor.certik.com")) {
    console.log("SKYHARBOR PROD")
    suffixTitle = TITLE_SUFFIXES.PROD
  } else if (tab.url.includes("https://staging.skyharbor.certik.com/") || tab.url.includes("certik.vercel.app")) {
    console.log("SKYHARBOR STAGING/PREVIEW")
    suffixTitle = TITLE_SUFFIXES.STAGING
  }
  
  if (suffixTitle) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: updateTitle,
        args: [suffixTitle]
      },
      (res) => console.log(res)
    );
  }
}

// Init
chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
  for (let i = 0; i < tabs.length; i++) {
    modifyTab(tabs[i]);
  }
});

// Update listener (new tabs, change url, etc)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  modifyTab(tab);
})
