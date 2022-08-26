const getStorageData = key =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, result =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  )

document.addEventListener('DOMContentLoaded', async function() {
  const checkbox = document.getElementById('prodModEnabled');

  // Retrieve previous state and set
  const { prodModEnabled } = await getStorageData('prodModEnabled');
  checkbox.checked = prodModEnabled || false; // defaults to false
  // console.log("Retrieved previous state and set", prodModEnabled)

  // Update store when a change in state is detected
  checkbox.addEventListener("change", (event) => {
    const checked = event?.currentTarget?.checked;
    checkbox.checked = checked;
    chrome.storage.sync.set(
      { prodModEnabled: checked }, 
      () => {/* console.log("prodModEnabled updated", checked) */}
    );
  });
});

