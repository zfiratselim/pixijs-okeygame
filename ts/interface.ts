import * as PIXI from 'pixi.js';


export interface StoneInfo {
  c: Color,
  n: number,
  id: number,
  fo?: boolean,
  o?: boolean
}
export interface Coordinate {
  x: number,
  y: number
}
export interface UserInfoForStones {
  [index: string]: {
    index:number,
    ply: Coordinate,
    next: {
      i: number,
      yer: Coordinate

    }
    prev: {
      i: number,
      yer: Coordinate

    }
  }
}
export interface StoneExtra {
  move: boolean,
  dontMove: boolean,
  prevX: number,
  prevY: number,
  indexXY?: String,
  stoneInfo: StoneInfo

}
export interface Stone extends PIXI.Sprite {
  extra: StoneExtra
}

export enum Color {
  Red = "Red",
  Yellow = "Yellow",
  Blue = "Blue",
  Black = "Black",
  White = "White"
}