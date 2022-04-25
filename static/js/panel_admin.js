window.onload = init

let thisElementClickedForRemove, thisElementClickedForMove;
let contentFileArea, modalTitle;
let labelLastModify, labelCreateDate;
let inputNameProgram;
let btnDelete, btnMove;
let activeMove=false;
let CLICKEDIR;

function init(){
    contentFileArea = document.getElementById("contentFile");
    btnDelete = document.getElementById("btnDelete")
    btnMove = document.getElementById("btnMove")
    const directory = document.getElementById("directory")

    getDir("/", directory, "baseDirectory")
    directory.addEventListener('click', function(e){
        let parent = e.target.parentNode.getAttribute("path") ? e.target.parentNode : e.target
        CLICKEDIR = searchParentDir(parent)
        const path = parent.getAttribute("path").replace("\\","")
        const childs = parent.parentNode.childNodes[3]
        if(parent.getAttribute("filetype")!="file"){
            btnDelete.removeEventListener('click', deleteFile)
            getDir(path, childs)
            btnDelete.disabled = true;
            btnMove.disabled = !activeMove;
        }else{
            showDetails(e.target, path)
        }
    })
    directory.addEventListener('dblclick', (e)=>{
        let parent = e.target.parentNode.getAttribute("path") ? e.target.parentNode : e.target
        const path = parent.getAttribute("path").replace("\\","")
        const childs = parent.parentNode.childNodes[3]
        if(parent.getAttribute("filetype")=="file"){
            getDir(path, childs)
        }
    })
    btnMove.addEventListener('click', moveFile);
    labelLastModify = document.getElementById("dateModify")
    labelCreateDate = document.getElementById("createDate")
    inputNameProgram = document.getElementById("nameProgram")
    modalTitle = document.getElementById("modalTitle")
}

function showDirs(dirs, nodeChild, pathParent, className){
    let iconFolder = undefined;
    try{
        iconFolder = nodeChild.previousSibling.previousSibling.firstChild.nextSibling
    }catch{}
    
    if(!dirs) return
    let temp = "";
    pathParent = pathParent == "/" ? "" : pathParent
    for(const element of dirs.split("\n")){
        let type = element[0]=="\\" ? "<i class='bx bxs-folder'></i>" : "<i class='bx bxs-file-txt'></i>"
        let name = element[0]=="\\" ? element.slice(1) : element
        let filetype = element[0] == "\\" ? 'dir' : 'file'
        temp += `
        <div class="${className}">
            <div path='${pathParent}/${name}' filetype='${filetype}'>
                ${type}<p class="name">${name}</p>${filetype=='file' ? '<i onclick="resetMove()" style="visibility:hidden" class="bx bx-x">':''}</i>
            </div>
            <div class="childs"></div>
        </div>`
    }
    nodeChild.innerHTML=temp;
    if(iconFolder) iconFolder.setAttribute("is-open",1)

}

function showDetails(element, path){
    const data = new FormData()
    data.append("path", path)
    fetch("./infofile",{
        method:"POST",
        body: data
    })
    .then(req=>req.json())
    .then(res=>{
        btnDelete.addEventListener('click', deleteFile)
        labelLastModify.innerHTML = res.modify
        labelCreateDate.innerHTML = res.creation
        inputNameProgram.value = path.split("/").slice(-1)[0].trim()
        btnDelete.setAttribute("pathFile", path)
        btnMove.setAttribute("pathFile", path)
        thisElementClickedForRemove = element
        btnDelete.disabled = false;
        btnMove.disabled = false;
    })
}
function resetMove(){
    const selectFileForMove = thisElementClickedForRemove.parentNode
    selectFileForMove.style.background = "transparent"
    selectFileForMove.childNodes[3].style.visibility = "hidden"
    thisElementClickedForRemove = null;
    thisElementClickedForMove = null;
    activeMove = false;
    btnMove.innerHTML = "Mover"
}

