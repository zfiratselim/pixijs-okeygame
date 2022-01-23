import { Coordinate } from "./interface";

export const W = 1362;
export const H = 771;

export const stoneInfo = {
  width: 62,
  height: 85,
}

export const istakaInfo = {
  w: 1062,
  h: 197,
  x: 150,
  y: H - 197
}

export const tasAtmaYerleriArr: Coordinate[] = [
  { x: istakaInfo.x + istakaInfo.w - 100, y: 440 },
  { x: istakaInfo.x + 100, y: 440 },
  { x: istakaInfo.x + 100, y: 140 },
  { x: istakaInfo.x + istakaInfo.w - 100, y: 140 },
  { x: W / 2 - 50, y: H - (istakaInfo.h + 170) },
  { x: W / 2 + 50, y: H - (istakaInfo.h + 170) }
]

export const playerLocations: Coordinate[] = [
  { x: stoneInfo.width * 5 / 4 + 5, y: (tasAtmaYerleriArr[1].y + tasAtmaYerleriArr[2].y) / 2 },
  { x: istakaInfo.x + istakaInfo.w / 2, y: stoneInfo.height },
  { x: W - stoneInfo.width * 5 / 4 - 5, y: (tasAtmaYerleriArr[1].y + tasAtmaYerleriArr[2].y) / 2 }
]


// For Mobil
export const stoneInfoMobil={
  width: 80,
  height: 110,
}

export const istakaInfoMobil={
  w: 1362,
  h: 253,
  x: 0,
  y: H - 253

}

export const tasAtmaYerleriArrMobil: Coordinate[] = [
  { x: istakaInfoMobil.w - 250, y: 420 },
  { x: 150 + 100, y: 420 },
  { x: 150 + 100, y: 120 },
  { x: istakaInfoMobil.w - 250, y: 120 },
  { x: W / 2 - 50, y: H - (istakaInfoMobil.h + 150) },
  { x: W / 2 + 50, y: H - (istakaInfoMobil.h + 150) }
]

export const playerLocationsMobil: Coordinate[] = [
  { x: stoneInfoMobil.width * 5 / 4 + 5, y: (tasAtmaYerleriArrMobil[1].y + tasAtmaYerleriArrMobil[2].y) / 2 },
  { x: istakaInfoMobil.w / 2, y: stoneInfoMobil.height },
  { x: W - stoneInfoMobil.width * 5 / 4 - 5, y: (tasAtmaYerleriArrMobil[1].y + tasAtmaYerleriArrMobil[2].y) / 2 }
]
