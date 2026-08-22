const languages = {
    "en-US": { // default
        name: "English (United States)",
        translationnotfound: "~translation not found~",
        bottombuttons: {
            setlook: {
                top: "view from above",
                bottom: "view from below",
                left: "view from left",
                right: "view from right",
                front: "view from front",
                back: "view from back"
            },
            defaultcamera: {
                position: "position",
                orientation: "orientation",
                zoom: "zoom",
                perspective: "perspective",
                all: "reset camera"
            },
            setperspective: {
                perspective: "change to perspective camera",
                orthographic: "change to orthographic camera"
            },
            edges: {
                show: "show edges",
                hide: "hide edges"
            },
            logs: {
                button: "logs",
                title: "Runtime records",
                clear: "clear records"
            }
        },
        filemenu: {
            options: {
                new: "new file",
                open: "open file",
                import: "import resource",
                export: "export resource",
                unload: "unload file",
                reload: "reload application",
                fullscreen: "fullscreen",
                setlanguage: "set language",
                notes: "update notes",
                github: "SpaceCAD GitHub",
            },
            fileoperations: {
                openInEditor: "open in editor",
                openInExplorer: "open in explorer",
                rename: "rename",
            }
        },
        modal: {
            translate: {
                title: "Select a Language",
                cancel: "cancel",
                alert: {
                    pleaseReload: "some changes require an application reload\noption -> reload application",
                }
            },
            newfile: {
                title: "New OpenCAD",
                name: "File Name",
                nameplaceholder: "file name",
                dir: "Directory",
                dirplaceholder: "e.g. C:\\Users\\user\\Desktop",
                confirm: "create",
                cancel: "cancel",
                alert: {
                    invalidName: "invalid file name",
                    noDir: "select a directory"
                }
            },
            rename: {
                title: "Rename File",
                renaming: "Renaming",
                confirm: "rename",
                placeholder: "new name",
                cancel: "cancel",
                alert: {
                    invalidName: "invalid file name",
                    sameName: "same name as the previous one"
                }
            },

            importresources: {
                title: "Import Resources",
                pathplaceholder: "e.g. C:\\Users\\user\\Desktop\\spacecad.resources.json",
                select: "select file",
                selecttypetext: "importing the following resources:",
                libs: "libraries",
                modules: "modules",
                overwrite: "overwrite all resources",
                overwritetext: "if selected, your resources will be deleted and the new ones added.",
                confirm: "import",
                cancel: "cancel",
                alert: {
                    noPath: "select a file",
                    noType: "no resource type selected"
                }
            },
            shareresources: {
                title: "Export Resources",
                libs: "export libraries",
                modules: "export modules",
                confirm: "export",
                cancel: "cancel",
                alert: {
                    noType: "no resource type selected"
                }
            },
            changelog: {
                todo: "To Do",
                lastupdates: "Last Updates",
            },
        },
    },
}
languages["pt-BR"] = recursiveProxy({
    name: "Português (Brasil)",
    translationnotfound: "~tradução não encontrada~",
    bottombuttons: {
        setlook: {
            top: "ver de cima",
            bottom: "ver de baixo",
            left: "ver da esquerda",
            right: "ver da direita",
            front: "ver da frente",
            back: "ver de trás"
        },
        defaultcamera: {
            position: "posição",
            orientation: "orientação",
            zoom: "zoom",
            perspective: "perspectiva",
            all: "redefinir camera"
        },
        setperspective: {
            perspective: "mudar para camera perspectiva",
            orthographic: "mudar para camera ortogonal"
        },
        edges: {
            show: "acentuar arestas",
            hide: "esconder arestas"
        },
        logs: {
            button: "registros",
            title: "Registros de Execução",
            clear: "limpar registros"
        }
    },
    filemenu: {
        options: {
            new: "novo arquivo",
            open: "abrir arquivo",
            import: "importar recurso",
            export: "exportar recurso",
            unload: "descarregar arquivo",
            reload: "recarregar aplicação",
            fullscreen: "tela cheia",
            setlanguage: "set language ~ definir idioma",
            notes: "notas da atualização",
            github: "SpaceCAD GitHub",
        },
        fileoperations: {
            openInEditor: "abrir no editor",
            openInExplorer: "abrir no explorador",
            rename: "renomear",
        }
    },
    modal: {
        translate: {
            title: "Selecione um Idioma",
            cancel: "cancelar",
            alert: {
                pleaseReload: "algumas alterações exigem o recarregamento da aplicação\nopções -> recarregar aplicação",
            }
        },
        newfile: {
            title: "Novo OpenCAD",
            name: "Nome do Arquivo",
            nameplaceholder: "nome do arquivo",
            dir: "Diretorio",
            dirplaceholder: "ex: C:\\Users\\user\\Desktop",
            confirm: "criar",
            cancel: "cancelar",
            alert: {
                invalidName: "nome de arquivo invalido",
                noDir: "selecione um diretorio"
            }
        },
        rename: {
            title: "Renomear Arquivo",
            renaming: "Renomeando",
            confirm: "renomear",
            placeholder: "novo nome",
            cancel: "cancelar",
            alert: {
                invalidName: "nome de arquivo invalido",
                sameName: "mesmo nome que o anterior"
            }
        },

        importresources: {
            title: "Importar Recursos",
            pathplaceholder: "ex: C:\\Users\\user\\Desktop\\spacecad.resources.json",
            select: "selecionar arquivo",
            selecttypetext: "importando os seguintes recursos:",
            libs: "bibliotecas",
            modules: "modulos",
            overwrite: "sobrescrever todos os recursos",
            overwritetext: "se selecionado, seus recursos serao deletados e os novos adicionados.",
            confirm: "importar",
            cancel: "cancelar",
            alert: {
                noPath: "selecione um arquivo",
                noType: "tipo de recurso não selecionado"
            }
        },
        shareresources: {
            title: "Exportar Recursos",
            libs: "exportar bibliotecas",
            modules: "exportar modulos",
            confirm: "exportar",
            cancel: "cancelar",
            alert: {
                noType: "tipo de recurso não selecionado"
            }
        },
        changelog: {
            todo: "Á Fazer",
            lastupdates: "Ultimas Atualizacoes",
        }
    },
}, languages["en-US"]);


let language;

if(electronStore.selectedLanguage) {
    language = languages[electronStore.selectedLanguage];
} else {
    const userLanguage = navigator.language;

    const translation =
        languages[userLanguage] ??
        Object.entries(laguanges)
            .find(([key]) => key.split("-")[0] === userLanguage.split("-")[0])
            ?.[1];

    language = translation || laguanges["en-US"];
}



const selectLanguage = lang => {
    language = languages[lang];
    electronStore.selectedLanguage = lang;

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
const doDocumentTranslation = () => {
    document.all("*").forEach(e => {
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
    });
}
doDocumentTranslation();
/* document.all("[data-translation], [data-translation-*],").forEach(e => {
    const setTranslation = type => {
        const path = e.getAttribute("data-translation-" + type);
        const value = langFromPath(path);

        if(type == "value")
            e.innerHTML = value;
        else if(type == "placeholder")
            e.placeholder = value;
        else
            e.innerText = value;
    }
    const pathTitle = e.getAttribute("data-translation-title");
    
    if(pathTitle) {
        const value = langFromPath(pathTitle);
        document.title = value;
    }

    else if(type == "value")
        e.innerHTML = value;
    else if(type == "placeholder")
        e.placeholder = value;
}); */