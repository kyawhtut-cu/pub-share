class PDF2PNGUserTable {

  constructor() {
    this.Table = Tamotsu.Table.define(
      {
        sheetName: `PDF2PNG`,
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
