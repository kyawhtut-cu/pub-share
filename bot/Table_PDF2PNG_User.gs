class PDF2PNGUserTable {

  constructor(tableName) {
    this.Table = Tamotsu.Table.define(
      {
        sheetName: tableName,
        idColumn: `user_name`,
        autoIncrement: false,
      }
    )
  }

  getRandomUser() {
    let list = this.Table.all()
    return list[(Math.floor(Math.random() * list.length))]
  }
}