function getDir(path, childs, className){
    let iconFolder = undefined;
    if([".exe", ".txt"].includes(path.slice(-4))){
        return openFile(path)
    }
    try{
        iconFolder = childs.previousSibling.previousSibling.firstChild.nextSibling
        className = !className ? "subdir" : className
        const pass =  iconFolder.getAttribute("is-open")!=1
    
        classIconFolder = iconFolder.getAttribute("class").split(" ")
        if(classIconFolder.includes("bxs-folder")){
            let i = classIconFolder.indexOf("bxs-folder")
            classIconFolder[i] = "bxs-folder-open"
            iconFolder.setAttribute("class", classIconFolder.join(" "))
            if(!pass){
                childs.style.display = "block"
                return
            }
        }else{
            let i = classIconFolder.indexOf("bxs-folder-open")
            classIconFolder[i] = "bxs-folder"
            iconFolder.setAttribute("class", classIconFolder.join(" "))
            if(!pass) childs.style.display = "none"
            return
        }
    }catch{}
    const data = new FormData()
    data.append("dir", path)
    data.append("op","list")
    fetch('./getdir',{
        method: "POST",
        body: data
    })
    .then(req=>req.json())
    .then(res=>showDirs(res["dirs"], childs, path, className))
}

function openFile(path){
    const btnModal = document.getElementById("btnModal")
    const data = new FormData()
    data.append("file", path.replace("/",""))
    data.append("op","open")
    fetch("./getdir",{
        method: "POST",
        body: data
    })
    .then(req=>req.blob())
    .then(async res=>{
        if(res.type == "application/json") {
           res = JSON.parse(await res.text())
        }
        let filename = path.split("/").slice(-1)[0].trim()
        if(res.type=="txt"){
            btnModal.click()
            contentFileArea.innerHTML = res.text.replace(/\n+/g, "<br>")
            modalTitle.innerHTML = filename
        }else{
            downloadBlob(res, filename)
        }
    })
}

function deleteFile(e){
    e.preventDefault()
    const pathFile = e.target.getAttribute("pathFile").replace(/\/\//g, "/")
    const data = new FormData()
    data.append("path", pathFile)
    fetch('./delete',{
        method: "POST",
        body: data
    })
    .then(req=>req.json())
    .then(res=>{
        if(res.status){
            const element = thisElementClickedForRemove
            const parentDir = element.parentNode.parentNode
            return parentDir.removeChild(element.parentNode)
        }
        alert("Ha ocurrido un error al eliminar el archivo")
        console.log(res.error)
    })
}

function moveFile(e){
    const elementFile = thisElementClickedForRemove.parentNode
    if(thisElementClickedForRemove && !activeMove){
        activeMove = true;
        thisElementClickedForMove = thisElementClickedForRemove;
        elementFile.style.background  = "#ccc"
        btnMove.innerText = "Mover aquí"
    }else if(thisElementClickedForRemove && activeMove){
        activeMove = false;
        btnMove.disabled = true;
        const elementForMove = thisElementClickedForMove.parentNode.parentNode
        const data = new FormData()
        data.append("path_file", elementForMove.childNodes[1].getAttribute("path").replace(/\/\//g, "/"))
        data.append("path_dir", CLICKEDIR.getAttribute("path").replace(/\/\//g, "/"))
        elementForMove.parentNode.removeChild(elementForMove)
        const newDirectory = CLICKEDIR.nextSibling.nextSibling
        fetch("./movefile",{
            method: "POST",
            body: data
        })
        .then(req=>req.json())
        .then(res=>{
            console.log(res)
            if(res.status){
                newDirectory.previousSibling.previousSibling.firstChild.nextSibling.setAttribute("is-open",0)
                getDir(CLICKEDIR.getAttribute("path"), newDirectory)
                btnMove.innerHTML = "Mover"
            }
        })
    }
    const x = elementFile.childNodes[3]
    x.style.visibility = "visible"
}

function downloadBlob(blob, filename){
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

function searchParentDir(element){
    let parentDir = element;
    for(let i=0; i<5; i++){
        parentDir = parentDir.parentNode
        if(parentDir.getAttribute("class")=="subdir"){
            if(parentDir.childNodes[1].getAttribute("filetype")=="dir"){
                return parentDir.childNodes[1]
            }
        }
    }
    return element
}