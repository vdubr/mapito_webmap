/** @jsx React.DOM */
goog.provide('templates.project')

templates.project = React.createClass({
  render: function() {
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
