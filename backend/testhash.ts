import 'reflect-metadata';
import * as bcrypt from 'bcryptjs';
const h = bcrypt.hashSync('11Andyogfifi', 10);
console.log('hash:', h);
console.log('verify:', bcrypt.compareSync('11Andyogfifi', h));
