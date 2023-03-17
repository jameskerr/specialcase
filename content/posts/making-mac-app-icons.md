---
title: "Making Mac App Icons"
date: 2022-06-10T09:07:57-07:00
draft: true
---


https://gist.github.com/jamieweavis/b4c394607641e1280d447deed5fc85fc

https://stackoverflow.com/questions/12306223/how-to-manually-create-icns-files-using-iconutil/20703594#20703594

https://developer.apple.com/design/resources/#macos-apps

With Sketch export preset


Then run this on it.
```
iconutil -c icns icon.iconset
```

Windows
```
convert icon.icoset/*png icon.ico
```


DMG

https://www.electron.build/configuration/dmg.html

https://stackoverflow.com/questions/11199926/create-dmg-with-retina-background-support/11204769#11204769

Default locations expected background size to be 540x380

tiffutil -cathidpicheck background.png background@2x.png -out background.tiff
