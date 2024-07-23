chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        "title": "Invert Element",
        "id": "0",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "title": "Invert Page",
        "id": "1",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "title": "Options",
        "id": "2",
        "contexts": ["all"]
    })
});

chrome.contextMenus.onClicked.addListener((e, tab) => {
    switch(e.menuItemId) {
        case "0":
            chrome.tabs.sendMessage(tab.id, {
                messagetype: "switch-darkmode-element"
            });
            break;
        case "1":
            chrome.tabs.sendMessage(tab.id, {
                messagetype: "switch-darkmode-page"
            });
            break;
        case "2":
            chrome.runtime.openOptionsPage();
            break
    }
});

chrome.commands.onCommand.addListener((command) => {
    if(command == "switch-darkmode-page") {
        chrome.tabs.query({active:true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                messagetype: "switch-darkmode-page"
            });
        });
    }
});
/*chrome.tabs.onUpdated.addListener((tabid, info, tab) => {
    console.log(info);
    console.log(tab);
    if(info.status == "loading") {
        chrome.tabs.executeScript(tabid, {file:"content.js"})
        chrome.tabs.insertCSS(tabid, {file:"style.css"})
    }
})*/