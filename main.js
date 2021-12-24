// main.js



// 控制应用生命周期和创建原生浏览器窗口的模组
const { 
  app, 
  BrowserWindow, 
  Menu, 
  MenuItem , 
  Tray, 
  globalShortcut, 
  clipboard, 
  screen, 
  contextBridge,
  ipcMain
 } = require('electron')
const path = require('path')

function createWindow () {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration:true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // 加载 index.html
  mainWindow.loadFile('index.html');

  // 打开开发工具
  mainWindow.webContents.openDevTools();
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

function openSearchWindow()
{
  const modalPath = path.join('file://', __dirname, './search.html')
  if (searchWin==null||searchWin.isDestroyed())
  {

    searchWin = new BrowserWindow({ 
      frame: true , 
      width:500, 
      // height:40,
      height:560,
      menuBarVisible: false,
      frame: false,
      transparent: true,
      resizable: false,
      
      // x:1000, 
      // y:0,
      webPreferences: {
        nodeIntegration:true,
        contextIsolation: false,
        enableRemoteModule: true
        // preload: path.join(__dirname, 'search.js')
      }
    })
    
    searchWin.on('close', () => { searchWin = null })
    searchWin.loadURL(modalPath);
    // searchWin.webContents.openDevTools()
  }
  searchWin.show()
}

let folderWindow = null;

//文件夹管理页面
function createFolderWindow(){
  const folderPagePath = path.join('file://', __dirname, './folders.html')
  folderWindow = new BrowserWindow({ 
    frame: true , 
    width:500, 
    height:500,
    menu: false,
    show: false,
    webPreferences: {
      nodeIntegration:true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
    
  folderWindow.loadURL(folderPagePath)
  folderWindow.webContents.openDevTools()
}

//tags管理页面

//代码编写窗口
let codeWindow = null;

function createCodeWindow(){
  const codePagePath = path.join('file://', __dirname, './code.html')
  codeWindow = new BrowserWindow({ 
    frame: true , 
    width:800, 
    height:500,
    menu: false,
    show: false,
    webPreferences: {
      nodeIntegration:true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
    
  codeWindow.loadURL(codePagePath)
  codeWindow.webContents.openDevTools()
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
  searchWin.close();
});

ipcMain.handle('paste', ()=>{
  searchWin.blur()
  searchWin.hide();
  let parsteFile = path.join(__dirname, './parste.ps1')
  spawn("powershell.exe",[parsteFile]);
});

app.whenReady().then(() => {
  
  tray = new Tray('./php.ico')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' }
  ])
  tray.setToolTip('This is my application.')
  tray.setContextMenu(contextMenu)

  globalShortcut.register('Control+Alt+x', () => {
    console.log('Electron loves global shortcuts!')
    const size = screen.getPrimaryDisplay().size
    const message = `当前屏幕是: ${size.width}px x ${size.height}px`
    console.log(message);
    
    openSearchWindow();
    // clipboard.writeText('一段示例内容!')
    // clipboard.readText()
  })

  createWindow()
});


app.on('will-quit', ()=>{
  globalShortcut.unregister('Control+Alt+x')

  // 注销所有快捷键
  globalShortcut.unregisterAll()
  searchWin.destroy();
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// 在这个文件中，你可以包含应用程序剩余的所有部分的代码，
// 也可以拆分成几个文件，然后用 require 导入。