// eq  {key: value}
// and {key: value, key2: value2}
// others {key: {operator: value}}
// and/or {operator: [{key: {operator: value}}]}
export class Where {
  constructor(where) {
    this._where = Where._normalize(where);
  }

  static fromFilter(filter) {
    return new Where(filter.where);
  }

  static _normalize(node) {
    if (!node) return node;
    const keys = Object.keys(node);
    if (keys.length > 1) {
      return Where._normalizeAnd(node, keys);
    }
    const key = keys[0];
    return Where._normalizeEq(key, node[key]);
  }

  static _normalizeEq(key, value) {
    if (!value || typeof value !== 'object') {
      return {
        [key]: {'$eq': value}
      }
    }
    const originalOp = Object.keys(value)[0];
    const op = Where._normalizeOp(originalOp);
    if (!ValidOperators.includes(op)) {
      throw new Error(`Invalid operator ${originalOp}.`);
    }
    const v = value[originalOp];
    return {[key]: {[op]: v}};
  }

  static _normalizeAnd(node, keys) {
    const nodes = keys.map(key => Where._normalizeEq(key, node[key]));
    return {
      '$and': nodes
    }
  }

  static _normalizeOp(originalOp) {
    if (!originalOp) return null;
    let op = originalOp.toLowerCase();
    if (op[0] !== '$') op = '$' + op;
    return op;
  }

  isEmptyOrNull() {
    return (!this._where || Object.keys(this._where).length === 0);
  }

  getIndexConstraint(primaryKey) {
    let pkNode = this._readFirstNode();
    if (!pkNode) return pkNode;
    if (Array.isArray(primaryKey)) {
      if (pkNode.key) return null;
      const pkNodes = primaryKey.map(x => this.getIndexConstraint(x));
      //TODO: support operator other than $eq for composite keys
      if (pkNodes.some(x => x === null || x.operator !== '$eq')) return null;
      return {
        operator: '$eq',
        key: pkNodes.map(x => x.key).join('_'),
        value: pkNodes.map(x => x.value).join(':')
      }
    }
    if (!pkNode.key) {
      pkNode = pkNode.value.find(x => x.key === primaryKey);
    }
    if (!pkNode || pkNode.key !== primaryKey) return null;
    return pkNode;
  }

  _readFirstNode() {
    if (!this._where) {
      return null;
    }
    const keys = Object.keys(this._where);
    if (keys.length === 0) {
      return null;
    }
    const key = keys[0];
    let value = this._where[key];
    if (Array.isArray(value)) {
      return {
        operator: key,
        value: value
      }
    }
    const operator = Object.keys(value)[0];
    return {
      key,
      operator,
      value: value[operator]
    }
  }
}

const ValidOperators = ['$eq', '$lt', '$lte', '$gt', '$gte', '$between', '$inq', '$ilike', '$neq'];

const Directions = {
  'ASC': 1,
  'DESC': -1
};

export class Order {
  static fromFilter(filter) {
    return new Order(filter.order);
  }

  constructor(order) {
    this._order = order;
  }

  static _parseOrderValue(order) {
    const [propertyName, direction] = order.split(' ');
    const dir = Directions[direction.toUpperCase()];
    return [propertyName, dir || Directions.ASC]
  }

  getOrders() {
    if (!this._order) {
      return [];
    }
    if (typeof this._order === 'string') {
      return [Order._parseOrderValue(this._order)];
    }
    if (Array.isArray(this._order)) {
      return this._order.map(Order._parseOrderValue);
    }
    throw new Error(`Invalid type for order.`);
  }
}