const { Client } = require('pg');
const bcrypt = require('bcryptjs');
(async () => {
  const hash = bcrypt.hashSync('11Andyogfifi', 10);
  const client = new Client({ host:'localhost', port:5432, user:'pulseforge', password:'PFdb_2026_x7Qm9z', database:'pulseforge' });
  await client.connect();
  await client.query('UPDATE users SET password=$1, "passwordResetToken"=NULL, "passwordResetExpires"=NULL WHERE email=$2', [hash, 'fiablemunezero@gmail.com']);
  console.log('updated', hash);
  await client.end();
})();