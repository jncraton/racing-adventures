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
	firefox index.html#03080208010800080407030701070007040600060745064555450405220560050844074404042204001408436403220340030842641222020002084107416421220101010001274026407530243001000000

clean:
	rm three.js ammo.js
