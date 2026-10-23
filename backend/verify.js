const b = require('bcryptjs');
const h = '$2a$10$YwXPhJUeaDyIyg.5dB7DwOCH0Qujw6SYdwO5AW9jGlER43xH4wAse';
console.log(b.compareSync('11Andyogfifi', h));
