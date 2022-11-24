from flask import Flask, request, send_file

app = Flask(__name__, static_folder="/")

players = {}


@app.route("/", methods=["GET"])
def get_index():
    return send_file("index.html")


@app.route("/update/<string:player>", methods=["POST"])
def update(player):
    players[player] = request.form
    return players


if __name__ == "__main__":
    app.run(port=8000)
