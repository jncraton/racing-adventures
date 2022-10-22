all: three.js ammo.js

three.js:
	wget https://threejs.org/build/three.js

ammo.js:
	wget https://raw.githubusercontent.com/kripken/ammo.js/main/builds/ammo.js

format:
	npx prettier --write index.html Detector.js

clean:
	rm three.js ammo.js
