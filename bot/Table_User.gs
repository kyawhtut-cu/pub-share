class UserTable {

  constructor() {
    this.Table = Tamotsu.Table.define(
      {
        sheetName: `User`,
        idColumn: `user_id`,
        autoIncrement: false,
      }
    )
  }

  isUserExist(id) {
    return this.getUserById(id) != null
  }

  getUserById(id) {
    return this.Table.where({ user_id: parseInt(id) }).first()
  }

  createUser(userId, userName, userDisplayName) {
    if (userName == `` || userName == null) {
      userName = `${userId}`
    }
    let user = this.Table.create({
      user_id: userId,
      user_name: userName,
      user_display_name: userDisplayName,
      credit: 2,
      created_date: new Date(),
      updated_date: new Date()
    })

    delete user.row_
    delete user.errors

    return user
  }

  updateUserCredit(userId, credit) {
    let user = this.Table.where({ user_id: parseInt(userId) }).first()

    if (user != null) {
      user.credit += credit
      user.updated_date = new Date()
      user.save()
    }

    delete user.row_
    delete user.errors

    return user
  }

  setUserSaveData(userId, data) {
    let user = this.Table.where({ user_id: parseInt(userId) }).first()

    if (user != null) {
      user.save_data = JSON.stringify(data)
      user.updated_date = new Date()
      user.save()
    }

    delete user.row_
    delete user.errors

    return user
  }
}
