require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')

async function syncUsers() {
  await mongoose.connect(process.env.MONGODB_URI)

  const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    firstName: String,
    lastName: String,
    isActive: Boolean,
    createdAt: Date
  }, { collection: 'users' })

  const User = mongoose.models.UserSync || mongoose.model('UserSync', userSchema)

  const users = [
    {
      username: 'manager',
      email: 'manager@cyclecorelims.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      role: 'manager',
      firstName: 'Lab',
      lastName: 'Manager',
      isActive: true
    },
    {
      username: 'shadab',
      email: 'shadab@cyclecorelms.com',
      password: '$2a$10$PkJEA/nC1BAIF.8oP4/Jpu0L00tl8aRD8g6kOnfymTvLYA84Fr0tm',
      role: 'manager',
      firstName: 'Shadab',
      lastName: 'Anwar',
      isActive: true
    },
    {
      username: 'shadab_tech',
      email: 'qazerocode@gmail.com',
      password: '$2a$10$2faLLrydG5oquaOKsq7eRukvWpag38JcOCie4MPRWp3dJw//I8ezu',
      role: 'lab_technician',
      firstName: 'Zero',
      lastName: 'Code',
      isActive: true
    },
    {
      username: 'shadab_viewer',
      email: 'qazerocodes@gmail.com',
      password: '$2a$10$QN67oyCjuudKXLYijJubGukflfeUX0Be5ZxAtKSvEL4iT3OWM/HHa',
      role: 'viewer',
      firstName: 'Zero',
      lastName: 'Code',
      isActive: true
    }
  ]

  for (const user of users) {
    await User.findOneAndUpdate(
      { username: user.username },
      { $set: user, $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    )
  }

  const list = await User.find({}, { _id: 0, username: 1, role: 1, email: 1 }).sort({ username: 1 })
  console.log(JSON.stringify(list, null, 2))

  await mongoose.disconnect()
}

syncUsers().catch(async (err) => {
  console.error(err)
  try {
    await mongoose.disconnect()
  } catch (_) {
    // ignore
  }
  process.exit(1)
})
