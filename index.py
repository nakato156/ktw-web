from flask import Flask, render_template, request, send_file
from routes.routesAdmin import route_admin
from routes.routesInstall import route_install
from routes.search import route_search
from os.path import dirname, join as join_path
from myfuctions import check_exist_program
from dotenv import load_dotenv
from os import  getenv, urandom
from binascii import b2a_hex

load_dotenv()
app = Flask(__name__)
app.secret_key = b2a_hex(urandom(16))
app.register_blueprint(route_admin)
app.register_blueprint(route_install)
app.register_blueprint(route_search)

__WEB_VERSION__ = getenv("WEB_VERSION")
__VERSION_CLI__ = getenv("VERSION_CLI")
Path = join_path(dirname(__file__), "directory")

@app.get("/")
def home():
    return render_template("home.html")

@app.get("/ktw/download")
def download_ktw():
    return send_file("ktw.exe")

@app.get("/ktw/upload")
def form_upload():
    return render_template("upload.html")

@app.post("/ktw/upload")
def upload_program():
    global Path
    path = join_path(Path, "revisions")
    path_txt = join_path(path, "info")
    file = request.files
    args =request.form
    filename = f"{args.get('name')}-w{args.get('win')}-v{args.get('version')}.exe"

    if not check_exist_program(filename, args.get('name')):
        return {"error": "El programa ya existe"}
    
    elif all(args.get(arg) for arg in args):
        file = file["file"]
        file.save(join_path(path, filename))
        with open(f"{path_txt}/{args.get('name')}-{args.get('win')}.txt", "w") as txt:
            txt.write(f"""name: {args.get('name')}
            \rwin: {args.get('win')}
            \rversion: {args.get('version')}""")
        return {"status":"ok"}
    return {"error": "Debe llenar todos los campos"}

@app.get("/ktw/version")
def version_ktw():
    return {"version": __VERSION_CLI__}

if __name__ == "__main__":
    app.run(debug = True if getenv("ENV_TYPE")=="local" else False)