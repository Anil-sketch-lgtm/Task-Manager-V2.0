import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FocusService } from '../services/focus';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-focus-mode',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './focus-mode.html'
})
export class FocusMode implements OnDestroy {
  private focusService = inject(FocusService);

  // 25 minutes in seconds
  readonly WORK_DURATION = 25 * 60;
  timeRemaining = signal<number>(this.WORK_DURATION);
  isRunning = signal<boolean>(false);
  isBreak = signal<boolean>(false);
  interruptions = signal<number>(0);
  
  private timerInterval: any;
  private sessionStartTime: string | null = null;

  get formattedTime(): string {
    const time = this.timeRemaining();
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  toggleTimer() {
    if (this.isRunning()) {
      this.pauseTimer();
      // If pausing during a work session, count as interruption
      if (!this.isBreak()) this.interruptions.update(i => i + 1);
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    this.isRunning.set(true);
    if (!this.sessionStartTime && !this.isBreak()) {
      this.sessionStartTime = new Date().toISOString();
    }

    this.timerInterval = setInterval(() => {
      this.timeRemaining.update(time => time - 1);
      if (this.timeRemaining() <= 0) {
        this.completeSession();
      }
    }, 1000);
  }

  pauseTimer() {
    this.isRunning.set(false);
    clearInterval(this.timerInterval);
  }

  resetTimer() {
    this.pauseTimer();
    this.timeRemaining.set(this.isBreak() ? 5 * 60 : this.WORK_DURATION);
    this.sessionStartTime = null;
    this.interruptions.set(0);
  }

  completeSession() {
    this.pauseTimer();
    
    if (!this.isBreak()) {
      // Work session complete, log to backend
      if (this.sessionStartTime) {
        this.focusService.logSession({
          startTime: this.sessionStartTime,
          endTime: new Date().toISOString(),
          interruptions: this.interruptions()
        }).subscribe();
      }
      // Switch to break
      this.isBreak.set(true);
      this.timeRemaining.set(5 * 60); // 5 min break
    } else {
      // Break complete, switch to work
      this.isBreak.set(false);
      this.timeRemaining.set(this.WORK_DURATION);
    }
    
    this.sessionStartTime = null;
    this.interruptions.set(0);
  }

  ngOnDestroy() {
    this.pauseTimer();
  }
}
