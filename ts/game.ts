import * as PIXI from 'pixi.js';
import { Container, Sprite } from 'pixi.js';
import {
  W, H,
  istakaInfo, stoneInfo, tasAtmaYerleriArr, playerLocations,
  istakaInfoMobil, stoneInfoMobil, tasAtmaYerleriArrMobil, playerLocationsMobil
} from './config';
import { Coordinate, Stone, StoneExtra, StoneInfo, Color, UserInfoForStones } from './interface';

export default class Game extends PIXI.Application {
  private mobil: boolean;
  private menu: Container;
  private playerBar: Container;
  private stoneInfo: { width: number, height: number };
  private tasAtmaYerleriArr: Coordinate[];
  private playerLocations: Coordinate[];
  private istakaInfo: { w: number, h: number, x: number, y: number }
  private circleSize: number;
  private fontSizeForStone: number;
  private playerSize: number;
  private menuScale: number;
  private scale: number = 1
  private myTurn: boolean = true;
  private tasCektim: boolean = false;
  private ortadanCekilenTas: Stone;
  private istaka: PIXI.Sprite = {} as PIXI.Sprite;
  private tasAtmayerleri: PIXI.Container[] = [];
  private players: PIXI.Container[] = [];
  private indexs = {} // like "0x0" "1x0";
  private sockettenGelenOyunDatasi: { myID: number, acikTas: StoneInfo, kapaliTasSayisi: number, myStones: StoneInfo[] } = {
    myID: 2,
    acikTas: {
      c: Color.Black,
      n: 7,
      id: 100
    },
    kapaliTasSayisi: 45,
    myStones: [
      {c:Color.Red,n:7,id:10},
      {c:Color.Red,n:9,id:12},
      {c:Color.Black,n:2,id:15},
      {c:Color.Yellow,n:13,id:16},
      {c:Color.Blue,n:5,id:72},
      {c:Color.Black,n:6,id:80},
      {c:Color.Black,n:2,id:81},
      {c:Color.Black,n:7,id:82},
      {c:Color.Blue,n:1,id:30},
      {c:Color.Black,n:5,id:19},
      {c:Color.Red,n:8,id:11},
      {c:Color.Blue,n:1,id:2},
      {c:Color.Red,n:13,id:110},
      {c:Color.Black,n:13,id:111},
    ]

  }

  private sockettenGelenTasDatasi = {
    id: 1,
    s: {
      c: Color.Red,
      n: 8,
      id: 1000,
    }
  }
  private myID: number;
  private idSiralama: UserInfoForStones = {};
  private kapaliTasSayisi: number;
  private acikTas: StoneInfo;
  private stoneData: StoneInfo[] = [];
  constructor(scale, mobil) {
    super({
      view: <HTMLCanvasElement>document.querySelector('#canvas'),
      transparent: true,
      width: W * scale,
      height: H * scale,
    });
    this.mobil = mobil
    this.scale = scale;
    document.body.appendChild(this.view)
    this.mobilControl();
    this.stage.scale.set(this.scale);
    this.startGame();
  }

  private mobilControl() {
    if (this.mobil) {
      this.stoneInfo = stoneInfoMobil;
      this.istakaInfo = istakaInfoMobil;
      this.tasAtmaYerleriArr = tasAtmaYerleriArrMobil;
      this.playerLocations = playerLocationsMobil;
      this.circleSize = 26;
      this.fontSizeForStone = 38;
      this.playerSize = 2;
      this.menuScale = 1.5
    } else {
      this.stoneInfo = stoneInfo;
      this.istakaInfo = istakaInfo;
      this.tasAtmaYerleriArr = tasAtmaYerleriArr;
      this.playerLocations = playerLocations;
      this.circleSize = 22;
      this.fontSizeForStone = 28;
      this.playerSize = 5 / 2;
      this.menuScale = .66;
    }
  }

