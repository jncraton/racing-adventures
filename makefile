all: three.js ammo.js

three.js:
	wget https://raw.githubusercontent.com/mrdoob/three.js/d081c5a3501d272d19375fab1b01fedf9df29b22/build/three.js

ammo.js:
	wget https://raw.githubusercontent.com/kripken/ammo.js/main/builds/ammo.js

format:
	npx prettier --write index.html Detector.js

clean:
	rm three.js ammo.js
