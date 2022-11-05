all: three.js ammo.js

three.js:
	wget https://raw.githubusercontent.com/mrdoob/three.js/d081c5a3501d272d19375fab1b01fedf9df29b22/build/three.js

ammo.js:
	wget https://raw.githubusercontent.com/kripken/ammo.js/085626a8becc2a3177fc9d746d85cef9f09e800f/builds/ammo.js

format:
	npx prettier --write index.html editor.html

check:
	npx jshint --extract=always index.html editor.html
	npx prettier --check index.html editor.html

launch:
	firefox http://localhost:8000/index.html#93083208a10895073407b3078107a0072506000697455645250574257315a21560059844b744050422140014284365032213400328426512221200020841652122110001884037407630b53082107100b000
	python3 -m http.server

clean:
	rm three.js ammo.js
