let $ = require('jquery');
const { ipcRenderer } = require('electron')
const path = require('path')
const sqlite3 = require('sqlite3').verbose();
const Vue = require('vue');

const moment = require('moment');

let db = new sqlite3.Database(path.join(__dirname, 'db.db'), err=>{
  if (err) throw err;
});



const App = {
  data() {
    return {
      dt: {},
      editor: null
    }
  },
  methods: {
    save() {
      let sql = "insert into code (title, content, folder, tags, created_at) values ($title, $content, $folder, $tags, $created_at)";
      let val = {
        $title: this.dt.title,
        $content: this.dt.content,
        $folder: this.dt.folder,
        $tags: this.dt.tags,
        $created_at: moment().format()
      };
      val.$content = editor.getValue();
      db.run(sql, val, err=>{
        if(err) throw err;
        alert('save success~');
      });
    }
  },
  mounted() {
    let that = this;
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/katzenmilch");
    editor.session.setMode("ace/mode/javascript");
    
  }
};

let app = Vue.createApp(App);
app.mount('#app');