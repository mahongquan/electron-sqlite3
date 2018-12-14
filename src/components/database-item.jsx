import React, { Component } from 'react';
import PropTypes from 'proptypes';
import CollapseIcon from './collapse-icon.jsx';
import TableSubmenu from './table-submenu.jsx';
import { Popup, Dropdown } from 'semantic-ui-react';
//import { remote } from 'electron'; // eslint-disable-line import/no-unresolved
var { sqlectron } = window.myremote;
// var { remote } = window.myremote.electron;

// const Menu = remote.Menu;
// const MenuItem = remote.MenuItem;
const CLIENTS = sqlectron.db.CLIENTS;

export default class DatabaseItem extends Component {
  static propTypes = {
    client: PropTypes.string.isRequired,
    database: PropTypes.object.isRequired,
    item: PropTypes.object.isRequired,
    dbObjectType: PropTypes.string.isRequired,
    style: PropTypes.object,
    columnsByTable: PropTypes.object,
    triggersByTable: PropTypes.object,
    indexesByTable: PropTypes.object,
    onSelectItem: PropTypes.func,
    onExecuteDefaultQuery: PropTypes.func,
    onGetSQLScript: PropTypes.func,
    onExecuteEditTable: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {};
    // this.contextMenu = null;
  }

  // Context menu is built dinamically on click (if it does not exist), because building
  // menu onComponentDidMount or onComponentWillMount slows table listing when database
  // has a loads of tables, because menu will be created (unnecessarily) for every table shown
  onContextMenu(event) {
    event.preventDefault();

    if (!this.contextMenu) {
      this.buildContextMenu();
    }

    this.contextMenu.popup(event.clientX, event.clientY); //error here
  }

  buildContextMenu() {
    const {
      client,
      database,
      item,
      dbObjectType,
      onExecuteDefaultQuery,
      onExecuteEditTable,
      onGetSQLScript,
    } = this.props;

    this.contextMenu = new ContextMenu();
    if (dbObjectType === 'Table' || dbObjectType === 'View') {
      this.contextMenu.append(
        new MenuItem({
          label: 'Select Rows (with limit)',
          click: onExecuteDefaultQuery.bind(this, database, item),
        })
      );
    }
    if (dbObjectType === 'Table') {
      this.contextMenu.append(
        new MenuItem({
          label: 'EditTable',
          click: onExecuteEditTable.bind(this, database, item),
        })
      );
    }
    this.contextMenu.append(new MenuItem({ type: 'separator' }));

    const { disabledFeatures } = CLIENTS.find(
      dbClient => dbClient.key === client
    );
    if (!disabledFeatures || !~disabledFeatures.indexOf('scriptCreateTable')) {
      this.contextMenu.append(
        new MenuItem({
          label: 'Create Statement',
          click: onGetSQLScript.bind(
            this,
            database,
            item,
            'CREATE',
            dbObjectType
          ),
        })
      );
    }

    if (dbObjectType === 'Table') {
      const actionTypes = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
      const labelsByTypes = {
        SELECT: 'Select Statement',
        INSERT: 'Insert Statement',
        UPDATE: 'Update Statement',
        DELETE: 'Delete Statement',
      };

      actionTypes.forEach(actionType => {
        this.contextMenu.append(
          new MenuItem({
            label: labelsByTypes[actionType],
            click: onGetSQLScript.bind(
              this,
              database,
              item,
              actionType,
              dbObjectType
            ),
          })
        );
      });
    }
  }

  toggleTableCollapse() {
    this.setState({ tableCollapsed: !this.state.tableCollapsed });
  }

  renderSubItems({ schema, name }) {
    const {
      columnsByTable,
      triggersByTable,
      indexesByTable,
      database,
    } = this.props;

    if (!columnsByTable || !columnsByTable[name]) {
      return null;
    }

    const displayStyle = {};
    if (!this.state.tableCollapsed) {
      displayStyle.display = 'none';
    }

    return (
      <div style={displayStyle}>
        <TableSubmenu
          title="Columns"
          schema={schema}
          table={name}
          itemsByTable={columnsByTable}
          database={database}
        />
        <TableSubmenu
          collapsed
          title="Triggers"
          schema={schema}
          table={name}
          itemsByTable={triggersByTable}
          database={database}
        />
        <TableSubmenu
          collapsed
          title="Indexes"
          schema={schema}
          table={name}
          itemsByTable={indexesByTable}
          database={database}
        />
      </div>
    );
  }
  onRemove = (e, data) => {
    console.log(e);
  };

  onRename = (e, data) => {
    console.log('onRename');
  };
  render() {
    const {
      database,
      item,
      style,
      onSelectItem,
      dbObjectType,
      onExecuteDefaultQuery,
      onExecuteEditTable,
      onGetSQLScript,
    } = this.props;
    const hasChildElements = !!onSelectItem;
    const onSingleClick = hasChildElements
      ? () => {
          onSelectItem(database, item);
          this.toggleTableCollapse();
        }
      : () => {};

    const collapseArrowDirection = this.state.tableCollapsed ? 'down' : 'right';
    const tableIcon = (
      <i
        className="table icon"
        style={{ float: 'left', margin: '0 0.3em 0 0' }}
      />
    );

    const { schema, name } = item;
    const fullName = schema ? `${schema}.${name}` : name;

    return (
      <div>
        <span style={style} className="item" onClick={onSingleClick}>
          {dbObjectType === 'Table' ? (
            <CollapseIcon arrowDirection={collapseArrowDirection} />
          ) : null}
          {dbObjectType === 'Table' ? tableIcon : null}
          <Dropdown text={fullName}>
            <Dropdown.Menu>
              <Dropdown.Item
                text="Select Rows (with limit)"
                onClick={onExecuteDefaultQuery.bind(this, database, item)}
              />
              <Dropdown.Item
                text="EditTable"
                onClick={onExecuteEditTable.bind(this, database, item)}
              />
              <Dropdown.Item
                text="Create Statement"
                onClick={onGetSQLScript.bind(this,database,item,'CREATE',dbObjectType)}
              />
              <Dropdown.Item
                text="Select Statement"
                onClick={onGetSQLScript.bind(this,database,item,'SELECT',dbObjectType)}
              />
              <Dropdown.Item
                text="Insert Statement"
                onClick={onGetSQLScript.bind(this,database,item,'INSERT',dbObjectType)}
              />
              <Dropdown.Item
                text="Update Statement"
                onClick={onGetSQLScript.bind(this,database,item,'UPDATE',dbObjectType)}
              />
              <Dropdown.Item
                text="Delete Statement"
                onClick={onGetSQLScript.bind(this,database,item,'DELETE',dbObjectType)}
              />
            </Dropdown.Menu>
          </Dropdown>
        </span>
        {this.renderSubItems(item)}
      </div>
    );
  }
}
