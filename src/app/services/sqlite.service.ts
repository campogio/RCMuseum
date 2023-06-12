import { Injectable } from '@angular/core';
import { SQLiteObject,SQLite} from "@awesome-cordova-plugins/sqlite/ngx";
import {
  databaseEightEntry,
  databaseFiveEntry,
  databaseFourEntry,
  databaseOne,
  databaseOneArt, databaseOneEntry,
  databaseOneRoom, databaseSevenEntry, databaseSixEntry,
  databaseThree, databaseThreeEntry,
  databaseTwo, databaseTwoEntry, getAllArt, getAllArtist, getAllRooms,
  getArt,
  getArtist, getEntries
} from "./no-encryption-utils";
import {fullItem, guestEntry, room, searchResult} from "./interfaces.service";

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  db: SQLiteObject;

  artistSearchData: searchResult[] = [];
  artSearchData: searchResult[] = [];
  roomsData: room[]= []



  constructor(private sqlite: SQLite) {

    try {
      this.sqlite.create({
        name: 'mydb',
        location: 'default'
      }).then((db: SQLiteObject) => {
        this.db= db;
        console.log("CREATE artista");
        this.db.executeSql("CREATE TABLE IF NOT EXISTS artista(`idartista` INTEGER PRIMARY KEY AUTOINCREMENT,`nome` VARCHAR(45) NOT NULL UNIQUE,`descrizione` TEXT(1000) NULL, 'thumbnail_media_path' TEXT(1000) NULL)", []);
        console.log("CREATE stanza");
        this.db.executeSql("CREATE TABLE IF NOT EXISTS stanza(`idstanza` INTEGER PRIMARY KEY AUTOINCREMENT,`nome` VARCHAR(45) NOT NULL UNIQUE)", []);
        console.log("CREATE media");
        this.db.executeSql("CREATE TABLE IF NOT EXISTS media(`idmedia` INTEGER PRIMARY KEY AUTOINCREMENT,`tipo` VARCHAR(45) NULL,`path` TEXT(1000) NULL)", []);
        console.log("CREATE opera");
        this.db.executeSql("CREATE TABLE IF NOT EXISTS opera(`idopera` INTEGER PRIMARY KEY AUTOINCREMENT,`artista_idartista` INT NOT NULL,`stanza_idstanza` INT NOT NULL,`nome` VARCHAR(45) NOT NULL UNIQUE,`anno` VARCHAR(45) NULL,`descrizione` TEXT(1000) NULL, 'thumbnail_media_path' TEXT(1000) NULL," +
            "FOREIGN KEY (artista_idartista) REFERENCES artista (idartista),FOREIGN KEY (stanza_idstanza) REFERENCES stanza (idstanza))", []);
        console.log("CREATE guestbookEntry");
        this.db.executeSql("CREATE TABLE IF NOT EXISTS guestbookEntry(`idguestbookEntry` INTEGER PRIMARY KEY AUTOINCREMENT,`testo` TINYTEXT NULL,`foto` TEXT(1000) NULL)", []);
        console.log("CREATE opera_has_media");
        this.db.executeSql("CREATE TABLE IF NOT EXISTS opera_has_media(`opera_idopera` INT NOT NULL,`media_idmedia` INT NOT NULL,PRIMARY KEY (`opera_idopera`, `media_idmedia`))", []);
        console.log("CREATE artista_has_media");
        this.db.executeSql("CREATE TABLE IF NOT EXISTS artista_has_media(`artista_idartista` INT NOT NULL,`media_idmedia` INT NOT NULL,PRIMARY KEY (`artista_idartista`, `media_idmedia`))", []);

        console.log("SEED DATABASE");
        this.db.executeSql(databaseOne,[]);
        this.db.executeSql(databaseTwo,[]);
        this.db.executeSql(databaseThree,[]);
        this.db.executeSql(databaseOneRoom,[]);
        this.db.executeSql(databaseOneArt,[]);

        this.db.executeSql(databaseOneEntry,[]);
        this.db.executeSql(databaseTwoEntry,[]);
        this.db.executeSql(databaseThreeEntry,[]);
        this.db.executeSql(databaseFourEntry,[]);
        this.db.executeSql(databaseFiveEntry,[]);
        this.db.executeSql(databaseSixEntry,[]);
        this.db.executeSql(databaseSevenEntry,[]);
        this.db.executeSql(databaseEightEntry,[]);


        this.seedRoomData();
        this.seedSearchData();

      }).catch(e => console.log(JSON.stringify(e)));


    }catch (err:any){
      alert(err)
    }

  }

  public getArtistSearchData(){
    return this.artistSearchData;
  }

  public getArtSearchData(){
    return this.artSearchData;
  }

  seedRoomData(){
    this.db.executeSql(getAllRooms,[]).then((result)=>{
      for (let i = 0; i<result.rows.length;i++){
        this.roomsData.push({
          id:result.rows.item(i).idstanza,
          name:result.rows.item(i).nome,
        })
      }
      })
    }

  seedSearchData(){
    this.db.executeSql(getAllArtist,[]).then((result)=>{
        for (let i = 0; i<result.rows.length;i++){
          this.artistSearchData.push({
            id:result.rows.item(i).idartista,
            name:result.rows.item(i).nome,
            isArtist: 1,
            roomId: -1,
            description:result.rows.item(i).descrizione,
            thumbnailPath: result.rows.item(i).thumbnail_media_path,
          })
        }
    });
    this.db.executeSql(getAllArt,[]).then((result)=>{
      for (let i = 0; i<result.rows.length;i++){

        console.log(result.rows.item(i).thumbnail_media_path)
        console.log(result.rows.item(i).thumbnail_media_path != null)

        this.artSearchData.push({
          id:result.rows.item(i).idopera,
          name:result.rows.item(i).nome,
          isArtist: 0,
          roomId: result.rows.item(i).stanza_idstanza,
          description:result.rows.item(i).descrizione,
          thumbnailPath: result.rows.item(i).thumbnail_media_path,
        })
      }
    });
  }

  public async getEntries(startIndex:number): Promise<guestEntry[]>{
    let entries: guestEntry[]= [];

    await this.db.executeSql(getEntries,[startIndex,startIndex+4]).then((result)=>{
      for (let i = 0; i<result.rows.length;i++){
        entries.push(
          {
            id: result.rows.item(i).idguestbookEntry,
            description: result.rows.item(i).testo,
            hasMedia: false,
          }
        )
      }

      })
    return entries;

    }

  public async getFullItem(isArtist:number,id:number): Promise<fullItem> {


    let item: fullItem = {
      id: 0,
      name: "",
      roomId: 0,
      artistId: -1,
      description: "",
      hasMedia: false
    };

    if(isArtist==1){
      await this.db.executeSql(getArtist,[id]).then((result)=>{
        item={
          id: result.rows.item(0).idartista,
          name: result.rows.item(0).nome,
          roomId: 0,
          artistId: -1,
          description: result.rows.item(0).descrizione,
          hasMedia: false
        }
      });
    }else {
      await this.db.executeSql(getArt,[id]).then((result)=>{
         item={
          id: result.rows.item(0).idopera,
          name: result.rows.item(0).nome,
          roomId: result.rows.item(0).stanza_idstanza,
           artistId: result.rows.item(0).artista_idartista,
          description: result.rows.item(0).descrizione,
          hasMedia: false
        }
      });
    }

    return item;
  }

  test(){
    this.db.executeSql('SELECT * FROM artista',[]).then((result)=>{ alert(result.rows.length + ' Lines found') });
  }


}
