import { Injectable } from '@angular/core';
import { EMOJI_MAP } from './text-to-emoji';

@Injectable({
  providedIn: 'root',
})
export class ConvertTextToEmojiArtService {
  constructor() {}

  public convertTextToEmojiArt(text: string, emoji: string) {
    return text.split('').map((char) => {
      return (EMOJI_MAP[char.toUpperCase()] || EMOJI_MAP['\\s'])
        .map((row) => {
          return row.replaceAll('*', emoji).replaceAll('-', '⬜️');
        })
        .join('<br />');
    });
  }
}
