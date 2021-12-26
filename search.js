
const { ipcRenderer, clipboard } = require('electron')
const Vue = require('vue');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const {ElementPlus, ElButton, ElScrollbar, ElMessageBox, ElMessage} = require('element-plus');

let db = new sqlite3.Database(path.join(__dirname, 'db.db'), err=>{
  if (err) throw err;
});

const App = {
  data() {
    return {
      items: [],
      keywords:'',
      current: 0,
      viewCode:'',
      searchMode:'t'
    }
  },
  components: {
    ElButton,
    ElScrollbar
  },
  methods: {
    findCode(){
      if (this.searchMode=='c'){
        this.editor.find(this.keywords.substr(1));
      }
    },  
    search(){
      let that = this;
      if (this.keywords.startsWith(':'))
      {
        this.searchMode = 'c';
        sql = "select * from code where content like '%"+this.keywords.substr(1)+"%' order by id desc"
      }else{
        this.searchMode = 't'
        sql = "select * from code where title like '%"+this.keywords+"%' order by id desc"
      }
      db.all(sql, {}, (err, rows)=>{
        if (err) throw err;
        that.items = rows;
        if (rows && rows.length>0)
        {
          that.editor.setValue(rows[0].content, 1);
        }else{
          that.editor.setValue('',);
        }        
        this.findCode();      
      });
      this.current = 0;
    },
    selectUp(e){
      if (this.current>0)
      {
        this.current--;
      }else{
        this.current = 0;
      }
      
    },
    selectDown(e){
      if (this.current < this.itemsMaxIndex)
      {
        this.current++;
      }else{
        this.current = this.itemsMaxIndex;
      }

    },
    showCode(id){
      db.get("select * from code where id=$id", {$id:id}, (err, row)=>{
        if (err) throw err;
        this.codeObj = row;
        this.editor.setValue(row.content);
      });
    }
  },
  computed: {
    itemsMaxIndex() {
      return this.items.length-1;
    },
    searchKeywords() {
      return this.keywords;
    }
  },
  watch: {
    keywords(newQuestion, oldQuestion) {
      this.search();
    },
    current(newCurrent, oldCurrent) {
      // this.viewCode = this.items[newCurrent].content;
      this.editor.setValue(this.items[newCurrent].content, 1);
      this.$refs.scrollbar.setScrollTop(98*(newCurrent-6));
      this.findCode();
    }
    
  },
  mounted() {
    let that = this;

    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/katzenmilch");
    this.editor.session.setMode("ace/mode/java"); 

    db.all("select * from folders", (err, rows)=>{
      that.folders = rows;
    });

    db.all("select * from code order by id desc limit 20", (err, rows)=>{
      that.items = rows;
      if (rows&&rows.length>0)
      {
        that.editor.setValue(rows[0].content, 1);
      }
    });

    document.onkeydown = function(el) {

      switch (window.event.keyCode){
          case 38:
            window.event.preventDefault();
            that.selectUp(el);
          break;

          case 40:
            window.event.preventDefault();
            that.selectDown(el);
          break;

          case 27:
            ipcRenderer.invoke('quit-search');
          break;

          case 13:
            window.event.preventDefault();
            
            clipboard.writeText(that.items[that.current].content);
            clipboard.readText();

            ipcRenderer.invoke('paste');
          break;

          defaul:
            
          break;
      }
    }


  }
};

Vue.createApp(App).use(ElementPlus).mount('#app');

window.addEventListener('DOMContentLoaded', () => {
    const element = document.getElementById('txtSearch')
    if (element) element.focus();
});
