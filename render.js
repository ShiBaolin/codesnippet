const Vue = require('vue');

const {VueDraggableNext} = require('vue-draggable-next');

const {
  ElementPlus, 
  ElMessageBox, 
  ElMessage, 
  ElDialog, 
  ElButton,
  ElInput,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElScrollbar,
  ElSelect,
  ElOption
} = require('element-plus');
// const VueToast = require('vue-toast-notification');

const moment = require('moment');

const { sportLanguage } = require('./conf');

const { db } = require('./db');

const App = {
  data() {
    return {
      folders: [],
      codes: [],
      codeObj:{
        content: ""
      },
      addCodeObj: {
      },
      addNewFolderObj:{},
      newFolderName: '', //新增文件夹的名称
      showAddNewForm: false,
      currentCodeId: 0,
      currentFolderId: 0,
      editor:null,
      newEditor:null,
      dialogFormVisible: false,
      searchKeys:'',
      visible:false,
      folderName:'', //修改文件夹名称时的变量
      modifyFolderFormVisible: false, //显示修改文件夹窗口
      updateFolderId:0, //修改文件夹时的文件夹id
      options: [
        
      ],
      langvalue:'',
      code_lang:'',
      drag:false
    }
  },
  components: {
    ElDialog,
    ElButton,
    ElInput,
    ElDropdown,
    ElDropdownMenu,
    ElDropdownItem,
    ElScrollbar,
    ElSelect,
    ElOption,
    draggable:VueDraggableNext
  },
  methods: {
    formatLang(langField){
      if (langField)
      {
        return langField.substr(9);
      }
      return '';
    },

    checkMove: function() {
      var stmt = db.prepare("update folders set px=? where id=?");
      this.folders.forEach((element, index) => {
        stmt.run(index, element.id);
      });
    },

    showCode(id){
      let that = this;
      db.get("select * from code where id=$id", {$id:id}, (err, row)=>{
        that.throwErr(err, 'show code');
        that.codeObj = row;
        that.currentCodeId = row.id;
        this.code_lang = row.lang;
        
        that.editor.setValue(row.content, 1);
        that.editor.setWrapBehavioursEnabled(true);
        that.editor.focus();
        that.editor.session.setMode(row.lang);
      });
    },
    throwErr(err, channel){
      if (err){
        console.log('=========',channel,'============');
        console.log(err)
        throw err;
      }
    },
    viewList(folderId){
      if (folderId==0){
        db.all("select * from code order by id desc", {}, (err, rows)=>{
          this.throwErr(err, 'view list');
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
        this.addNewFolderObj = row;
      });

    },

    saveNewCode(){
      let sql = "insert into code (title, content, folder, lang, tags, created_at, lang) values ($title, $content, $folder, $lang, $tags, $created_at, $lang)";
      let val = {
        $title: this.addCodeObj.title,
        $content: this.addCodeObj.content,
        $folder: this.addCodeObj.folder,
        $lang: this.langvalue,
        $tags: '',
        $created_at: moment().format(),
        $lang: this.langvalue
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
      this.newEditor.setValue('');
    },

    updateCode(){
      let content =  this.editor.getValue();
      let title = this.codeObj.title;
      let that = this;
      let lang = this.code_lang;
      let sql = "update code set title=$title, content=$content, lang=$lang, updated_at=$updated_at where id=$id";
      db.run(sql, {$title:title, $content:content , $lang: lang, $updated_at: moment().format(), $id:this.codeObj.id}, (err)=>{
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
    },
    saveNewFolder(){
      let folderVal = this.newFolderName;
      let that = this;
      db.run("insert into folders(folder_name,px) values($folder_name, $px)", {$folder_name: folderVal, $px: 10}, (err)=>{
        if (err) throw err;
        ElMessage({
          message: '创建新文件夹成功',
          grouping: true,
          type: 'success',
          duration: 2000,
        });
        that.dialogFormVisible = false;
        that.newFolderName = '';
        db.all("select * from folders order by px asc, id asc", (err, rows)=>{
          if (err) throw err;
          that.folders = rows;
        });
      });
    },

    openUpdateFolder(folderId){
      this.modifyFolderFormVisible = true;
      this.updateFolderId = folderId;
      db.get("select * from folders where id=$id", {$id: folderId}, (err,row)=>{
        this.folderName = row['folder_name'];
      });
    },

    updateFolder(){
      let folderVal = this.folderName;
      let folderId = this.updateFolderId;
      let that = this;
      db.run("update folders set folder_name=$folder_name where id=$id", {$folder_name: folderVal, $id: folderId}, (err)=>{
        if (err) throw err;
        ElMessage({
          message: '修改文件夹成功',
          grouping: true,
          type: 'success',
          duration: 2000,
        });

        that.modifyFolderFormVisible = false;
        that.folderName = '';
        db.all("select * from folders order by px asc, id asc", (err, rows)=>{
          if (err) throw err;
          that.folders = rows;
        });
      });
    },

    deleteFolder(folderId){
      ElMessageBox.confirm(
        '删除后其文件夹下的代码也将被删除且无法恢复',
        '确认删除吗?',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
          let that = this;
          let sql = "delete from code where folder=$folder";
          db.run(sql, {$folder:folderId}, (err)=>{
            if (err) throw err;
          });
          db.run("delete from folders where id=$id", {$id:folderId}, (err)=>{
            if (err) throw err;
            ElMessage({
              message: '删除成功',
              grouping: true,
              type: 'success',
              duration: 2000,
            });
            that.currentFolderId = 0;
          });
          db.all("select * from folders", (err, rows)=>{
            that.folders = rows;
          });

      }).catch(() => {});
    },

    search(){
      let that = this;

      let params = {};

      let sql = "select * from code where title like '%"+that.searchKeys+"%' order by id desc";

      if (this.currentFolderId>0)
      {
        params.$folder = this.currentFolderId;
        sql = "select * from code where title like '%"+that.searchKeys+"%' and folder=$folder order by id desc";
      }

      db.all(sql, params, (err, rows)=>{
        if (err) throw err;
        that.codes = rows;
        if (rows.length>0)
        {
          that.showCode(rows[0].id);
        }
      });

    }
  },
  mounted() {
    let that = this;
    db.all("select * from folders order by px,id", (err, rows)=>{
      if (err) {
        console.log('init err');
        console.log(err);
        throw err;
      }
      that.folders = rows;
    });



    this.editor = ace.edit("editor");
    this.editor.setTheme("ace/theme/katzenmilch");
    this.editor.session.setMode("ace/mode/java");    
    
    this.newEditor = ace.edit("addNewEditor");
    this.newEditor.setTheme("ace/theme/katzenmilch");
    this.newEditor.session.setMode("ace/mode/java");

    this.options = require(sportLanguage);

    db.all("select * from code order by id desc limit 50", (err, rows)=>{
      that.throwErr(err, 'mounted show code');
      that.codes = rows;
      if (rows.length>0)
      {
        that.showCode(rows[0].id);
      }
    });


  }
};

Vue.createApp(App).use(ElementPlus).mount('#app');




// $(()=>{



//   $('#btnFolderSettings').click(()=>{
//     ipcRenderer.invoke('open-folder-settings');
//   });

//   $('#btnCodeWindow').click(()=>{
//     console.log('open code window');
//     ipcRenderer.invoke('open-code-window');
//   });
// });
