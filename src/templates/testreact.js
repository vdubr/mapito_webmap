/** @jsx React.DOM */
goog.provide('templates.project')

templates.project = React.createClass({
  render: function() {
      var classes = "mapito-project"

    return (
      <div className = {'mapito-project'}>
        <div className = {'mapito-mapview'}>
        </div>
        <div className = {'mapito-dataview'}>
        </div>
      </div>
    );
  }
});
