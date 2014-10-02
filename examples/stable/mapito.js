goog.require('mapito.App');
goog.require('mapito.App.Events');
goog.require('mapito.app.Options');
goog.provide('mapito.start');


/**
 * Start function
 */
mapito.start = function() {
  var localConfig = {
    target: 'mapitoMap'
  };

  var app = new mapito.App();

  goog.events.listen(app, mapito.App.Events.PROJECT_SET, function() {
    app.init();
    window.app = app;
  });

  app.setOptions(/**@type {mapito.app.Options}*/(localConfig));
};
goog.exportSymbol('mapito.start', mapito.start);
