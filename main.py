from flask import Flask, request, send_file
import json

app = Flask(__name__, static_folder="/")

players = {}


@app.route("/", methods=["GET"])
def get_index():
    return send_file("index.html")


@app.route("/update/<string:player>", methods=["POST"])
def update(player):
    players[player] = json.loads(request.data)
    return players


if __name__ == "__main__":
    app.run("0.0.0.0", port=8000, threaded=True)
