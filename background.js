const TITLE_PREFIXES = {
  DEV: "[DEV]",
  STAGING: "[STG]",
  PROD: "[PRD]"
}

// Public image links currently hosted on my gdrive @_@
// TODO: Better quality icos / svgs :")
const FAVICON_URLS = { 
  DEV: "https://drive.google.com/uc?id=1E96Gq8dqpvB_HbHJ2EUX47Ma_dthKcoW",
  STAGING: "https://drive.google.com/uc?id=1te1SWMKhGai7HKymdVWq9eGI7C4n3uBq",
  PROD: "https://drive.google.com/uc?id=1joZcU78W7ARpbKZUXJdgJCeqijmxnB2N",
}

const getStorageData = key =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, result =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  )

function updateTitleAndFavicon(prefixTitle, faviconUrl) {
  // Update title
  if (!document.title.startsWith(prefixTitle)) { // Prevent multiple updates
    document.title = `${prefixTitle} ${document.title}`;
  }
  // Update favicon
  let link = document.querySelector("link[rel~='icon']");
  link.href = faviconUrl;
}

async function modifyTab(tab) {
  // Update prefix title if a dev / stg / prd tab is detected
  let prefixTitle = "";
  let faviconUrl = "";
  if (tab.url.includes("localhost:8889")) {
    // Dev
    prefixTitle = TITLE_PREFIXES.DEV;
    faviconUrl = FAVICON_URLS.DEV;
  } else if (tab.url.includes("staging.skyharbor.certik.com") || tab.url.includes("certik.vercel.app")) {
    // Staging or Preview
    prefixTitle = TITLE_PREFIXES.STAGING;
    faviconUrl = FAVICON_URLS.STAGING;
  } else if (tab.url.includes("skyharbor.certik.com")) {
    // Prod. Only modify if user enables "Modify prod tabs".
    const { prodModEnabled } = await getStorageData('prodModEnabled')
    if (prodModEnabled) {
      // console.log("Modifying prod tab");
      prefixTitle = TITLE_PREFIXES.PROD;
      faviconUrl = FAVICON_URLS.PROD;
    } else if (!prodModEnabled && tab.title.startsWith(TITLE_PREFIXES.PROD)) {
      // Previously modded prod tab - force a reload to get back default title and favicon
      chrome.tabs.reload(tab.id, { bypassCache: true }, () => {/* do nothing for now*/} )
    }
  } 
  

  // Update title and favicon
  if (prefixTitle && faviconUrl) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        func: updateTitleAndFavicon,
        args: [prefixTitle, faviconUrl]
      },
      (res) => { /* do nothing for now */ }
    );
  }
}

// Init
chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
  for (let i = 0; i < tabs.length; i++) {
    modifyTab(tabs[i]);
  }
});

// Listener for tab updates (new tabs, change url, etc)
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  modifyTab(tab);
});

// Listener for storage changes - modify tabs accordingly
chrome.storage.onChanged.addListener(function (changes, namespace) {
  chrome.tabs.query({windowId: chrome.windows.WINDOW_ID_CURRENT}, (tabs) => {
    for (let i = 0; i < tabs.length; i++) {
      modifyTab(tabs[i]);
    }
  });
});

