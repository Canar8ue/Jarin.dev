from flask import Flask, send_from_directory, jsonify
import pandas as pd
import os

# Initialize Flask
# We set static_folder to current directory ('.') so it can find your css/js files
app = Flask(__name__, static_folder='.')

# ---------------------------------------------------------
# OPTIONAL: Pandas Data Preparation (Future Proofing)
# ---------------------------------------------------------
# Right now, your data is in data.js. 
# Eventually, we will move that data here into a DataFrame.
# For now, this just proves Pandas is ready to go.
def get_timeline_data():
    # Placeholder: In the future, we'll load this from a CSV or Database
    df = pd.DataFrame([
        {"id": 1, "title": "The Pre-Mortal Council", "date": "Pre-mortality"},
        {"id": 15, "title": "Visit to the Americas", "date": "c. 34 AD"}
    ])
    return df

# ---------------------------------------------------------
# ROUTES
# ---------------------------------------------------------

@app.route('/')
def home():
    """Serve the main HTML file"""
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve any other static file (css, js, images) requested by the HTML"""
    return send_from_directory('.', filename)

@app.route('/api/status')
def api_status():
    """A test endpoint to see if Pandas is working"""
    df = get_timeline_data()
    return jsonify({
        "status": "online", 
        "data_engine": "pandas",
        "sample_event": df.iloc[0].to_dict()
    })

# ---------------------------------------------------------
# RUN SERVER
# ---------------------------------------------------------
if __name__ == '__main__':
    # host='0.0.0.0' allows other devices on the LAN to connect
    # port=5000 is the standard Flask port
    print("\n---------------------------------------------------")
    print(" ZIM SERVER ONLINE")
    print(" Access on this machine: http://localhost:5000")
    print(" Access on LAN:          http://[YOUR_PC_IP_ADDRESS]:5000")
    print("---------------------------------------------------\n")
    app.run(host='0.0.0.0', port=5000, debug=True) 