  private returnColor(c: Color) {
    const colors = {
      "b": 0x5777dc,
      "r": 0xf3261f,
      "bk": 0x2e2e2c,
      "y": 0xeeba44,
      "w": 0xffffff
    }
    if (c == Color.Black) return colors.bk;
    if (c == Color.Blue) return colors.b;
    if (c == Color.Red) return colors.r;
    if (c == Color.Yellow) return colors.y;
    if (c = Color.White) return colors.w;
  }
  private ortadanCekilenTasAtama() {
    const stone: StoneInfo = { c: Color.Yellow, n: 11, id: 1432478521 };
    (this.ortadanCekilenTas.children[1] as PIXI.Sprite).tint = this.returnColor(stone.c);
    (this.ortadanCekilenTas.children[3] as PIXI.Text).text = stone.n + "";
    this.ortadanCekilenTas.extra.stoneInfo = stone;
  }
  // Add Functions
  addBG() {
    const bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
    bg.tint = 0x009900;
    bg.alpha = .8;
    bg.width = W;
    bg.height = H;
    this.stage.addChild(bg);
  }

  addPlayers() {
    this.playerLocations.forEach((e, i) => {
      const playerCon = new PIXI.Container();
      const player = PIXI.Sprite.from("images/player.png");
      const playerCountBar = PIXI.Sprite.from(PIXI.Texture.WHITE);

      playerCon.x = e.x;
      playerCon.y = e.y;

      player.width = 77 * 2.5;
      player.height = 49 * 2.5;
      player.x = -(77 * 2.5) / 2;
      player.y = -(49 * 2.5) / 2;
      playerCon.rotation = -Math.PI / 2 + Math.PI / 2 * i;

      playerCountBar.width = 0;
      playerCountBar.height = 20;
      playerCountBar.tint = 0x009900;
      playerCountBar.x = -player.width / 2;
      playerCountBar.y = player.height / 2 + 5;

      playerCon.addChild(player, playerCountBar);
      this.players.push(playerCon);
      this.stage.addChild(playerCon);
    })
  }

  addStone({ x, y }: { x: number, y: number }, { c, n, id, o, fo }: StoneInfo) {
    const stoneCon = new PIXI.Container() as Stone;
    const stoneBG = PIXI.Sprite.from('images/tas.png');
    const stoneShape = PIXI.Sprite.from('images/shape2.png');
    const stoneCircle = PIXI.Sprite.from('images/circle.png');
    const stoneNum = new PIXI.Text(n + "", { fontSize: this.fontSizeForStone });

    stoneNum.y = -14;
    stoneNum.anchor.set(.5);

    stoneBG.width = this.stoneInfo.width;
    stoneBG.height = this.stoneInfo.height;
    stoneBG.anchor.set(.5);

    stoneShape.width = this.stoneInfo.width;
    stoneShape.height = this.stoneInfo.height / 5 * 2;
    stoneShape.anchor.set(.5, 1);
    stoneShape.y = this.stoneInfo.height / 2;
    stoneShape.tint = this.returnColor(c);

    stoneCircle.width = this.circleSize;
    stoneCircle.height = this.circleSize;
    stoneCircle.anchor.set(.5);
    stoneCircle.y = this.stoneInfo.height / 40 * 9;

    stoneCon.extra = { stoneInfo: { c, n, id } } as StoneExtra;
    stoneCon.width = this.stoneInfo.width;
    stoneCon.height = this.stoneInfo.height;
    stoneCon.x = x;
    stoneCon.y = y;
    stoneCon.pivot.x = stoneCon.width / 2;
    stoneCon.pivot.y = stoneCon.height / 2;

    stoneCon.addChild(stoneBG, stoneShape, stoneCircle, stoneNum);
    this.stage.addChild(stoneCon);
    return stoneCon;
  }

  addClosedStone(n: number, { x, y }: { x: number, y: number }) {
    return this.addStone({ x, y }, { c: Color.White, n, id: -1 })
  }

  addIndicatorStone() {
    const stone = this.acikTas;
    const stn = this.addStone({ x: 0, y: 0 }, stone);
    this.tasAtmayerleri[4].addChild(stn);
  }

  addFakeOkeyStone({ x, y }: { x: number, y: number }, stone: StoneInfo) {
    const color = 0x125975;
    const stn = this.addStone({ x, y }, stone);
    stn.children.splice(stn.children.length - 1, 1);
    (stn.children[1] as PIXI.Sprite).tint = color;

    const bigCircle = PIXI.Sprite.from('images/circle.png');
    bigCircle.anchor.set(.5);
    bigCircle.width = 30;
    bigCircle.height = 30;
    bigCircle.x = 0;
    bigCircle.y = -15;
    bigCircle.tint = color;

    const smallCircle = PIXI.Sprite.from('images/circle.png');
    smallCircle.anchor.set(.5);
    smallCircle.width = 22;
    smallCircle.height = 22;
    smallCircle.x = 0;
    smallCircle.y = -15;
    stn.addChild(bigCircle, smallCircle);
    return stn;
  }

