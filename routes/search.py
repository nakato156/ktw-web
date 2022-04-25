from flask import Blueprint, render_template, request
from pathlib import Path
from os.path import dirname
from os import listdir
import re

route_search = Blueprint("route_search", __name__)
PROGRAMS_PATH = Path(dirname(dirname(__file__))+"/directory/programs")

@route_search.get("/search/<string:query>")
def search_program(query):
    results = []
    for dir in PROGRAMS_PATH.iterdir():
        dir = dir.name
        if re.match(f'.*{query}.*', dir):
            results.append(dir)
    if request.args.get("q")=="true": return {"results": results}
    return render_template("search.html", results=results, query=query)

@route_search.get("/program/<string:program>")
def doc_program(program):
    for dir in PROGRAMS_PATH.iterdir():
        if program == dir.name:
            versions = listdir(dir)
            return render_template("program.html", **{"program":program, "versions":versions})