(function() {
  var hostname = window.location.hostname || 'localhost';
  var mode;

  if (window.location.href.match(/mode=([a-z0-9\-]+)\&?/i) === null) {
    mode = '?mode=RAW';
    window.location.search = mode;
  } else {
    mode = window.location.href.match(/mode=([a-z0-9\-]+)\&?/i)[1];
  }

  var pathname = window.location.pathname.split('/');
  var exampleJS = pathname[pathname.length - 3] + '/' +
                  pathname[pathname.length - 2] + '/' +
                  pathname[pathname.length - 1].replace('html', 'js');

  var url = 'http://' + hostname + ':8000/' + mode.toLowerCase() +
            ';example=' + exampleJS;

  document.write('<script type="text/javascript" src="' + url + '"></script>');
  document.write('<script type="text/javascript">mapito.start();</script>');
}());
