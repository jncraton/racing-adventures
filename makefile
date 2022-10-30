all: three.js ammo.js

three.js:
	wget https://raw.githubusercontent.com/mrdoob/three.js/d081c5a3501d272d19375fab1b01fedf9df29b22/build/three.js

ammo.js:
	wget https://raw.githubusercontent.com/kripken/ammo.js/085626a8becc2a3177fc9d746d85cef9f09e800f/builds/ammo.js

format:
	npx prettier --write index.html
	npx prettier --write editor.html

check:
	npx jshint --extract=always index.html
	npx prettier --check index.html
	npx prettier --check editor.html

launch:
	firefox index.html#00010203041424344443424140302010

clean:
	rm three.js ammo.js
