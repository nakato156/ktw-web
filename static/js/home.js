window.onload = init;

function init(){
    const btnDownload = document.getElementById("btnDownload")
    const formSearch = document.getElementById("formSearch")
    const inputSearch = document.getElementById("inputSearch")
    const datalist = document.getElementById("sugerencias")
    btnDownload.addEventListener("click", ()=>{
        fetch("./ktw/download")
        .then(req=>req.blob())
        .then(res=>{
            downloadBlob(res, 'ktw.exe')
        })
        .catch(err=>alert(`Ha ocurrido un error al descargar el archivo\n${err}`))
    })
    formSearch.addEventListener('submit', (e)=>{
        e.preventDefault()
        location.href = `./search/${inputSearch.value}`
    })
    inputSearch.addEventListener('keyup', (e)=>{
        const query = inputSearch.value;
        if(!query.trim()) return;
        fetch(`./search/${query}?q=true`)
        .then(req=>req.json())
        .then(res=>{
            let temp = ""
            res.results.forEach(r=>{
                temp += `<option value="${r}">`
            })
            datalist.innerHTML = temp;
        })
    })
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
