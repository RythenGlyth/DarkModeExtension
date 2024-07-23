

document.getElementById("switchbox").addEventListener("change", (e) => {
    chrome.tabs.query({active:true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
            messagetype: "set-darkmode-page",
            isDark: document.getElementById("switchbox").checked
        });
    });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.messagetype) {
        case "broadcast-darkmode-page":
            document.getElementById("switchbox").checked = request.isDark;
            break;
    }
});

chrome.tabs.getSelected(null, (tab) => {
    chrome.tabs.sendMessage(tab.id, {
        messagetype: "get-darkmode-page"
    }, response => {
        document.getElementById("switchbox").checked = response.isDark;
    });
});