const sqlite3 = require('sqlite3').verbose();
const { dbPath } = require('./conf');

const db = new sqlite3.Database(dbPath, err=>{
  if (err) {
    console.log(err);
    throw err;
  }
});

module.exports = {
  db
}