
// const debug = false;
const debug = true;

function checkConf(debugValue, productValue) {
  if (debug)
  {
    return debugValue;
  }
  return productValue;
}

const dirName = __dirname;

//数据库地址
const dbPath = checkConf('./db.db', `${dirName}/../db.db`);

//支持的编程语言，json结构存储
const sportLanguage = checkConf('./langsport.json', '../langsport.json');

//执行粘贴的脚本文件
const parsteScript = checkConf(`${dirName}/parste.ps1`, `${dirName}/../parste.ps1`);

module.exports = {
  dirName,
  dbPath,
  sportLanguage,
  parsteScript,
  debug
};