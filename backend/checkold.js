const initSqlJs = require('sql.js');
const fs = require('fs');
(async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync('D:/tmp/scratchpad/old.db'));
  const rows = db.exec("SELECT password FROM users WHERE email='fiablemunezero@gmail.com'");
  console.log(JSON.stringify(rows));
})();