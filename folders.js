let $ = require('jquery');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let dbPath = path.join(__dirname, 'db.db')
console.log(dbPath)
const db = new sqlite3.Database(dbPath, err=>{
  if (err) throw err;
});

const Vue = require('vue');


let models = null;

const Counter = {
  data() {
    return {
      rows: [1,2,3]
    }
  },
  mounted() {
    let that = this;
    db.all("select * from folders", (err, rows)=>{
      that.rows = rows;
    });
  }
};

let app = Vue.createApp(Counter);
app.mount('#app');


db.close();
  
$('#btnAddFolder').click(()=>{
  let folderVal = $('#folderName').val();
  db.run("insert into folders(folder_name,px) values($folder_name, $px)", {$folder_name: folderVal, $px: 10}, (err)=>{
    if (err) throw err;
    alert("插入成功");
  });
});
