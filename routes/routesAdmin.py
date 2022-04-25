from hashlib import sha256
from flask import Blueprint, render_template, send_file, session, request
from os import getenv, listdir, stat, remove as remove_file
from os.path import isfile
from pathlib import Path
from shutil import move as sh_move_file
from time import localtime, strftime
from myfuctions import check_login, clean_path, creation_date

route_admin = Blueprint("route_admin", __name__, url_prefix="/panel")
BASE_DIRECTORY = Path().cwd() / 'directory'

@route_admin.get("/admin")
@check_login
def panel_admin():
    return render_template("panel_admin.html")

@route_admin.get("/login")
def panel_login():
    return render_template("login_admin.html")

@route_admin.post("/login")
def login_admin():
    credentials = request.form
    username = credentials.get("username")
    password = credentials.get("password")

    if username == getenv("KTW_USERNAME") and password == getenv("KTW_PASSWORD"):
        session["admin"] = sha256(username.encode()).hexdigest()
        return {"auth": True}
    return {"auth":False}

@check_login
@route_admin.post("/getdir")
def manage_route_getdir():
    determinar = lambda e: '\\'+e if not '.' in e else e
    op = request.form.get("op")
    path = clean_path(request.form.get("dir", "/"))
    path = BASE_DIRECTORY / path

    if op=="list":
        list_directory = listdir(path)
        return {"dirs":"\n".join(determinar(e) for e in list_directory)}
    elif op=="open":
        file = clean_path(request.form.get("file"))
        path = BASE_DIRECTORY / file
        if isfile(path):
            if str(path)[-4:]==".exe": print("enviando file", path);return send_file(path)
            with open(path, "r") as f:
                return {"text": f.read(), "type":"txt"}
        return {"error": "Ha ocurrido un error"}

@check_login
@route_admin.post("/infofile")
def get_info_file():
    path = clean_path(request.form.get("path"))
    path = BASE_DIRECTORY/path
    info = stat(path)

    return {
        "size": info.st_size,
        "modify": strftime("%Y-%m-%d %H:%M:%S", localtime(info.st_mtime)),
        "creation": strftime("%Y-%m-%d %H:%M:%S", localtime(creation_date(path)))
    }

@check_login
@route_admin.post("/delete")
def delete_file():
    path = clean_path(request.form.get("path"))
    path = BASE_DIRECTORY/path
    try:
        remove_file(path)
        return {"status": True}
    except Exception as e:
        return {"status":"error", "error": e}

@check_login
@route_admin.post("/movefile")
def move_file():
    args = request.form
    path_file = BASE_DIRECTORY/ clean_path(args.get("path_file"))
    path_dir = BASE_DIRECTORY/ clean_path(args.get("path_dir"))
    try:
        filename = path_file.name
        full_path_dir = path_dir/filename
        sh_move_file(path_file, full_path_dir)
        return {"test":True, "status":True}
    except Exception as e:
        return {"status": "error", "error":str(e)}