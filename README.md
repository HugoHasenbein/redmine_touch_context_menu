# redmine_touch_context_menu
Enables the context menu on a mobile touch device. 
The JavsScript file provided here is a modified file of the orginal context_menu.js file providing the context menu.

### Install 

1. download plugin

2. go to your **public/javascripts** folder and save your original file

`mv context_menu.js context_menu.js.org`

3. mv context_menu.js to your  **public/javascripts**

'mv <your_download_folder>/redmine_touch_context_menu/context_menu.js /<redmine_root>/public/javascripts

no need to restart - you may have to force reload on your browser, though

### Uninstall

go to your **public/javascripts** folder

`rm context_menu.js`

`mv context_menu.js.org context_menu.js`


### Use

* On a desktop device ypu should not experience any difference

* On a touch device you now have a "long click" instead of a "right-click".

Select your issues as you are used to. To show the context menu toch for a bit more than half a second. Context menu will appear. 

**Have fun!**

### Localisations

N.A. no localizable strings

### Change-Log

* **1.0.1**
- Added ShortTouch to clear context menu selection on touching on empty pane

* **1.0.0**
