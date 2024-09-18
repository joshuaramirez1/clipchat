chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchTranscript") {
    fetch("https://www.toastyai.com/tools/api/get-youtube-transcript", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoUrl: request.videoUrl,
      }),
    })
      .then(response => response.json())
      .then(data => {
        chrome.tabs.sendMessage(sender.tab.id, { action: "transcriptFetched", data: data });
      })
      .catch(error => {
        console.error('Error:', error);
        chrome.tabs.sendMessage(sender.tab.id, { action: "transcriptFetched", data: "1748error" });
      });
  }
});



chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install") {
    chrome.tabs.create({
      url: "guide.html"
    });
  }
});