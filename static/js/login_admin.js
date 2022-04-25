window.onload = init;

function init(){
    const form = document.getElementById("formAdmin")
    form.addEventListener('submit', (e)=>{
        e.preventDefault()
        const credentials = new FormData(form)

        fetch('../panel/login',{
            method: "POST",
            body: credentials
        })
        .then(req=>req.json())
        .then(res=>{
            if(res.auth){
                location.href = "./admin"
            }else{
                alert("Datos incorrectos")
            }
        })
        .catch(err=>alert(error))
    })
}