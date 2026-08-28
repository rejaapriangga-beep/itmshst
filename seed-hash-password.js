// Jalankan: node seed-hash-password.js "password_plain_disini"
// Output: hash bcrypt yang bisa langsung dimasukkan ke kolom `password` di tabel User

const bcrypt = require('bcryptjs')

const plainPassword = process.argv[2]

if (!plainPassword) {
  console.error('Usage: node seed-hash-password.js "password_plain"')
  process.exit(1)
}

bcrypt.hash(plainPassword, 12).then((hash) => {
  console.log('Hash bcrypt:')
  console.log(hash)
})
