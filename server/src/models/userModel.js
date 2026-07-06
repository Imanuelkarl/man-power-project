const { v4: uuidv4 } = require('uuid');

const pool = require('../config/dbConnect');

// Helper to map DB row to user object with save()
function makeUser(row) {
  if (!row) return null;
  const user = {
    _id: row.id,
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    resetPasswordToken: row.reset_password_token,
    resetPasswordExpire: row.reset_password_expire ? parseInt(row.reset_password_expire, 10) : undefined,
  };

  user.save = async function (opts = {}) {
    const q = `UPDATE users SET name=$1, email=$2, password=$3, reset_password_token=$4, reset_password_expire=$5 WHERE id=$6 RETURNING *`;
    const vals = [this.name, this.email, this.password, this.resetPasswordToken, this.resetPasswordExpire, this.id || this._id];
    const res = await pool.query(q, vals);
    const updated = makeUser(res.rows[0]);
    // mutate current object
    Object.assign(this, updated);
    return this;
  };

  return user;
}

// Query-like object that is thenable and supports .select('+password')
function findOneBuilder(filter) {
  let includePassword = false;

  const run = async () => {
    const keys = Object.keys(filter);
    const where = keys.map((k, i) => `${k === 'id' ? 'id' : k}=$${i + 1}`).join(' AND ');
    const vals = keys.map((k) => filter[k]);
    const q = `SELECT * FROM users WHERE ${where} LIMIT 1`;
    const res = await pool.query(q, vals);
    const row = res.rows[0];
    if (!row) return null;
    const user = makeUser(row);
    if (!includePassword) user.password = undefined;
    return user;
  };

  const builder = {
    select(sel) {
      if (typeof sel === 'string' && sel.includes('+password')) includePassword = true;
      return run();
    },
    then(resolve, reject) {
      return run().then(resolve, reject);
    },
  };

  return builder;
}

async function findOne(filter) {
  return findOneBuilder(filter);
}

async function create({ name, email, password }) {
  const id = uuidv4();
  const q = `INSERT INTO users (id, name, email, password) VALUES ($1,$2,$3,$4) RETURNING *`;
  const vals = [id, name, email, password];
  const res = await pool.query(q, vals);
  return makeUser(res.rows[0]);
}

module.exports = {
  findOne,
  create,
};
