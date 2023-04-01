all: three.module.js ammo.js GLTFLoader.js

three.module.js:
	wget https://raw.githubusercontent.com/mrdoob/three.js/1f61ed271920749fc4e519afb35aea52165026de/build/three.module.js

GLTFLoader.js:
	wget https://raw.githubusercontent.com/mrdoob/three.js/1f61ed271920749fc4e519afb35aea52165026de/examples/jsm/loaders/GLTFLoader.js

ammo.js:
	wget https://raw.githubusercontent.com/kripken/ammo.js/6ec2ce66f2fbd06fae2c0013274cffdacccc3343/builds/ammo.js

format:
	npx prettier --write index.html editor.html play.html main.js

check:
	npx jshint --extract=always index.html editor.html play.html main.js
	npx prettier --check index.html editor.html play.html main.js

launch:
	firefox http://localhost:8000/index.html#c668c538c42893083208a108c67795073407b307c2478107a007c866c776c6562506c456c376c236c1460006c8759745c6252505c4157315a215c13560059844b744c6340504i404c3542214i10400142843i743c6436503c463c3332213j10340032842c752c6426512c422c34242029102b0020841c771c6616521c3318201b101c031884037407630b530c210c130c020
	python3 -m http.server

clean:
	rm -f three.module.js ammo.js GLTFLoader.js
