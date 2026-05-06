import json
from flask import Flask, render_template, send_from_directory, abort
import os

app = Flask(__name__)

# 1. Load the Data
def load_projects():
    # Opens the JSON file we just made
    with open('data/projects.json', 'r') as file:
        return json.load(file)

# 2. The Homepage (The AWGE Shop Look)
@app.route('/')
def index():
    my_projects = load_projects()
    return render_template('index.html', projects=my_projects)

# 3. The "Magic" Route for Internal Sites
# This lets you host 'Christ' and 'Bread' directly.
# If someone goes to /projects/bread-site/index.html, this handles it.
@app.route('/projects/<path:filename>')
def serve_hosted_sites(filename):
    # This tells Flask to look inside 'static/hosted_sites'
    # for whatever file is requested
    return send_from_directory('static/hosted_sites', filename)

# 4. The Profile Page
@app.route('/profile')
def profile():
    return render_template('profile.html')

if __name__ == '__main__':
    # Debug mode is on so you see errors immediately
    app.run(host='0.0.0.0', port=5000, debug=True) 

