// main.js
// 控制应用生命周期和创建原生浏览器窗口的模组
const { 
  app, 
  BrowserWindow, 
  Menu, 
  MenuItem , 
  Tray, 
  globalShortcut,
  screen, 
  ipcMain
 } = require('electron')

const path = require('path')

let mainWindow = null

function createWindow () {
  // 创建浏览器窗口
  mainWindow  = new BrowserWindow({
    title: "代码片断管理",
    width: 1200,
    height: 600,
    menuBarVisible: false,
    autoHideMenuBar: true,
    resizable: false,
    icon:"php.ico",
    webPreferences: {
      nodeIntegration:true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  // 加载 index.html
  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);


  mainWindow.on('close', (event)=>{

    mainWindow.hide();
    event.preventDefault();
  });

  // 打开开发工具
  // mainWindow.webContents.openDevTools();
}

// const menu = new Menu()
// menu.append(new MenuItem({
//   label: 'Electron',
//   submenu: [{
//     role: 'help',
//     accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
//     click: () => { console.log('Electron rocks!') }
//   }]
// }))

// Menu.setApplicationMenu(menu)

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。

let tray = null
let searchWin = null
let spawn = require('child_process').spawn;


function createSearchWindow()
{
  const modalPath = path.join('file://', __dirname, './search.html')
  searchWin = new BrowserWindow({ 
    frame: true , 
    width:900, 
    // height:40,
    height:560,
    menuBarVisible: false,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    
    // x:1000, 
    // y:0,
    webPreferences: {
      nodeIntegration:true,
      contextIsolation: false,
      enableRemoteModule: true
      // preload: path.join(__dirname, 'search.js')
    }
  });
  
  searchWin.on('close', () => { searchWin = null })
  searchWin.loadURL(modalPath);
}

function openSearchWindow()
{
  if (searchWin==null||searchWin.isDestroyed())
  {
    createSearchWindow();
  }
  searchWin.show()
}




ipcMain.handle('open-code-window', ()=>{
  createCodeWindow();
  codeWindow.show();
});

ipcMain.handle('open-folder-settings', ()=>{
  createFolderWindow();
  folderWindow.show();
});


ipcMain.handle('quit-search', ()=>{
  searchWin.blur()
  searchWin.hide();
});

ipcMain.handle('paste', ()=>{
  searchWin.blur()
  searchWin.hide();
  let parsteFile = path.join(__dirname, './parste.ps1')
  spawn("powershell.exe",[parsteFile]);
});

app.whenReady().then(() => {
  
  tray = new Tray('./php.ico')
  tray.on('click', ()=>{
    mainWindow.show();
  });
  const contextMenu = Menu.buildFromTemplate([
    { label: '退出', type:'normal', click:()=>{
      console.log('quite');
      mainWindow.destroy();
      searchWin.destroy();
      app.quit();      
    }}
  ])
  tray.setToolTip('code snippet')
  tray.setContextMenu(contextMenu)

  globalShortcut.register('Control+Alt+x', () => {    
    openSearchWindow();
  })

  createWindow();
  createSearchWindow();
  searchWin.hide();

});


app.on('will-quit', ()=>{
  globalShortcut.unregister('Control+Alt+x')

  // 注销所有快捷键
  globalShortcut.unregisterAll()
  if (searchWin!=null && !searchWin.isDestroyed){
    searchWin.destroy();
  }
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// 在这个文件中，你可以包含应用程序剩余的所有部分的代码，
// 也可以拆分成几个文件，然后用 require 导入。