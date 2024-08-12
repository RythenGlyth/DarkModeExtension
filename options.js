chrome.storage.local.get({automode: true}, (items) => {
    document.getElementById("automode").checked = items.automode;
});

document.getElementById("automode").addEventListener("change", (e) => {
    chrome.storage.local.set({automode: document.getElementById("automode").checked});
});

chrome.storage.local.get({pages: {}}, (items) => {
    let elements = Object.entries(items.pages).map(([site, isDark]) => createSiteElement(site, isDark));
    let body = document.getElementById("sites-list-body")
    body.innerHTML = "";
    body.append(...elements);
})

chrome.storage.local.onChanged.addListener((changes, area) => {
    if(changes.pages?.newValue) {
        Object.entries(changes.pages?.newValue).forEach(([site, isDark]) => {
            let rows = Array.from(document.getElementById("sites-list-body").children).filter((node) => node.children[0].innerText == site)
            rows.forEach((node) => {
                node.children[1].querySelector("input.darkswitch").checked = isDark;
            })
            if(rows.length == 0) {
                document.getElementById("sites-list-body").append(createSiteElement(site, isDark));
            }
        })
        Array.from(document.getElementById("sites-list-body").children).filter((node) => !Object.keys(changes.pages.newValue).includes(node.children[0].innerText)).forEach((node) => node.remove());
    }
})

function createSiteElement(site, isDark) {
    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${site}</td>
        <td><label class="switch">
            <input type="checkbox" class="darkswitch" ${isDark ? "checked" : ""}>
            <span class="slider round"></span>
        </label></td>
        <td><span class="close">&times;</span></td>`
    tr.querySelector("input.darkswitch").addEventListener("change", (e) => {
        chrome.storage.local.get({pages: {}}, (items) => {
            items.pages[site] = e.target.checked;
            chrome.storage.local.set({pages: items.pages});
        })
    })
    tr.querySelector("span.close").addEventListener("click", (e) => {
        chrome.storage.local.get({pages: {}}, (items) => {
            delete items.pages[site];
            chrome.storage.local.set({pages: items.pages});
        })
    })
    return tr
}