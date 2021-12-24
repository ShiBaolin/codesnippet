let $ = require('jquery');
const { ipcRenderer } = require('electron');

const path = require('path')
const sqlite3 = require('sqlite3').verbose();
const Vue = require('vue');
const {ElementPlus, ElMessageBox, ElMessage} = require('element-plus');
// const VueToast = require('vue-toast-notification');

const moment = require('moment');




let db = new sqlite3.Database(path.join(__dirname, 'db.db'), err=>{
  if (err) throw err;
});

const App = {
  data() {
    return {
      folders: [],
      codes: [],
      codeObj:{
        content: "phpinfo();"
      },
      addCodeObj: {
      },
      addNewFolderObj:{},
      showAddNewForm: false,
      currentCodeId: 0,
      currentFolderId: 0,
      editor:null,
      newEditor:null
    }
  },
  methods: {
    showCode(id){
      let that = this;
      db.get("select * from code where id=$id", {$id:id}, (err, row)=>{
        if (err) throw err;
        that.codeObj = row;
        that.currentCodeId = row.id;
        
        that.editor.setValue(row.content, 1);
        that.editor.setWrapBehavioursEnabled(true);
        that.editor.focus();
      });
    },

    viewList(folderId){
      if (folderId==0){
        db.all("select * from code order by id desc limit 30", {}, (err, rows)=>{
          if (err) throw err;
          this.currentFolderId = folderId;
          this.codes = rows;
          if (rows.length>0) {
            this.showCode(rows[0].id);
          }
        });
      }else{
        db.all("select * from code where folder=$folderId order by id desc", {$folderId:folderId}, (err, rows)=>{
          if (err) throw err;
          this.currentFolderId = folderId;
          this.codes = rows;
          if (rows.length>0) {
            this.showCode(rows[0].id);
          }
        });
      }
    },

    showNewForm(id){
      this.showAddNewForm = true;
      this.addCodeObj.folder = id;

      db.get("select * from folders where id=$id", {$id:id}, (err,row)=>{
        if (err) throw err;
        console.log(id)
        console.log(row)
        this.addNewFolderObj = row;
      });

    },

    saveNewCode(){
      let sql = "insert into code (title, content, folder, tags, created_at) values ($title, $content, $folder, $tags, $created_at)";
      let val = {
        $title: this.addCodeObj.title,
        $content: this.addCodeObj.content,
        $folder: this.addCodeObj.folder,
        $tags: '',
        $created_at: moment().format()
      };
      val.$content = this.newEditor.getValue();
      let that = this;
      db.run(sql, val, err=>{
        if(err) throw err;
        
        ElMessage({
          message: '新建代码片断完成',
          grouping: true,
          type: 'success',
          duration: 2000,
        });

        that.showAddNewForm = false;
        that.addCodeObj = {};
        that.viewList(val.$folder);
      });
    },

    updateCode(){
      let content =  this.editor.getValue();
      let that = this;
      let sql = "update code set content=$content, updated_at=$updated_at where id=$id";
      db.run(sql, {$content:content , $updated_at: moment().format(), $id:this.codeObj.id}, (err)=>{
        if (err) throw err;
        // that.$messagebox.jj_alert('更新代码成功');
        // console.log(messagebox);
        ElMessage({
          message: '更新代码成功',
          grouping: true,
          type: 'success',
          duration: 2000,
        });
        this.showCode(this.codeObj.id);
      });
    },

    deleteCode(){
      let that = this;
      ElMessageBox.confirm(
        '删除后将无法恢复',
        '确认删除吗?',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        
          let id = that.codeObj.id;
          let folder = that.currentFolderId;
    
          let sql = "delete from code where id=$id";
          db.run(sql, {$id:id}, (err)=>{
            if (err) throw err;
            that.viewList(folder);
          });

        }).catch(() => {});


    }
  },
  mounted() {
    let that = this;
    db.all("select * from folders", (err, rows)=>{
      that.folders = rows;
    });

    db.all("select * from code order by id desc limit 30", (err, rows)=>{
      that.codes = rows;
      that.showCode(rows[0].id);
    });

    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/katzenmilch");
    this.editor.session.setMode("ace/mode/java");    
    
    this.newEditor = ace.edit("addNewEditor");
    this.newEditor.setTheme("ace/theme/katzenmilch");
    this.newEditor.session.setMode("ace/mode/java");
  }
};

Vue.createApp(App).use(ElementPlus).mount('#app');




$(()=>{
  $('#btnFolderSettings').click(()=>{
    ipcRenderer.invoke('open-folder-settings');
  });

  $('#btnCodeWindow').click(()=>{
    console.log('open code window');
    ipcRenderer.invoke('open-code-window');
  });
});
