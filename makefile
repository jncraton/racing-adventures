all: three.js ammo.js

three.js:
	wget https://raw.githubusercontent.com/mrdoob/three.js/d081c5a3501d272d19375fab1b01fedf9df29b22/build/three.js

ammo.js:
	wget https://raw.githubusercontent.com/kripken/ammo.js/085626a8becc2a3177fc9d746d85cef9f09e800f/builds/ammo.js

format:
	npx prettier --write index.html editor.html store.html

check:
	npx jshint --extract=always index.html editor.html store.html
	npx prettier --check index.html editor.html store.html

launch:
	firefox http://localhost:8000/index.html#c668c538c42893083208a108c67795073407b307c2478107a007c866c776c6562506c456c376c236c1460006c8759745c6252505c4157315a215c13560059844b744c6340504i404c3542214i10400142843i743c6436503c463c3332213j10340032842c752c6426512c422c34242029102b0020841c771c6616521c3318201b101c031884037407630b530c210c130c020
	python3 -m http.server

clean:
	rm three.js ammo.js
