goog.require('mapito.App');
goog.require('mapito.app.Options');
goog.require('mapito.app.ProjectOptions');
goog.provide('mapito.start');

var eventListener = function(evt) {
  window['console']['log']('something happend: ',evt);
};


/**
 * Start function
 * @param {string|mapito.app.ProjectOptions|undefined} config
 * @param {string|undefined} target
 */
mapito.start = function(config, target) {
  var localConfig = {
    target: target || 'mapitoMap'
  };

  if(goog.isString(config)){
    localConfig['path'] = config;
  }

  if(goog.isObject(config)){
    localConfig['projectOptions'] = config;
  }

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