  addTasAltligi() {
    const w = this.mobil ? 1 : 1.3;
    const h = this.mobil ? 1 : 1.17;
    this.tasAtmaYerleriArr.forEach(e => {
      const tasaltligiCon = new PIXI.Container();
      const tasaltligi = PIXI.Sprite.from(this.mobil ? "images/tas.png" : "images/tas_altligi.png");
      if (this.mobil) {
        tasaltligi.tint = 0x000000;
        tasaltligi.alpha = .1
      }
      tasaltligi.width = w * this.stoneInfo.width
      tasaltligi.height = h * this.stoneInfo.height;
      tasaltligiCon.x = e.x;
      tasaltligiCon.y = e.y;
      tasaltligi.anchor.set(.5);
      tasaltligiCon.addChild(tasaltligi);
      this.tasAtmayerleri.push(tasaltligiCon);
      this.stage.addChild(tasaltligiCon);
    })
  }

  private addIstaka() {
    const istaka = PIXI.Sprite.from('images/istaka.png');
    istaka.width = this.istakaInfo.w;
    istaka.height = this.istakaInfo.h;
    istaka.x = this.istakaInfo.x;
    istaka.y = this.istakaInfo.y;
    this.stage.addChild(istaka);
    return istaka
  }

  addButtons() {
    const ButtonCiftDiz = PIXI.Sprite.from("images/cift.png");
    ButtonCiftDiz.width = this.stoneInfo.width * 2 - 10;
    ButtonCiftDiz.height = this.stoneInfo.height * 2;
    ButtonCiftDiz.x = this.istakaInfo.x - this.stoneInfo.width * 2;
    ButtonCiftDiz.y = this.istakaInfo.y + (this.istakaInfo.h - this.stoneInfo.height * 2) / 2;
    ButtonCiftDiz.interactive = true;
    ButtonCiftDiz.on('pointerdown', this.alignCift);

    const ButtonSeriDiz = PIXI.Sprite.from("images/seri.png");
    ButtonSeriDiz.width = this.stoneInfo.width * 2 - 10;
    ButtonSeriDiz.height = this.stoneInfo.height * 2;
    ButtonSeriDiz.x = this.istakaInfo.x + this.istakaInfo.w + 10;
    ButtonSeriDiz.y = this.istakaInfo.y + (this.istakaInfo.h - this.stoneInfo.height * 2) / 2;
    ButtonSeriDiz.interactive = true;
    ButtonSeriDiz.on('pointerdown', this.alignSeri);

    this.stage.addChild(ButtonCiftDiz, ButtonSeriDiz);
  }

  // End Add Functions

  private itsMyTurn() {
    this.tasAtmayerleri.forEach(e => e.children.forEach((s, i) => i > 0 ? (s as Stone).extra.dontMove = false : ""));
    this.tasCektim = false;
    this.myTurn = true;
  }

