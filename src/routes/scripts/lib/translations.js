const languages = {}

let defaultLang = null;
const writeLanguage = (name, obj) => {
    if(defaultLang == null) {
        languages[name] = obj;
        defaultLang = languages[name];
    } else {
        if(!recursiveProxy) throw new Error("translations.js depends on recursiveProxy, append the script to the page");
        languages[name] = recursiveProxy(obj, defaultLang);
    }
}

let language;


const startTranslation = (electronStore) => {
    let selected;
    if(electronStore?.selectedLanguage)
        selected = languages[electronStore.selectedLanguage];

    else if (localStorage.selectedLanguage)
        selected = languages[localStorage.selectedLanguage];

    
    const userLanguage = navigator.language;

    const translation =
        selected != undefined ?
            selected :

            languages[userLanguage] ??
            Object.entries(languages)
                .find(([key]) => key.split("-")[0] === userLanguage.split("-")[0])
                ?.[1];

    language = translation || languages["en-US"];

    doDocumentTranslation();
    
}

const selectLanguage = (lang, electronStore) => {
    language = languages[lang];
    if(electronStore)
        electronStore.selectedLanguage = lang;
    else
        localStorage.selectedLanguage = lang;

    doDocumentTranslation();
}
const langFromPath = path => {
    let value = language;

    path = path.split("-");

    for (let i = 0; i < path.length; i++) {
        let v = value[path[i]] != undefined ? value[path[i]] : language.translationnotfound;
        value = v;
    }

    return value;
}
const doDocumentTranslation = (el) => {
    const translateElement = (e) => {
        const types = [
            "title",
            "placeholder",
            "value",
            "innerHTML"
        ]
    
        for (const attr of e.attributes) {
            if (attr.name.startsWith("language")) {
    
                const {name} = attr;
                const first = name.split("-")[1];
                const type = types.includes(first)? first : "innerHTML";
                const path = types.includes(first)? name.split("-").slice(2).join("-") : name.split("-").slice(1).join("-");
                
                const value = langFromPath(path);

                if(type == "value")
                    e.value = value;
                else if(type == "placeholder")
                    e.placeholder = value;
                else if(type == "title")
                    e.title = value;
                else
                    e.innerHTML = value;
            }
        }
    }

    if(el instanceof HTMLElement)
        translateElement(el);
    else
        [...document.querySelectorAll("*")].forEach(translateElement);
}

const setLangPath = (el, path) => el.setAttribute("language-" + path, null);
const setTranslate = (el, path, doreload = true) => {
    el.setAttribute("language-" + path, null);

    if(doreload)
        doDocumentTranslation(el);
}