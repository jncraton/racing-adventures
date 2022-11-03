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
	firefox index.html#03080208010800080507040703070107000705060006074556450505030522056005084407440504220400140843650322034003084265122202000208410741652122010101000127407630253001000000w

clean:
	rm three.js ammo.js