  private controlFinish(stone: StoneExtra): Boolean | Array<Array<StoneInfo>> {

    let dizi: StoneInfo[][] = [];
    let per: StoneInfo[] = [];
    let dizitype: number = 0;// 0 boş değer | 1 seri dizi | 2 çift dizi
    const controlPer = (): Boolean => {
      if (per.length == 1) return false;
      if (dizitype == 0) dizitype = per.length == 2 ? 2 : 1;
      const okeyStones: StoneInfo[] = per.filter(e => e.n == this.acikTas.n + 1 && e.c == this.acikTas.c)
      if (dizitype == 2) {
        if (!(okeyStones.length > 0 || (per[0].c == per[1].c && per[0].n == per[1].n))) {
          per = [];
          return false
        }
      }
      else {
        if (per.length < 3) return false;
        // aynı sayı
        let diff = per.filter(x => !okeyStones.includes(x));
        if (per.length > 0 &&
          diff.filter(e => e.n == diff[0].n).length + okeyStones.length == per.length &&
          diff.filter(e => e.c == Color.Blue).length < 2 &&
          diff.filter(e => e.c == Color.Black).length < 2 &&
          diff.filter(e => e.c == Color.Yellow).length < 2 &&
          diff.filter(e => e.c == Color.Red).length < 2) {
          dizi.push(per);
          per = []
          return true
        } else {
          let index: number = -1;
          const perArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1];
          function ardasikControl(per: StoneInfo[]) {
            for (let i = 0; i < per.length; i++) {
              if (index + i > 13) return false;
              const e = per[i];
              const okey = okeyStones.includes(e);
              if (i == 0 && !okey) {
                if (e.n == 1) index = 0;
                else index = perArr.indexOf(e.n);
              }
              if (i > 0) {
                if (index == -1 && !okey) {//Önceki taş/lar okey ise
                  if ((i == 1 && e.n < 2) || (i == 2 && e.n < 3)) { //i eşittir 1 ya da 2 olabilir
                    per = [];
                    return false;
                  } else index = perArr.indexOf(e.n - i);
                }
                if (!okey && perArr[index + i] != e.n) { //okeyse veya sıradaki taşsa doğru değilse yanlış
                  per = [];
                  return false;
                } else if (i == per.length - 1) {
                  dizi.push(per);
                  per = [];
                  return true;
                }
              }
            }
          }
          const ardasik = ardasikControl(per);
          if (!ardasik) {
            const reversePer = per.reverse();
            return ardasikControl(reversePer);
          } else return ardasik;
        }
      }
    }
    //finished controlPer func

