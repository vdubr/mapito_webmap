goog.require('mapito.App');
goog.require('mapito.App.Events');
goog.require('mapito.app.Options');
goog.provide('mapito.start');

var app;

var styleOption = {
  'id': 1,
  'def': {
    'image': {
      'src': './data/images/tree.png',
      'scale': 0.2
    }
  }
};


var setStyle = function() {
  window['console']['log']('setStyle');

  var style = mapito.style.getStyleFromDefinition(styleOption['def']);
  var styleId = styleOption['id'];
  app.addStyle(style, styleOption['id']);

  var features = app.getLayerFeatures('wells');
  window['console']['log'](styleId, style, styleOption);
  var featuresLength = features.length;
  for (var i = 0; i < featuresLength; i++) {
    app.setFeatureStyle(features[i], styleId);
  }
};


var eventListener = function(evt) {
  window['console']['log'](evt);
  if (evt['eventType'] === 'layer:loadEnd') {
    var layer = evt['layer'];
    if (layer.get('id') === 'wells') {
      setStyle();
    }
  }
};


/**
 * Start function
 */
mapito.start = function() {
  var localConfig = {
    target: 'mapitoMap',
    path: './data/mapito/moldavia'
  };

  app = new mapito.App();

  goog.events.listen(app, mapito.App.Events.PROJECT_SET, function() {
    app.init();

    window['app'] = app;

  });

  app.setOptions(/**@type {mapito.app.Options}*/(localConfig));

  app.setEventListener(eventListener);
};
goog.exportSymbol('mapito.start', mapito.start);
goog.exportSymbol('app', app);
