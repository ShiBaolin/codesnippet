
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
      current: 0
    }
  },
  components: {
    ElButton,
    ElScrollbar
  },
  methods: {  
    search(){
      let that = this;

      db.all("select * from code where title like '%"+that.keywords+"%' order by id desc", {}, (err, rows)=>{
        if (err) throw err;
        that.items = rows;
      });
      that.current = 0;
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
      this.$refs.scrollbar.setScrollTop(98*(newCurrent-6));
    }
    
  },
  mounted() {
    let that = this;
    db.all("select * from folders", (err, rows)=>{
      that.folders = rows;
    });

    db.all("select * from code order by id desc limit 20", (err, rows)=>{
      that.items = rows;
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