    for (let i = 0; i < 32; i++) {
      const x = i > 15 ? i - 16 : i;
      const y = i > 15 ? 1 : 0;
      if (`${x}x${y}` != stone.indexXY) {
        const el = this.indexs[`${x}x${y}`];
        el && per.push(el.extra.stoneInfo);
        if (!el && per.length > 0) {
          const durum: Boolean = controlPer();
          console.log("durum:", durum);
          if (!durum) return false
        }
      }
    }
    return dizi;
  }
  private align(stoneDt: StoneInfo[], dizim: StoneInfo[][]) {
    let perdizIndexX = 0;
    let perdizIndexY = 0;
    const tasyerlestir = (elem: StoneInfo) => {
      const dt = this.putStoneOnIstaka(perdizIndexX, perdizIndexY);
      let stone: Stone = stones.filter(E => E.extra.stoneInfo.id == elem.id)[0];
      this.gotoIstaka(stone, dt);
      perdizIndexX++
    }
    const stones: Stone[] = Object.values(this.indexs);
    this.indexs = {};
    dizim.forEach((e, i) => {
      if (perdizIndexX + e.length > 15) {
        perdizIndexX = 0;
        perdizIndexY = 1;
      }
      e.forEach((ee, ii) => {
        tasyerlestir(ee);
        if (ii == dizim[i].length - 1) {
          perdizIndexX++
        }
      })
    });
    stoneDt.sort((a, b) => a.n - b.n).forEach(e => {
      if (perdizIndexX > 15) { perdizIndexX = 0; perdizIndexY = 1 };
      tasyerlestir(e);
    })
  }
  private alignSeri = () => {
    if (this.stoneData.length == 0) return;
    let stoneDt: StoneInfo[] = [...this.stoneData] // for clone this.stoneData array
    let dizim: StoneInfo[][] = [];
    const colors: Color[] = Object.values(Color)
    let per: StoneInfo[] = [];
    let okeys: StoneInfo[] = [];
    const addOkeyStone = () => {
      per.push(okeys[0]);
      dizim.push(per);
      per.forEach(e => stoneDt.splice(stoneDt.indexOf(e), 1))
    }
    const perAyir = () => {
      dizim.push(per);
      per.forEach(e => stoneDt.splice(stoneDt.indexOf(e), 1));
    }
    const perDizme = () => {
      colors.forEach(clr => {
        let stones = stoneDt.filter(e => e.c == clr).sort((a, b) => a.n - b.n)
        stones.forEach((e, i) => {
          if (per.length > 0 && per[per.length - 1].n != e.n && per[per.length - 1].n != e.n - 1) {
            if (per.length >= 3) perAyir();
            if (per.length >= 2 && okeys.length > 0) addOkeyStone();
            per = [];
          }
          if (i == stones.length - 1 && per.length > 0) {
            if (per[per.length - 1].n != e.n) per.push(e);
            if (per[per.length - 1].n == 13 && stones[0].n == 1 && stones[0].id != per[0].id) per.push(stones[0]);
            if (per.length >= 3) perAyir();
            per = [];
            return;
          }
          if (per.length == 0 || per[per.length - 1].n != e.n) per.push(e);
        });
      });
      const unique = stoneDt.sort((a, b) => a.n - b.n).filter((v, i) => {
        if (i == 0) return v;
        if (i > 0 && v.n != stoneDt[i - 1].n) return v;
      });
      unique.forEach((e, i) => {
        const filtStones = stoneDt.filter(el => el.n == e.n);
        if (filtStones.length > 2) {
          for (let i = 0; i < 2; i++) {
            let clrs: StoneInfo[] = [];
            clrs.push(filtStones.filter(e => e.c == Color.Red)[0],
              filtStones.filter(e => e.c == Color.Blue)[0],
              filtStones.filter(e => e.c == Color.Yellow)[0],
              filtStones.filter(e => e.c == Color.Black)[0])

            per = clrs.filter(e => e !== undefined);
            if (per.length >= 2 && okeys.length > 0) addOkeyStone();
            if (per.length >= 3) {
              per.forEach(e => filtStones.splice(filtStones.indexOf(e), 1));
              perAyir()
            };
            per = [];
          }
        }
      });
    }
    perDizme();
    // OKEY ARAMA, VARSA VE PER OLUŞTURULUYORSA OLUŞTURMA KISMI
    okeys = stoneDt.filter(e => e.o);
    okeys.length > 0 && perDizme();
    // OKEY ARAMA, VARSA VE PER OLUŞTURULUYORSA OLUŞTURMA KISMI BİTTİ
    this.align(stoneDt, dizim);
  }
  private alignCift = () => {
    if (this.stoneData.length == 0) return;
    let stoneDt: StoneInfo[] = [...this.stoneData] // for clone this.stoneData array
    let dizim: StoneInfo[][] = [];
    const colors: String[] = [Color.Black, Color.Blue, Color.Red, Color.Yellow];
    const okeys = stoneDt.filter(e => e.o);
    okeys.forEach(e => stoneDt.splice(stoneDt.indexOf(e), 1));

    colors.forEach(clr => {
      let stones: StoneInfo[] = stoneDt.filter(e => e.c == clr).sort((a, b) => a.n - b.n);
      for (let i = 0; i < 13; i++) {
        const cift = stones.filter(e => e.n == i + 1);
        if (cift.length == 2) {
          dizim.push(cift);
          cift.forEach(e => stoneDt.splice(stoneDt.indexOf(e), 1));
        };
      }
    });

    okeys.forEach(e => {
      dizim.push([stoneDt[0], e]);
      stoneDt.splice(0, 1);
    })
    this.align(stoneDt, dizim);
  }
  private putStoneOnIstaka(indexX: number, indexY: number) {
    const h = this.mobil ? 115 : 90
    if (indexX > 15) indexX = 15;
    if (indexX < 0) indexX = 0;
    if (indexY > 1) indexY = 1;
    if (indexY < 0) indexY = 0;
    let x = this.istaka.x + 35 + indexX * this.stoneInfo.width + this.stoneInfo.width / 2;
    let y = this.istaka.y + indexY * h + this.stoneInfo.height / 2 + 5;
    return { x, y, indexX, indexY }
  }
  private putStoneOnTasYerlestirmeYeri(stone: Stone, index: number) {
    stone.x = 0;
    stone.y = 0;
    stone.parent.removeChild(stone);
    this.tasAtmayerleri[index].addChild(stone);
  }
  private putStoneOnTasYerlestirmeYeriForMiddle(n: number) {
    const stone = this.addClosedStone(n, { x: 0, y: 0 });
    this.createDragAndDropFor(stone);
    stone.parent.removeChild(stone);
    this.tasAtmayerleri[5].addChild(stone);
    if (this.tasCektim) stone.extra.dontMove = true;
  }
  private collide(stone: Stone) {
    let collide: boolean = false;
    const Arr = [this.istaka, this.tasAtmayerleri[1], this.tasAtmayerleri[4]];
    if (!stone) return;
    const stoneRect = stone.getBounds();
    const l = this.myTurn ? Arr.length : 1;
    for (let i = 0; i < l; i++) {
      const e = Arr[i].getBounds();
      if (stoneRect.x + stoneRect.width > e.x && stoneRect.x < e.x + e.width && stoneRect.y + stoneRect.height > e.y && stoneRect.y < e.y + e.height) {
        collide = true;
        if (i == 0) this.placeStoneonIstaka(stone);
        else if (i == 1) this.placeStoneonTasAtmaYeri(stone, Arr[i], 1);
        else if (i == 2) this.placeStoneonTasAtmaYeri(stone, Arr[i], 4);
      };
    }
    if (!collide) {
      this.moveStone(stone, stone.extra.prevX, stone.extra.prevY)
    }
  }
  private slideTheStones(dt: { x: number, y: number, indexX: number, indexY: number }) {
    let stoneArr: { stone: Stone, x: number, y: number, indexX: number, indexY: number }[] = [];
    let lforRight = 30 - dt.indexX - 15 * dt.indexY;
    let lforLeft = dt.indexX + 15 * dt.indexY + 1;
    const slide = (l: number, d: -1 | 1) => {
      for (let i = 0; i < l; i++ * d) {
        let indexx: number;
        let indexy: number;
        if (dt.indexX + i * d > 15) {
          indexx = dt.indexX + i * d - 16;
          indexy = 1;
        } else {
          indexx = dt.indexX + i * d;
          indexy = dt.indexY
        }
        let stone = this.indexs[`${indexx}x${indexy}`];
        if (stone) {
          let newIndexX: number;
          let newIndexY: number;
          if (indexx + 1 * d > 15) {
            newIndexX = indexx + 1 * d - 16;
            newIndexY = 1;
          } else {
            newIndexX = indexx + 1 * d;
            newIndexY = indexy
          }
          delete this.indexs[`${indexx}x${indexy}`];
          let xy = this.putStoneOnIstaka(newIndexX, newIndexY);
          stoneArr.push({ stone: stone, x: xy.x, y: xy.y, indexX: xy.indexX, indexY: xy.indexY });
        } else {
          break;
        }
      }
    }

    for (let i = 0; i < lforRight + 1; i++) {
      let indexx: number;
      let indexy: number;
      if (dt.indexX + i > 15) {
        indexx = dt.indexX + i - 16;
        indexy = 1;
      }
      else {
        indexx = dt.indexX + i;
        indexy = dt.indexY;
      }
      if (indexx > 15) indexx = 15;
      let stone = this.indexs[`${indexx}x${indexy}`];
      if (!stone) slide(lforRight, 1);
      if (stone && i == lforRight) {
        slide(lforLeft, -1);
      }
    }
    stoneArr.forEach(e => this.gotoIstaka(e.stone, { x: e.x, y: e.y, indexX: e.indexX, indexY: e.indexY }));
  }
  private placeStoneonIstaka(stone: Stone) {
    let indexX = Math.floor((stone.position.x - this.istaka.x - 35) / this.stoneInfo.width);
    let indexY = Math.floor((stone.position.y - (H - this.istaka.height)) / 115);
    const dt = this.putStoneOnIstaka(indexX, indexY);
    if (!stone.extra.indexXY) {
      //TO DO socket e istek gönder taş çekildi...
      if (stone.extra.stoneInfo.id == -1) {
        this.ortadanCekilenTas = stone;
        this.ortadanCekilenTasAtama();
        this.kapaliTasSayisi--;
        this.addNewCloseStone();
      }
      stone.extra.stoneInfo.o = this.controlOkeyStone(stone.extra.stoneInfo);
      this.stoneData.push(stone.extra.stoneInfo);
      this.tasAtmayerleri.forEach(e => e.children.forEach((s, i) => i > 0 ? (s as Stone).extra.dontMove = true : ""));
      this.tasCektim = true;
    }
    if (stone.extra.indexXY) delete this.indexs[stone.extra.indexXY + ""];

    this.slideTheStones(dt);
    stone.extra.indexXY = `${dt.indexX}x${dt.indexY}`;
    this.indexs[`${dt.indexX}x${dt.indexY}`] = stone;
    Object.assign(stone, { x: dt.x, y: dt.y });
  }
  private placeStoneonTasAtmaYeri(stone: Stone, e: PIXI.Container, arrayIndex: number) {
    if (!this.tasCektim) {
      this.moveStone(stone, stone.extra.prevX, stone.extra.prevY);
      return;
    }
    if (arrayIndex == 4) {
      const result = this.controlFinish(stone.extra);
      if (!result) {
        this.moveStone(stone, stone.extra.prevX, stone.extra.prevY);
        alert("olmamış bu");
        return;
      }
      else {
        // TO DO backend e gönder diziyi
      }
    }
    stone.parent.removeChild(stone);
    this.tasAtmayerleri[arrayIndex].addChild(stone);
    e.addChild(stone);
    if (stone.extra.indexXY) {
      delete this.indexs[stone.extra.indexXY + ""]
      delete stone.extra.indexXY;
      this.stoneData.forEach((e, i) => {
        if (e.id == stone.extra.stoneInfo.id) {
          this.stoneData.splice(i, 1);
          this.myTurn = false;
        }
      })
    }
    stone.x = 0;
    stone.y = 0;
    stone.extra.dontMove = true;
  }
  private createDragAndDropFor(target: Stone) {
    target.interactive = true;
    target.on("pointerdown", (e) => {
      if (target.extra.dontMove) return;
      if (target.parent == this.tasAtmayerleri[0]) {
        target.x = this.tasAtmayerleri[0].x;
        target.y = this.tasAtmayerleri[0].y;
      }
      if (target.parent == this.tasAtmayerleri[5]) {
        target.x = this.tasAtmayerleri[5].x;
        target.y = this.tasAtmayerleri[5].y;
      }
      target.extra.move = true;
      target.extra.prevX = target.x;
      target.extra.prevY = target.y;
      const stone = target;
      stone.parent.removeChild(stone);
      this.stage.addChild(stone);
    });
    target.on("pointerup", (e) => {
      if (target.extra.dontMove) return;
      target.extra.move = false;
      this.collide(target);
    });
    target.on("pointermove", (e) => {
      if (target.extra.move) {
        target.position.x = e.data.global.x * (1 / this.scale) //e.data.originalEvent.movementX * (1/this.scale);
        target.position.y = e.data.global.y * (1 / this.scale)//e.data.originalEvent.movementY * (1/this.scale);
      }
    });
  }
  private moveStone(stone: Stone, x: number, y: number, fn?: () => void) {
    stone.extra.prevX = stone.x;
    stone.extra.prevY = stone.y;
    const brmX = (x - stone.x) / 10;
    const brmY = (y - stone.y) / 10;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      stone.x += brmX;
      stone.y += brmY;
      if (i == 10) {
        clearInterval(interval);
        if (fn) fn();
      }
    }, 20);
  }
  private gotoIstaka(stone: Stone, { x, y, indexX, indexY }: { x: number, y: number, indexX: number, indexY: number }) {
    this.moveStone(stone, x, y);
    stone.extra.indexXY = `${indexX}x${indexY}`;
    this.indexs[`${indexX}x${indexY}`] = stone;
  }

  throwStone(id: number, stone: StoneInfo) {
    const ply = this.idSiralama[id + ""];
    const Stone = this.addStone(ply.ply, stone);
    const callbackFunc = () => {
      this.putStoneOnTasYerlestirmeYeri(Stone, ply.next.i);
      if (id + 1 == this.myID || id - 3 == this.myID) {
        this.createDragAndDropFor(Stone);
        Stone.extra.dontMove = false;
      }
    }
    this.moveStone(Stone, ply.next.yer.x, ply.next.yer.y, callbackFunc);
  }

  pullStoneforOtherPlayer(playerID: number, ortadan?: boolean) {
    if (ortadan && this.kapaliTasSayisi == 0) return;
    const plyInfo = this.idSiralama[playerID];
    const n = ortadan ? 5 : plyInfo.prev.i;
    const tasYeri = this.tasAtmayerleri[n];
    const stone = tasYeri.children[tasYeri.children.length - 1];
    stone.parent.removeChild(stone)
    Object.assign(stone, this.tasAtmaYerleriArr[n]);
    this.stage.addChild(stone);
    const deleteStone = () => stone.parent.removeChild(stone);
    this.moveStone(stone as Stone, plyInfo.ply.x, plyInfo.ply.y, deleteStone);
    if (n == 5) {
      this.kapaliTasSayisi--;
      this.addNewCloseStone();
    }
  }

  addNewCloseStone() {
    if (this.kapaliTasSayisi < 2) return;
    const lastStone = this.tasAtmayerleri[5].children[this.tasAtmayerleri[5].children.length - 1];
    lastStone.parent.removeChild(lastStone);
    this.putStoneOnTasYerlestirmeYeriForMiddle(this.kapaliTasSayisi - 1);
    this.tasAtmayerleri[5].addChild(lastStone);
  }

  controlOkeyStone = (e: StoneInfo) => (e.c == this.acikTas.c && this.acikTas.n + 1 == e.n) ? true : false;
  controlFakeOkeyStone = (e: StoneInfo) => (e.fo ? { n: this.acikTas.n + 1, c: this.acikTas.c } : { fo: false }) as StoneInfo;

  idSiralamaFunc() {
    this.playerLocations.forEach((e, i) => {
      const id = this.myID + i + 1 > 4 ? this.myID + i + 1 - 4 : this.myID + i + 1;
      const nextTasIndex = i + 2 > 3 ? 0 : i + 2;
      const prevTasIndex = nextTasIndex - 1 == -1 ? 3 : nextTasIndex - 1;
      const nextTasAtmaYeri = this.tasAtmaYerleriArr[nextTasIndex];
      const prevTasAtmaYeri = this.tasAtmaYerleriArr[prevTasIndex]
      this.idSiralama[id] = { ply: e, index: i, next: { yer: nextTasAtmaYeri, i: nextTasIndex }, prev: { yer: prevTasAtmaYeri, i: prevTasIndex } };
    })
  }
  taslariYerlestir() {
    this.stoneData.forEach((e, i) => {
      let stone: Stone;

      e.o = this.controlOkeyStone(e);
      Object.assign(e, this.controlFakeOkeyStone(e));

      if (e.fo) stone = this.addFakeOkeyStone(this.tasAtmayerleri[5], e)
      else stone = this.addStone(this.tasAtmaYerleriArr[5], e);
      const dt = this.putStoneOnIstaka(i, 0);
      this.createDragAndDropFor(stone);
      this.gotoIstaka(stone, dt);
    });
  }
  showAvaliablePlayers(n: number) {
    for (let i = 1; i < 5; i++) {
      (this.playerBar.children[i] as Sprite).tint = i <= n ? 0x32CD32 : 0xFFFFFF;
    }
  }
  getCountDown(id: number, count: number) {
    const i = this.idSiralama[id].index;
    const w = 77 * 2.5;
    const el = (this.players[i].children[1] as Sprite);
    el.width = count / 30 * w;
  }
  getGameData() {
    this.stoneData = this.sockettenGelenOyunDatasi.myStones;
    this.kapaliTasSayisi = this.sockettenGelenOyunDatasi.kapaliTasSayisi;
    this.myID = this.sockettenGelenOyunDatasi.myID;
    this.acikTas = this.sockettenGelenOyunDatasi.acikTas;
  }
  createGame() {
    this.addIndicatorStone();
    this.idSiralamaFunc();
    this.putStoneOnTasYerlestirmeYeriForMiddle(this.kapaliTasSayisi - 1);
    this.putStoneOnTasYerlestirmeYeriForMiddle(this.kapaliTasSayisi);
    this.taslariYerlestir();
  }
  private startGame() {
    this.addBG();
    this.addPlayers();
    !this.mobil && this.addButtons();
    this.istaka = this.addIstaka();
    this.addTasAltligi();
    this.getGameData();
    this.createGame();
    this.showAvaliablePlayers(2);
    this.getCountDown(1, 10);
    this.stage.interactive = true;
  }
}
function calculateScale() {
  const sW = (screen.width > 1024 ? window.innerWidth : screen.width) / W;
  const sH = (screen.width > 1024 ? window.innerHeight : screen.height) / H;
  const s = sW > sH ? sH : sW;
  (window as any).context = new Game(s, screen.width > 1024 ? false : true);
}
calculateScale();