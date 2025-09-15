// src/core/PomodoroTimer.ts
import { EventEmitter } from 'events';
import { TimerState } from '../constants';

export interface ITimerState {
    isRunning: boolean;
    remainingTime: number;
    totalTime: number;
    currentState: TimerState;
}

export class PomodoroTimer extends EventEmitter {
    private timerId: NodeJS.Timeout | null = null;
    private remainingTime: number = 0;
    private totalTime: number = 0;
    private isRunning: boolean = false;
    private currentState: TimerState = TimerState.IDLE;

    public start(durationInSeconds: number, state: TimerState = TimerState.FOCUS) {
        if (this.timerId) {
            this.stop();
        }

        if (durationInSeconds <= 0) {
            throw new Error('Duration must be greater than 0');
        }

        this.remainingTime = durationInSeconds;
        this.totalTime = durationInSeconds;
        this.isRunning = true;
        this.currentState = state;
        
        this.emit('started', { state, duration: durationInSeconds });
        this.emit('tick', this.getState());

        this.timerId = setInterval(() => {
            try {
                this.remainingTime -= 1;
                this.emit('tick', this.getState());

                if (this.remainingTime <= 0) {
                    this.complete();
                }
            } catch (error) {
                console.error('Error in timer tick:', error);
                this.stop();
                this.emit('error', error);
            }
        }, 1000);
    }

    public stop() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.isRunning = false;
        this.emit('stopped', this.getState());
    }

    public reset() {
        this.stop();
        this.remainingTime = 0;
        this.totalTime = 0;
        this.currentState = TimerState.IDLE;
        this.emit('reset');
    }

    public pause() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
            this.isRunning = false;
            this.emit('paused', this.getState());
        }
    }

    public resume() {
        if (!this.isRunning && this.remainingTime > 0) {
            this.start(this.remainingTime, this.currentState);
        }
    }

    public getState(): ITimerState {
        return {
            isRunning: this.isRunning,
            remainingTime: this.remainingTime,
            totalTime: this.totalTime,
            currentState: this.currentState
        };
    }

    public getRemainingTime(): number {
        return this.remainingTime;
    }

    public getProgress(): number {
        if (this.totalTime === 0) {return 0;}
        return ((this.totalTime - this.remainingTime) / this.totalTime) * 100;
    }

    private complete() {
        const completedState = this.currentState;
        this.stop();
        this.currentState = TimerState.IDLE;
        this.emit('finished', { state: completedState, wasSuccessful: true });
    }
}