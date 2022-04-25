from flask import Blueprint, render_template, request, send_file
from pathlib import Path
import re

route_install = Blueprint("route_install", __name__, url_prefix="/install/program")
BASE_DIRECTORY = Path().cwd() / 'directory'

@route_install.route("/release/<string:program>")
def get_release_program(program):
    args = request.args
    if args.get("cli"):
        new_version="0.0.0"
        program_versions = BASE_DIRECTORY / 'programs' / program
        for file in program_versions.iterdir():
            version = str(file.name)
            _version = re.findall("\d+\.\d+\.\d+", version)[0]
            v1, v2, v3 = _version.split(".")
            nv1, nv2, nv3 = new_version.split(".")
            if (int(v1)>=int(nv1) or int(v2)>=int(nv2) or int(v3)>=int(nv3)) and version.find(args.get('win')):
                new_version = _version
        return {"version": new_version}
    return render_template("version.html", program=program)

@route_install.post("/<string:program>")
def get_library(program):
    args = request.args
    version = args.get("version")
    win = args.get("win")
    programs_directory = BASE_DIRECTORY / 'programs'
    for dir in programs_directory.iterdir():
        if program in dir.name:
            file_name = f'{program}-{version}-{win}.exe'
            path_file = programs_directory / program / file_name
            try:
                return send_file(path_file)
            except:
                return {"error":"program not found"}
    return {"error":"program not found"}
