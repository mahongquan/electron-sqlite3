import React, { Component } from 'react';

const log = global.SQLECTRON_CONFIG.log;

export default class LogStatus extends Component {
  render() {
    if (!log.console && !log.file) {
      return null;
    }
    //console.log(log.level);
    return (
      <a className="ui red label">
        <i className="terminal icon" />
      </a>
    );
  }
}
