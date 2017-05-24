const Operators = require('./Operators');

//TODO: ability to drop/create a single/set table(s)
class Mapper {
  /**
   * Create a new Mapper
   * @param {Client} client Cassandra Client
   * @param {string} name Mapper name
   * @param {object[]} modelsDefs Models definitions
   */
  constructor(client, name, modelsDefs, logger) {
    this._client = client;
    this._name = name;
    this._modelsDefs = modelsDefs;
    this._logger = logger;
    this._modelsDefs.forEach(x => {
      x.columns = this._mapToColumnsDefs(x.config.schema);
    });
    throw new Error(`DO NOT USE: NOT WORKING YET.`)
  }

  createAll({dropBefore}) {
    const promise = dropBefore
      ? this.dropSchema(this._client)
      : Promise.resolve();
    return promise
      .then(() => this.createSchema())
      .then(() => this._createUserDefinedTypes())
      .then(() => this._createTables());
  }

  createSchema() {
    const sql = `CREATE KEYSPACE ${this._name} WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}`;
    this._logger.debug(sql);
    return this._client.execute(sql);
  }

  dropSchema() {
    const sql = `DROP KEYSPACE IF EXISTS ${this._name}`;
    this._logger.debug(sql);
    return this._client.execute(sql);
  }

  insert(modelName, payload) {
    const json = JSON.stringify(payload);
    const sql = `INSERT INTO ${this._name}.${modelName} JSON '${json}'`;
    this._logger.debug(sql);
    return this._client.execute(sql);
  }

  update(modelName, payload, constraints) {
    const {params, whereSql} = this._whereSql(constraints || {});
    const sets = [];
    const setParams = [];
    Object.getOwnPropertyNames(payload)
      .forEach(prop => {
        setParams.push(payload[prop]);
        sets.push(`${prop} = ?`);
        return sets;
      });
    const setSql = sets.join();
    const sql = `UPDATE ${this._name}.${modelName} SET ${setSql}${whereSql}`;
    const allParams = setParams.concat(params);
    this._logger.debug(sql, allParams);
    return this._client.execute(sql, allParams, {prepare: true});
  }

  // select(modelName, constraints, pagination) {
  select(modelName, constraints) {
    //TODO handle pagination
    const {params, whereSql} = this._whereSql(constraints || {});
    //TODO add support for indexes instead of using ALLOW FILTERING
    const sql = `SELECT * FROM ${this._name}.${modelName}${whereSql} ALLOW FILTERING`;
    this._logger.debug(sql, params);
    return this._client.execute(sql, params, {prepare: true})
      .then(result => {
        result.rows = this._mapRows(result.rows, modelName);
        return result;
      })
  }

  _mapRows(rows, modelName) {
    const modelDef = this._modelsDefs.find(x => x.name === modelName);
    return rows.map(row => this._mapRow(row, modelDef.columns))
  }

  _mapRow(row, columnsDef) {
    const newRow = {};
    for (let column in row) {
      if (Object.prototype.hasOwnProperty.call(row, column)) {
        const value = row[column];
        const columnDef = columnsDef[column];
        const destProp = columnDef.name;
        newRow[destProp] = this._mapValue(value, columnDef);
      }
    }
    return newRow;
  }

  _mapValue(value, columnDef) {
    switch (columnDef.type) {
      case 'udt':
        return value ? this._mapRow(value, columnDef.schema) : null;
      case 'set':
        return (value || []).map(x => this._mapRow(x, columnDef.schema));
      case 'uuid':
        return value ? value.toString() : null;
      case 'timestamp':
        return value ? value.toISOString() : null;
      default:
        return value;
    }
  }

  _whereSql(constraints) {
    const params = [];
    const whereSql = Object.getOwnPropertyNames(constraints)
      .reduce((sql, fieldName) => {
        let value = constraints[fieldName];
        let operator = Operators.$eq;
        if (Array.isArray(value)) {
          operator = Operators.$in;
        } else if (typeof value === 'object') {
          const operatorName = Object.getOwnPropertyNames(value)[0];
          value = value[operatorName];
          operator = Operators[operatorName] || Operators.$eq;
        }
        const op = operator(value);
        if (op.nbParams > 1 || Array.isArray(value)) {
          params.push(...value);
        } else {
          params.push(value);
        }
        return `${sql} ${sql.length === 0 ? 'WHERE' : 'AND'} ${fieldName} ${op.sql}`;
      }, '');
    return {params, whereSql};
  }

  _createUserDefinedTypes() {
    return this._modelsDefs.reduce(
      (modelPromise, readModel) => {
        const {config: {schema}, name} = readModel;
        const complexFields = Object.getOwnPropertyNames(schema)
          .filter(propName => typeof schema[propName] === 'object');
        return complexFields.reduce(
          (fieldPromise, propName) => {
            const complexField = Array.isArray(schema[propName])
              ? schema[propName][0]
              : schema[propName];
            const fields = Object.getOwnPropertyNames(complexField)
              .map(x => `${x} ${complexField[x]}`)
              .join();
            return fieldPromise
              .then(() => {
                const sql = `CREATE TYPE ${this._name}.${name}_${propName} (${fields})`;
                this._logger.debug(sql);
                return this._client.execute(sql);
              });
          }, modelPromise);
      }, Promise.resolve());
  }

  _createTables() {
    return this._modelsDefs.reduce(
      (promise, readModel) => {
        const {config: {schema, key}, name} = readModel;
        const fields = Object.getOwnPropertyNames(schema)
          .map(propName => `${propName} ${this._getPropertyType(schema, propName, name)}`)
          .join();
        const pk = Array.isArray(key) ? key.join() : key;
        const sql = `CREATE TABLE ${this._name}.${name} (${fields}, PRIMARY KEY(${pk}))`;
        return promise.then(() => {
          this._logger.debug(sql);
          return this._client.execute(sql);
        });
      },
      Promise.resolve()
    );
  }

  _mapToColumnsDefs(schema) {
    return Object.getOwnPropertyNames(schema)
      .reduce((columnsDefs, column) => {
        const type = schema[column];
        columnsDefs[column.toLowerCase()] = this._mapToColumnDef(column, type);
        return columnsDefs;
      }, {});
  }

  _mapToColumnDef(column, type) {
    if (Array.isArray(type)) {
      return {
        name: column,
        type: 'set',
        schema: this._mapToColumnsDefs(type[0])
      };
    } else if (typeof type === 'object') {
      return {
        name: column,
        type: 'udt',
        schema: this._mapToColumnsDefs(type)
      }
    }
    return {
      name: column,
      type
    }

  }

  _getPropertyType(schema, propName, entityName) {
    const typeName = schema[propName];
    if (typeof typeName === 'string') {
      return typeName;
    }
    const type = `${this._name}.${entityName}_${propName}`;
    if (Array.isArray(typeName)) {
      return `set<frozen<${type}>>`;
    }
    return type;
  }
}
module.exports = Mapper;