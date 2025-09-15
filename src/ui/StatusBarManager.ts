// src/ui/StatusBarManager.ts
import * as vscode from 'vscode';
import { TimerState, TREE_THEMES, LOADING_FRAMES } from '../constants';

export class StatusBarManager {
    private statusBarItem: vscode.StatusBarItem;
    private animationFrame: number = 0;
    private loadingInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        this.statusBarItem.command = 'pinedoro.startFocus';
        this.statusBarItem.tooltip = 'Click to start Pinedoro timer';
    }

    public updateTimer(remainingTime: number, state: TimerState, progress?: number, soundIcon?: string) {
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const treeIcon = this.getTreeIcon(state, progress || 0);
        const progressIndicator = this.createMinimalistProgress(progress || 0, state);
        const soundIndicator = soundIcon ? ` ${soundIcon}` : '';
        
        this.statusBarItem.text = `${treeIcon} ${formattedTime} ${progressIndicator}${soundIndicator}`;
        this.statusBarItem.tooltip = this.getTooltipForState(state, formattedTime);
        this.statusBarItem.command = state === TimerState.IDLE ? 'pinedoro.startFocus' : 'pinedoro.stopTimer';
        
        this.statusBarItem.show();
    }

    public updateMessage(message: string, icon?: string, command?: string) {
        this.statusBarItem.text = `${icon ? `${icon} ` : '🌳 '}${message}`;
        this.statusBarItem.tooltip = message;
        this.statusBarItem.command = command || 'pinedoro.startFocus';
        this.statusBarItem.show();
    }

    public updateIdle(soundIcon?: string) {
        const soundIndicator = soundIcon ? ` ${soundIcon}` : '';
        this.statusBarItem.text = `🌳 Start Pinedoro${soundIndicator}`;
        this.statusBarItem.tooltip = 'Click to start a 25-minute focus session with tree growth';
        this.statusBarItem.command = 'pinedoro.startFocus';
        this.statusBarItem.show();
    }

    public showLoadingAnimation(message: string, duration: number = 2000) {
        this.clearLoadingAnimation();
        
        let frameIndex = 0;
        const frames = LOADING_FRAMES.TREE_GROWTH;
        
        this.loadingInterval = setInterval(() => {
            const frame = frames[frameIndex % frames.length];
            this.statusBarItem.text = `${frame} ${message}`;
            frameIndex++;
        }, 300);

        setTimeout(() => {
            this.clearLoadingAnimation();
        }, duration);
    }

    private clearLoadingAnimation() {
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
    }
    
    public hide() {
        this.statusBarItem.hide();
    }

    public dispose() {
        this.clearLoadingAnimation();
        this.statusBarItem.dispose();
    }

    private getTreeIcon(state: TimerState, progress: number): string {
        const theme = this.getTreeTheme(state);
        
        if (progress < 33) return theme.seed;
        if (progress < 66) return theme.growing;
        return theme.mature;
    }

    private getTreeTheme(state: TimerState) {
        switch (state) {
            case TimerState.FOCUS:
                return TREE_THEMES.FOCUS;
            case TimerState.SHORT_BREAK:
            case TimerState.LONG_BREAK:
                return TREE_THEMES.BREAK;
            case TimerState.CUSTOM:
                return TREE_THEMES.CUSTOM;
            default:
                return TREE_THEMES.FOCUS;
        }
    }

    private getTooltipForState(state: TimerState, timeLeft: string): string {
        switch (state) {
            case TimerState.FOCUS:
                return `🌱 Focus & grow: ${timeLeft} remaining. Click to stop.`;
            case TimerState.SHORT_BREAK:
                return `🍃 Rest & recharge: ${timeLeft} remaining. Click to stop.`;
            case TimerState.LONG_BREAK:
                return `🌲 Deep rest: ${timeLeft} remaining. Click to stop.`;
            case TimerState.CUSTOM:
                return `✨ Custom growth: ${timeLeft} remaining. Click to stop.`;
            default:
                return 'Click to start Pinedoro timer - watch your productivity grow';
        }
    }

    private createMinimalistProgress(progress: number, state: TimerState): string {
        const segments = 8;
        const filled = Math.round((progress / 100) * segments);
        const theme = this.getTreeTheme(state);
        
        // Minimalist dot progression
        let progressBar = '';
        for (let i = 0; i < segments; i++) {
            if (i < filled) {
                // Filled based on growth stage
                if (progress < 33) progressBar += '·';
                else if (progress < 66) progressBar += '•';
                else progressBar += '●';
            } else {
                progressBar += '○';
            }
        }
        
        return `[${progressBar}]`;
    }

    // Method to show growth notifications
    public showGrowthNotification(progress: number, state: TimerState) {
        const theme = this.getTreeTheme(state);
        let message = '';
        
        if (progress === 33) {
            message = `${theme.growing} Your focus is growing...`;
        } else if (progress === 66) {
            message = `${theme.mature} Almost there! Keep growing!`;
        } else if (progress === 90) {
            message = `${theme.mature} Final growth spurt! 🌟`;
        }
        
        if (message) {
            vscode.window.showInformationMessage(message);
        }
    }

    public showCodingProgress(summary: string) {
        // Update status bar tooltip with coding progress
        if (this.statusBarItem.text.includes('🌱') || this.statusBarItem.text.includes('🌿')) {
            this.statusBarItem.tooltip = `Pinedoro Timer\n${summary}`;
        }
    }
}