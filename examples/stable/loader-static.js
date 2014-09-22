(function() {
  var splitUrl = window.location.href.split('/');
  var exampleId = splitUrl[splitUrl.length - 1] ||
      splitUrl[splitUrl.length - 2];
  var splitExampleId = exampleId.split('.html')[0];


  var url = './' + splitExampleId + '.js';

  document.write('<script type="text/javascript" src="' + url + '"></script>');
  document.write('<script>mapito.start()</script>');
}());
