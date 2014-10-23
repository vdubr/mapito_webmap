$(".mapito-conf").click(function(){
  var confGist = this.parentElement.querySelector("code[data-gist-id]")
  var arrow = this.querySelector("i.fa")

  var gistDiv = this.parentElement.querySelector("[data-mapito-gist-id]")
  var visible = $(gistDiv).is(":visible")

  if(visible){
    $(gistDiv).hide()
    $(arrow).removeClass("fa-angle-down")
    $(arrow).addClass("fa-angle-up")
  }else{
    $(gistDiv).show()
    if(!gistDiv.querySelector('code[data-gist-id]')){
      var gistId = gistDiv.dataset.mapitoGistId
      var $code = $('<code data-gist-id="'+gistId+'"/>');
      $code.appendTo(gistDiv).gist()
    }

    $(arrow).removeClass("fa-angle-up")
    $(arrow).addClass("fa-angle-down")
  }

})
