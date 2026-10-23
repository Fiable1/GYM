const initSqlJs = require('sql.js');
const fs = require('fs');
(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('data/pulseforge.db'));
  const rows = db.exec("SELECT email,password FROM users WHERE email='fiablemunezero@gmail.com'");
  console.log(JSON.stringify(rows));
})();