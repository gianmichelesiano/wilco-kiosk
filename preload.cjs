const {contextBridge,ipcRenderer} = require('electron');
const bridge={};
for(const name of ['catalog','config','live','close','reset','greeted','ask','listen','speak','unlock','apps','show','voices','voice','context','probe','save','bake','side','quit']) bridge[name]=(...args)=>ipcRenderer.invoke(name,...args);
bridge.onDemoError=fn=>ipcRenderer.on('demo-error',()=>fn());
bridge.onActivity=fn=>ipcRenderer.on('activity',()=>fn());
contextBridge.exposeInMainWorld('wilco',bridge);
