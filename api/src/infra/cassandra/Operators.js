const Operators = {
  $eq: () => {
    return {
      nbParams: 1,
      sql: `= ?`
    }
  },
  $neq: () => {
    return {
      nbParams: 1,
      sql: `!= ?`
    }
  },
  $lt: () => {
    return {
      nbParams: 1,
      sql: `< ?`
    }
  },
  $lte: () => {
    return {
      nbParams: 1,
      sql: `<= ?`
    }
  },
  $gt: () => {
    return {
      nbParams: 1,
      sql: `> ?`
    }
  },
  $gte: () => {
    return {
      nbParams: 1,
      sql: `>= ?`
    }
  },
  $in: x => {
    const params = '?'.repeat(x.length)
      .split('')
      .join();
    return {
      nbParams: x.length,
      sql: `IN (${params})`
    }
  },
  $between: () => {
    return {
      nbParams: 2,
      sql: `BETWEEN ? AND ?`
    }
  }
};
module.exports = Operators;