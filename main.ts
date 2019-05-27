import { app, BrowserWindow, Menu } from 'electron';
import { initListeners } from './listeners';
import { registerLocalShortcuts } from './shortcuts';
const fs = require("fs-extra");
const path = require('path');



app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096');



Menu.setApplicationMenu(null);



const onError = error => {
   
  let e = "";

  try{

    e = JSON.stringify( error, Object.getOwnPropertyNames(error) );

  }catch(e){}

  const p = path.join(process.env.HOME, "nifti_error.txt");

  fs.writeFileSync(p, e);

}



const loadTemplate = (window, url) => {

    return new Promise((resolve,reject) => { 

      window.loadURL(url);

      window.webContents.once('did-finish-load', resolve);  

      window.webContents.once('did-fail-load', (event, errorCode, errorDescription) => reject(errorDescription));     

    })

}  



export let win = null;



const onWindowLoaded = () => {

  /*
  const folder = "samples";

  const files = fs.readdirSync(folder);

  const data = files.map(file => {

    const p = path.resolve(__dirname, folder, file);

    return fs.readFileSync(p);

  });
  */

  win.webContents.send("loaded");

  win.webContents.openDevTools();

}



const options = {
  width : 1800, 
  height : 900,
  frame : true,
  show : true, 
  backgroundColor : '#6495ed',
  title : "NIFTI Viewer",
  icon : path.resolve(__dirname,'icon.ico'), 
  resizable : true
};



const createWindow = () => {

  win = new BrowserWindow(options);

  win.on('closed', () => { win = null; });

  win.setMenu(null);

  return loadTemplate(win, `file://${__dirname}/app.html`).then(() => onWindowLoaded());

}



app.on('ready', () => {

  initListeners();

  registerLocalShortcuts();
  
  createWindow();

});    



app.on('window-all-closed', () => app.exit());



(process as any).on('unhandledRejection', error => onError( error ));



(process as any).on('uncaughtException', error => onError( error ));