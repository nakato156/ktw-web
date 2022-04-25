window.onload = init;

let divAlert;

function init(){
    const form = document.getElementById("formulario");
    divAlert = document.getElementById("myalert")
    form.addEventListener("submit", (e) =>{
        e.preventDefault();
        const dataUpload = new FormData(form);

        fetch("/ktw/upload",{
            method: "POST",
            body: dataUpload
        })
        .then(req=>req.json())
        .then(res=>{
            if(res.status=="ok"){
                return showAlert("Aplicación subida exitosamenet!", "success")
            }
            throw res
        })
        .catch(err=>{
            if (err.error){
                return showAlert(err.error, "danger")
            }
            showAlert("Ha ocurrido un error al subir la aplicación :(", "danger")
        })
    })
}

function showAlert(msg, type){
    divAlert.innerHTML = `<div id="alerta" class="alert alert-${type}" role="alert">${msg}</div>`
    setTimeout(()=>divAlert.removeChild(divAlert.firstChild), 2000)
}