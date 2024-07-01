require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool();

const query = (text, values) => pool.query(text, values);

module.exports = { query };