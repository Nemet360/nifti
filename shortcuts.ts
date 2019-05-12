import { forEachObjIndexed } from 'ramda';  
import { globalShortcut } from 'electron';
import { win } from './main';
const localShortcut = require('electron-localshortcut');



const globalShortcuts = {};



const localShortcuts = {

    'Ctrl+D' : () => win.webContents.openDevTools(),

    'Ctrl+A' : () => win.webContents.send("axial"),

    'Ctrl+C' : () => win.webContents.send("coronal"),

    'Ctrl+S' : () => win.webContents.send("sagittal")

};


 
export let registerLocalShortcuts = () : void => {
    forEachObjIndexed(
        (value:Function,key:string) => localShortcut.register(key, value)  
    )(localShortcuts)
}; 
 


export let registerGlobalShortcuts = () : void => {
    forEachObjIndexed(
        (value:Function,key:string) => globalShortcut.register(key, value)  
    )(globalShortcuts)
}; 



export let unregisterAllLocalShortcuts = () => localShortcut.unregisterAll();



export let unregisterAllGlobalShortcuts = () => globalShortcut.unregisterAll();

