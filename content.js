chrome.storage.sync.get({switchbox: true}, (items) => {
    chrome.storage.sync.get({pages: {}}, items => {
        if(items.pages[window.location.origin] == true) {
            setDark(true);
        } else if (items.pages[window.location.origin] == false) {
            setDark(false);
        } else if(!items.switchbox) { //set to automatically
	        if(document.querySelector("body")) tryAuto()
            else window.addEventListener("load", tryAuto)
        }
    });
});

function tryAuto(save=false) {
    let htmlBack = getComputedStyle(document.querySelector("html")).backgroundColor;
    let bodyBack = getComputedStyle(document.querySelector("body")).backgroundColor;
    autoEnableDarkmode(
        colorNull(htmlBack) ? bodyBack : htmlBack,
        save
    );
    if(!save) {
        setTimeout(() => {
            tryAuto(true) //recheck after 500ms
        }, 500);
    }
}

function colorNull(color) {
    if (color.match(/^rgba?/)) {
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        return color[1] == 0 && color[2] == 0 && color[3] == 0 && (color[4] == 0);
    } else {
        return false;
    }
}

function autoEnableDarkmode(color, save=true) {
    let red, green, blue;
    
    if (color.match(/^rgba?/)) {
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        
        red = color[1];
        green = color[2];
        blue = color[3];

        if(color[4]) {
            red = red*color[4] + 255*(1-color[4])
            green = green*color[4] + 255*(1-color[4])
            blue = blue*color[4] + 255*(1-color[4])
        }
    } else {
	    color = color.slice(1)
	    if (color.length < 5) color = color.replace(/./g, '$&$&')
        color = parseInt(color, 16)

        red = color >> 16;
        green = color >> 8 & 255;
        blue = color & 255;
    }

    
    // HSP ( http://alienryderflex.com/hsp.html )
    let hsp = Math.sqrt(
        0.299 * (red**2) +
        0.587 * (green**2) +
        0.114 * (blue**2)
    );
    if (hsp > 127.5) {
        setDark(true, save);
    } else {
        setDark(false, false);
    }
}

function toggle() {
    setDark(!document.querySelector("html").classList.contains("darkmodeextensionhtml"));
}

function setDark(isDark, save=true) {
    if(isDark) {
        document.querySelector("html").classList.add("darkmodeextensionhtml");
    } else {
        document.querySelector("html").classList.remove("darkmodeextensionhtml");
    }
    //chrome.runtime.sendMessage({messagetype: "broadcast-darkmode-page", isDark});
    if(save) {
        chrome.storage.sync.get({pages: {}}, items => {
            items.pages[window.location.origin] = isDark;
            chrome.storage.sync.set({pages: items.pages});
        });
    }
}

chrome.storage.sync.onChanged.addListener((changes, area) => {
    if(changes.pages?.newValue) {
        if(changes.pages.newValue[window.location.origin] == true) {
            if(document.querySelector("html").classList.contains("darkmodeextensionhtml")) return;
            setDark(true);
        } else if (changes.pages.newValue[window.location.origin] == false) {
            if(!document.querySelector("html").classList.contains("darkmodeextensionhtml")) return;
            setDark(false);
        }
    }
})


var clickedElement;

document.addEventListener("mousedown", (event) => {
  clickedElement = event.target;
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.messagetype) {
        case "switch-darkmode-element":
            clickedElement.classList.toggle("darkmodeextensioninvert");
            break;
        case "switch-darkmode-page":
            toggle();
            break;
        case "get-darkmode-page":
            sendResponse({isDark: document.querySelector("html").classList.contains("darkmodeextensionhtml")})
            break;
        case "set-darkmode-page":
            setDark(request.isDark);
            break;
    }
});