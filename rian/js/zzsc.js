var puzzleGame = function(options){
 
 this.img = options.img || "";
 
 this.e_playArea = $("#play_area");
 this.e_startBtn = $("#play_btn_start");
 this.e_playScore = $("#play_score");
 this.e_playCount = $("#play_count");
 this.e_levelBtn = $("#play_btn_level");
 this.e_levelMenu = $("#play_menu_level");
 
 this.areaWidth = parseInt(this.e_playArea.css("width"));
 this.areaHeight = parseInt(this.e_playArea.css("height"));
 this.offX = this.e_playArea.offset().left;
 this.offY = this.e_playArea.offset().top;
 
 this.levelArr = [[3,3],[4,4],[6,6]];
 this.level = 1;
 this.scoreArr = [100,200,400];
 this.score = 0;
 this.playCount = 0;
 
 this.cellRow = this.levelArr[this.level][0];
 this.cellCol = this.levelArr[this.level][1];
 
 this.cellWidth = this.areaWidth/this.cellCol;
 this.cellHeight = this.areaHeight/this.cellRow;
 this.imgArr = [];
 this.ranArr = [];
 
 this.cellArr = [];
 this.easing = 'swing';
 this.time = 400;
 this.thisLeft = 0;
 this.thisTop = 0;
 this.nextIndex;
 this.thisIndex;
 
 this.cb_cellDown = $.Callbacks();
 
 
 this.isInit = false;
 this.isBind = false;
 this.start();
};
puzzleGame.prototype = {
 start:function(){
  this.init();
  
  this.menu();
 },
 set: function(options){
  this.level = options.level === 0 ? 0 : (options.level || 1);
 },
 menu:function(){
  var self = this;
  
  this.e_startBtn.click(function(){
   self.e_levelMenu.hide();
   self.play();
  });
  this.e_levelBtn.click(function(){
   if(self.playing) return;
   self.e_levelMenu.toggle();
  });
  this.e_levelMenu.find("a").click(function(){
   self.e_levelMenu.hide();
   self.e_levelBtn.find(".level_text").html($(this).html())
   
   if(parseInt($(this).attr("level")) !== self.level){
    self.set({
     "level": $(this).attr("level")
    });
    self.isInit = true;
    self.isBind = false;
   }
  })
 },
 play:function(){
  if(this.isInit){
   this.isInit = false;
   this.cellRow = this.levelArr[this.level][0];
   this.cellCol = this.levelArr[this.level][1];
   this.cellWidth = this.areaWidth/this.cellCol;
   this.cellHeight = this.areaHeight/this.cellRow;
   this.init();
  }
  this.e_playCount.html(this.playCount = 0);
  this.randomImg();
  if(!this.isBind)this.bindCell();
 },
 init:function(){
  var _cell;
  
  this.cellArr = [];
  this.imgArr = [];
  this.e_playArea.html("");
  
  for(var i = 0; i<this.cellRow; i++){
   for(var j = 0; j<this.cellCol; j++){
    this.imgArr.push(i*this.cellCol + j);
    _cell = document.createElement("div");
    _cell.className = "play_cell";
    $(_cell).css({
     "width": this.cellWidth-2,
     "height": this.cellHeight-2,
     "left": j * this.cellWidth,
     "top": i * this.cellHeight,
     "background": "url(" + this.img + ")",
     "backgroundPosition": (-j) * this.cellWidth + "px " + (-i) * this.cellHeight + "px"
    });
    this.cellArr.push($(_cell));
    this.e_playArea.append(_cell);
   }
  }
 },
 randomImg:function(){
  var ran,arr;
  arr = this.imgArr.slice();
  this.ranArr = [];
  for(var i = 0, ilen = arr.length; i < ilen; i++){
   ran = Math.floor(Math.random() * arr.length);
   this.ranArr.push(arr[ran]);
   
   this.cellArr[i].css({
    "backgroundPosition": (-arr[ran]%this.cellCol) * this.cellWidth + "px " + (-Math.floor(arr[ran]/this.cellCol)) * this.cellHeight + "px"
   })
   arr.splice(ran,1);
  }
  $("#p").html(this.ranArr.join())
 },
 bindCell:function(){
  var self = this;
  this.isBind = true;
  this.cb_cellDown.add(self.cellDown);
  for(var i = 0, len = this.cellArr.length; i<len; i++){
   this.cellArr[i].on({
    "mouseover": function(){
     $(this).addClass("hover");
    },
    "mouseout": function(){
     $(this).removeClass("hover");
    },
    "mousedown": function(e){
     self.cb_cellDown.fire(e, $(this), self);
     return false;
    }
    
   });
  }
 },
 cellDown:function(e,_cell,self){
  var //self = this,
  _x = e.pageX - _cell.offset().left,
  _y = e.pageY - _cell.offset().top;
     
  self.thisLeft = _cell.css("left");
  self.thisTop = _cell.css("top");
  self.thisIndex = Math.floor(parseInt(self.thisTop)/self.cellHeight)*self.cellCol;
  self.thisIndex += Math.floor(parseInt(self.thisLeft)/self.cellWidth);
     
  _cell.css("zIndex",99);
   $(document).on({
    "mousemove": function(e){
     _cell.css({
      "left": e.pageX - self.offX - _x,
      "top": e.pageY - self.offY - _y
     })
    },
    "mouseup": function(e){
     $(document).off("mouseup");
     $(document).off("mousemove");
     self.cb_cellDown.empty();
     if( e.pageX - self.offX < 0 || e.pageX - self.offX > self.areaWidth || e.pageY - self.offY < 0 || e.pageY - self.offY > self.areaHeight ){
      self.returnCell();
      return;
     }
       
     var _tx, _ty, _ti, _tj;
     _tx = e.pageX - self.offX;
     _ty = e.pageY - self.offY;
       
     _ti = Math.floor( _ty / self.cellHeight );
     _tj = Math.floor( _tx / self.cellWidth );
       
     self.nextIndex = _ti*self.cellCol + _tj;
     if(self.nextIndex == self.thisIndex){
      self.returnCell();
     }else{
      self.changeCell();
     }
    }
   })
   
 },
 changeCell:function(){
  var self = this,
  _tc = this.cellArr[this.thisIndex],
  _tl = this.thisLeft,
  _tt = this.thisTop,
  _nc = this.cellArr[this.nextIndex],
  _nl = (this.nextIndex % this.cellCol) * this.cellWidth,
  _nt = Math.floor(this.nextIndex / this.cellCol) * this.cellHeight;
  
  _nc.css("zIndex",98);
  
  this.cellArr[this.nextIndex] = _tc;
  this.cellArr[this.thisIndex] = _nc;
       
  this.ranArr[this.nextIndex] = this.ranArr[this.nextIndex] + this.ranArr[this.thisIndex];
  this.ranArr[this.thisIndex] = this.ranArr[this.nextIndex] - this.ranArr[this.thisIndex];
  this.ranArr[this.nextIndex] = this.ranArr[this.nextIndex] - this.ranArr[this.thisIndex];
       
  _tc.animate({
   "left": _nl,
   "top": _nt
  },self.time,self.easing,function(){
   _tc.removeClass("hover");
   _tc.css("zIndex","");
  })
       
  _nc.animate({
   "left": _tl,
   "top": _tt
  },self.time,self.easing,function(){
   _nc.removeClass("hover");
   _nc.css("zIndex","");
   self.check();
   
   if(!self.cb_cellDown.has(self.cellDown)) self.cb_cellDown.add(self.cellDown);
  })
 },
 returnCell:function(){
  var self = this;
  this.cellArr[this.thisIndex].animate({
   "left": self.thisLeft,
   "top": self.thisTop
  },self.time,self.easing,function(){
   $(this).removeClass("hover");
   $(this).css("zIndex","");
   if(!self.cb_cellDown.has(self.cellDown)) self.cb_cellDown.add(self.cellDown);
  });
 },
 check:function(){
  this.e_playCount.html( ++ this.playCount);
  if(this.ranArr.join() == this.imgArr.join()){
   this.success();
  }
 },
 success:function(){
  alert("ok");
  this.score += this.scoreArr[this.level]
  this.e_playScore.html(this.score);
 }
}
$(document).ready(function(e) {
    var pg = new puzzleGame({
  img: "img/zzsc.jpg"
 });
});