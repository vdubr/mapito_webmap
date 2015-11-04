goog.provide('templates.project');

templates.project = function(){
  var template
  if (goog.isDefAndNotNull(window.React)) {
    template =  React.createClass({
      render: function() {
        return ("<div className = {'mapito-project'}><div className = {'mapito-mapview'}></div><div className = {'mapito-dataview'}></div></div>");
      }
    });
  }else{
    template = document.createElement('div')
    template.className = 'mapito-project'

    var mapView = document.createElement('div')
    mapView.className = 'mapito-mapview'
    template.appendChild(mapView)

    var dataview = document.createElement('div')
    dataview.className = 'mapito-dataview'
    template.appendChild(dataview)
  }
  return template
}
