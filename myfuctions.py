import re
from os import listdir
from os.path import join as join_path, dirname, getctime
from pathlib import Path
from flask import session, redirect
from functools import wraps
import platform

PATH = Path(dirname(__file__)) / "directory"

def check_exist_program(program, name)->bool:
    path = join_path(PATH, "revisions")
    path_programs = join_path(PATH, "programs")
    regex = re.compile(f'.?{name}.?')
    list_programs = [_ for _ in listdir(path) if _ not in ["warnings", "info"]]
    [list_programs.extend(listdir(join_path(path_programs, dir))) for dir in listdir(path_programs)]
    for file in list_programs:
        if file == program:
            return False
        elif regex.match(file):
            with open(join_path(join_path(path, f"warnings"),f"{program}.txt"), "w") as f:
                f.write(f"coincidence\n{program} -- {file}")
    return True

def check_login(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        if not session.get("admin"):
            return redirect("/panel/login")
        return function(*args, **kwargs)
    return wrapper

def creation_date(path_to_file):
    if platform.system() == 'Windows':
        return getctime(path_to_file)
    else:
        stat = stat(path_to_file)
        try:
            return stat.st_birthtime
        except AttributeError:
            return stat.st_mtime

def clean_path(path:str)->str:
    path = path.replace("//","/")
    path = path[1:] if path[0]=="/" else path
    return path

