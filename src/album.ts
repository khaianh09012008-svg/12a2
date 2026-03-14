/**
 * Album data for the 12A2 Time Tunnel project.
 * This file contains configurations for:
 * 1. Flying Polaroid photos in the background.
 * 2. Elements and photos attached to the main 12A2 board.
 */

export interface PolaroidPhoto {
  id: string;
  url: string;
  caption?: string;
  rotation?: number; // Initial rotation
}

export interface BoardElement {
  id: string;
  url: string;
  link?: string;
  type: 'photo' | 'sticker' | 'note' | 'drawing' | 'group-photo'
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  width: number; // Width in pixels or percentage
  rotation?: number;
  zIndex?: number;
}

// Photos that will fly in the "Time Tunnel" background
export const TUNNEL_POLAROIDS: PolaroidPhoto[] = [
  {
    id: 'p1',
    url: '/photo/F1.jpg',
    caption: '',
    rotation: -2
  },
  {
    id: 'p2',
    url: '/photo/F2.jpg',
    caption: '',
    rotation: -5
  },
  {
    id: 'p3',
    url: '/photo/F4.jpg',
    caption: '',
    rotation: -3
  },
  {
    id: 'p4',
    url: '/photo/F5.jpg',
    caption: '',
    rotation: 0
  },
  {
    id: 'p5',
    url: '/photo/F6.jpg',
    caption: '',
    rotation: -7
  },
  {
    id: 'p6',
    url: '/photo/F7.jpg',
    caption: '',
    rotation: 8
  },
  {
    id: 'p7',
    url: '/photo/F8.jpg',
    caption: '',
    rotation: -2
  },
  {
    id: 'p8',
    url: '/photo/F3.jpg',
    caption: '',
    rotation: 12
  },
  {
    id: 'p9',
    url: '/photo/F9.jpg',
    caption: '',
    rotation: -10
  },
  {
    id: 'p10',
    url: '/photo/F10.jpg',
    caption: '',
    rotation: -6
  },
];

// Elements attached to the main 12A2 board
export const BOARD_ASSETS: BoardElement[] = [
  {
    id: 'b1',
    url: '/photo/GDTH.png',
    link: '/gdth/gdth.html',
    type: 'sticker',
    x: -1,
    y: 2,
    width: 1400,
    rotation: 0,
    zIndex: 10
  },
  {
    id: 'b2',
    url: '/photo/THANHLICH.png',
    link: '/Thanh lịch/thanh lịch.html',
    type: 'sticker',
    x: 20,
    y: 3,
    width: 1100,
    rotation: 0,
    zIndex: 11
  },
  {
    id: 'b3',
    url: '/photo/GDTHNAME.png',
    type: 'sticker',
    x: 1,
    y: 22,
    width: 1100,
    rotation: 0,
    zIndex: 11
  },
  {
    id: 'b4',
    url: '/photo/THANHLICHNAME.png',
    type: 'sticker',
    x: 20,
    y: 18,
    width: 1100,
    rotation: 0,
    zIndex: 11
  },
    {
    id: 's1',
    url: '/photo/1911.png',
    link: '/19_11/19_11.html',
    type: 'sticker',
    x: 60,
    y: 3,
    width: 1300,
    rotation: 0,
    zIndex: 15
  },
  {
    id: 'b5',
    url: '/photo/1911NAME.png',
    type: 'sticker',
    x: 65,
    y: 18,
    width: 1000,
    rotation: 0,
    zIndex: 11
  },
];
