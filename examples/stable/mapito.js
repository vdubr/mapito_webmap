goog.require('mapito.App');
goog.require('mapito.App.Events');
goog.require('mapito.app.Options');
goog.provide('mapito.start');

var eventListener = function(evt) {
  window['console']['log'](evt);
};


/**
 * Start function
 */
mapito.start = function() {
  var localConfig = {
    target: 'mapitoMap',
    path: './data/mapito/moldavia'
  };

  var app = new mapito.App();

  var onProjectLoaded = function() {
    app.init();
    window['app'] = app;
    window['console']['log']('app is loaded');
  };

  app.setOptions(/**@type {mapito.app.Options}*/(localConfig), onProjectLoaded);

  app.setEventListener(eventListener);
};

goog.exportSymbol('mapito.start', mapito.start);
