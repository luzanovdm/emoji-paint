import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { BehaviorSubject, map, tap } from 'rxjs';
import { ConvertTextToEmojiArtService } from './convert-text-to-emoji-art.service';
import {
  trigger,
  transition,
  style,
  animate,
  AUTO_STYLE,
} from '@angular/animations';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'ep-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    PickerModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('collapse', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('300ms ease-out', style({ height: AUTO_STYLE, opacity: 1 })),
      ]),
      transition(':leave', [
        style({ height: AUTO_STYLE, opacity: 1 }),
        animate('200ms ease-in', style({ height: 0, opacity: 0 })),
      ]),
    ]),
    trigger('stageInitialTransition', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateX(-100%)',
        }),
        animate(
          '100ms ease-in',
          style({
            opacity: 1,
            transform: 'translateX(0)',
          })
        ),
      ]),
      transition(':leave', [
        style({
          opacity: 1,
          transform: 'translateX(0)',
        }),
        animate(
          '300ms ease-out',
          style({
            opacity: 0,
            transform: 'translateX(-100%)',
          })
        ),
      ]),
    ]),
    trigger('stageResultTransition', [
      transition(':enter', [
        style({
          opacity: 0,
        }),
        animate(
          '100ms ease-in',
          style({
            opacity: 1,
          })
        ),
      ]),
      transition(':leave', [
        style({
          opacity: 1,
        }),
        animate(
          '300ms ease-out',
          style({
            opacity: 0,
          })
        ),
      ]),
    ]),
  ],
})
export class AppComponent {
  private latestValue = false;

  public readonly emojiSelectorShouldBeShown = new BehaviorSubject<boolean>(
    false
  );

  public readonly result = this.activatedRoute.queryParams.pipe(
    map((params) => {
      const { text, emoji } = params;

      if (!text) {
        return null;
      }

      return this.convertTextToEmojiArtService.convertTextToEmojiArt(
        text,
        emoji
      );
    }),
    tap((result) => (this.latestValue = !!result))
  );

  public readonly form = new FormGroup({
    text: new FormControl<string>('', [Validators.required]),
    emoji: new FormControl<string>('🍺'),
  });

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly convertTextToEmojiArtService: ConvertTextToEmojiArtService,
    private snackBar: MatSnackBar
  ) {}

  public goToResult(event: SubmitEvent): void {
    event.preventDefault();
    this.form.markAllAsTouched();

    if (!this.form.valid || !this.form.value.text) {
      return;
    }

    this.router.navigate(['/'], {
      queryParams: {
        text: this.form.value.text,
        emoji: this.form.value.emoji,
      },
    });
  }

  public emojiSelected(event: { emoji: { native: string } }): void {
    this.form.patchValue({ emoji: event.emoji.native });
    this.emojiSelectorShouldBeShown.next(false);
  }

  public toggleEmojiSelector(): void {
    this.emojiSelectorShouldBeShown.next(
      !this.emojiSelectorShouldBeShown.value
    );
  }

  public getAnimationDirection(index: number) {
    console.log(this.latestValue, { index });

    if (!this.latestValue && index === 0) {
      return 'current';
    }

    if (this.latestValue && index === 1) {
      return 'next';
    }

    if (this.latestValue && index === 0) {
      return 'previous';
    }

    return 'next';
  }

  public copyResult(element: HTMLParagraphElement): void {
    try {
      const content = element.innerText;
      navigator.clipboard.writeText(content);
      this.snackBar.open('Copied to clipboard!', '', {
        verticalPosition: 'top',
      });
    } catch (error) {
      // noop
      console.log(error);
    }
  }
}
