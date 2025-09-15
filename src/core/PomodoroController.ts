// src/core/PomodoroController.ts
import * as vscode from 'vscode';
import { PomodoroTimer, ITimerState } from './PomodoroTimer';
import { StatusBarManager } from '../ui/StatusBarManager';
import { SoundManager } from '../audio/SoundManager';
import { StatisticsManager } from '../data/StatisticsManager';
import { TimerState, FOCUS_DURATION, SHORT_BREAK_DURATION, LONG_BREAK_DURATION, PRESET_TIMES } from '../constants';

export class PomodoroController {
    private timer: PomodoroTimer;
    private statusBar: StatusBarManager;
    private soundManager: SoundManager;
    private statsManager: StatisticsManager;
    private completedSessions: number = 0;
    private currentSessionId: string | null = null;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.timer = new PomodoroTimer();
        this.statusBar = new StatusBarManager();
        this.soundManager = new SoundManager();
        this.statsManager = new StatisticsManager(context);
        this.setupEventListeners();
    }

    private setupEventListeners() {
        this.timer.on('tick', (state: ITimerState) => {
            const progress = this.timer.getProgress();
            const soundIcon = this.soundManager.getSoundIcon();
            
            this.statusBar.updateTimer(
                state.remainingTime, 
                state.currentState, 
                progress,
                soundIcon
            );
            
            // Update session stats
            if (this.currentSessionId) {
                const actualDuration = state.totalTime - state.remainingTime;
                this.statsManager.updateSession(actualDuration);
                
                // Show coding metrics for focus sessions
                if (state.currentState === TimerState.FOCUS) {
                    this.updateCodingMetrics();
                }
            }
            
            // Show growth progress notifications
            this.statusBar.showGrowthNotification(progress, state.currentState);
        });

        this.timer.on('finished', (data: { state: TimerState; wasSuccessful: boolean }) => {
            this.handleTimerFinished(data.state, data.wasSuccessful);
        });

        this.timer.on('stopped', () => {
            // Handle session interruption
            if (this.currentSessionId) {
                this.statsManager.interruptSession();
                this.currentSessionId = null;
            }
            
            const soundIcon = this.soundManager.getSoundIcon();
            this.statusBar.updateIdle(soundIcon);
        });

        this.timer.on('reset', () => {
            const soundIcon = this.soundManager.getSoundIcon();
            this.statusBar.updateIdle(soundIcon);
        });

        this.timer.on('error', (error: Error) => {
            this.statusBar.updateMessage(`Error: ${error.message}`, 'error');
            vscode.window.showErrorMessage(`Pomodoro Timer Error: ${error.message}`);
        });
    }

    private async handleTimerFinished(completedState: TimerState, wasSuccessful: boolean) {
        // Complete the session in statistics
        if (this.currentSessionId) {
            if (wasSuccessful) {
                this.statsManager.completeSession();
            } else {
                this.statsManager.interruptSession();
            }
            this.currentSessionId = null;
        }

        if (!wasSuccessful) {return;}

        if (completedState === TimerState.FOCUS) {
            this.completedSessions++;
            await this.showCompletionNotification(completedState);
            await this.promptForBreak();
        } else {
            await this.showCompletionNotification(completedState);
            this.statusBar.updateIdle();
        }
    }

    private async showCompletionNotification(state: TimerState) {
        const messages: Record<TimerState, string> = {
            [TimerState.FOCUS]: '🌳 Your focus tree has grown! Beautiful work!',
            [TimerState.SHORT_BREAK]: '🍃 Rest complete! Ready to grow again?',
            [TimerState.LONG_BREAK]: '🌲 Deep rest finished! You\'re renewed like a forest!',
            [TimerState.IDLE]: 'Session completed!',
            [TimerState.CUSTOM]: '✨ Custom growth completed! Well cultivated!'
        };

        const message = messages[state] || 'Growth session completed!';
        
        await vscode.window.showInformationMessage(message);
    }

    private async promptForBreak() {
        const isLongBreak = this.completedSessions % 4 === 0;
        const breakType = isLongBreak ? 'long break (15 min)' : 'short break (5 min)';
        
        const choice = await vscode.window.showInformationMessage(
            `Take a ${breakType}?`,
            'Yes', 'Skip', 'Start Focus'
        );

        switch (choice) {
            case 'Yes':
                if (isLongBreak) {
                    this.startLongBreak();
                } else {
                    this.startShortBreak();
                }
                break;
            case 'Start Focus':
                this.startFocus();
                break;
            default:
                this.statusBar.updateIdle();
        }
    }

    public startFocus() {
        try {
            this.statusBar.showLoadingAnimation('Planting your focus seed...', 1500);
            setTimeout(() => {
                // Start session tracking
                this.currentSessionId = this.statsManager.startSession(
                    TimerState.FOCUS, 
                    FOCUS_DURATION, 
                    this.soundManager.getCurrentSound()
                );
                
                this.timer.start(FOCUS_DURATION, TimerState.FOCUS);
                vscode.window.showInformationMessage('🌱 Focus session started! Watch your productivity tree grow.');
            }, 1500);
        } catch (error) {
            console.error('Error starting focus session:', error);
            this.statusBar.updateMessage('Error planting seed', '❌');
            vscode.window.showErrorMessage(`Failed to start focus session: ${error}`);
        }
    }

    public startShortBreak() {
        try {
            this.statusBar.showLoadingAnimation('Preparing restful grove...', 1000);
            setTimeout(() => {
                // Start session tracking
                this.currentSessionId = this.statsManager.startSession(
                    TimerState.SHORT_BREAK, 
                    SHORT_BREAK_DURATION, 
                    this.soundManager.getCurrentSound()
                );
                
                this.timer.start(SHORT_BREAK_DURATION, TimerState.SHORT_BREAK);
                vscode.window.showInformationMessage('🍃 Short break started! 5 minutes among the leaves.');
            }, 1000);
        } catch (error) {
            console.error('Error starting short break:', error);
            this.statusBar.updateMessage('Error creating grove', '❌');
            vscode.window.showErrorMessage(`Failed to start break: ${error}`);
        }
    }

    public startLongBreak() {
        try {
            this.statusBar.showLoadingAnimation('Growing peaceful forest...', 1200);
            setTimeout(() => {
                // Start session tracking
                this.currentSessionId = this.statsManager.startSession(
                    TimerState.LONG_BREAK, 
                    LONG_BREAK_DURATION, 
                    this.soundManager.getCurrentSound()
                );
                
                this.timer.start(LONG_BREAK_DURATION, TimerState.LONG_BREAK);
                vscode.window.showInformationMessage('🌲 Long break started! 15 minutes in the deep forest.');
            }, 1200);
        } catch (error) {
            console.error('Error starting long break:', error);
            this.statusBar.updateMessage('Error growing forest', '❌');
            vscode.window.showErrorMessage(`Failed to start break: ${error}`);
        }
    }

    public stopTimer() {
        try {
            const state = this.timer.getState();
            if (state.isRunning) {
                this.timer.stop();
                vscode.window.showInformationMessage('⏹️ Growth paused. Your tree awaits your return.');
            } else {
                this.statusBar.updateIdle();
            }
        } catch (error) {
            console.error('Error stopping timer:', error);
            vscode.window.showErrorMessage(`Failed to stop timer: ${error}`);
        }
    }

    public resetTimer() {
        try {
            this.timer.reset();
            this.completedSessions = 0;
            vscode.window.showInformationMessage('🔄 Forest cleared. Ready for new growth.');
        } catch (error) {
            console.error('Error resetting timer:', error);
            vscode.window.showErrorMessage(`Failed to reset timer: ${error}`);
        }
    }

    public pauseTimer() {
        try {
            this.timer.pause();
            vscode.window.showInformationMessage('⏸️ Timer paused.');
        } catch (error) {
            console.error('Error pausing timer:', error);
        }
    }

    public resumeTimer() {
        try {
            this.timer.resume();
            vscode.window.showInformationMessage('▶️ Timer resumed.');
        } catch (error) {
            console.error('Error resuming timer:', error);
        }
    }

    public async startCustomTimer() {
        try {
            const timeOption = await vscode.window.showQuickPick(
                PRESET_TIMES.map(preset => ({
                    label: preset.label,
                    description: preset.value > 0 ? `${preset.value} minutes of focused growth` : 'Enter custom growth time',
                    value: preset.value
                })),
                {
                    placeHolder: 'Select your growth duration',
                    title: '🌱 Custom Growth Timer'
                }
            );

            if (!timeOption) return;

            let minutes = timeOption.value;

            if (minutes === 0) {
                // Custom time input
                const customTime = await vscode.window.showInputBox({
                    prompt: 'Enter growth duration in minutes (1-120)',
                    placeHolder: '25',
                    validateInput: (value) => {
                        const num = parseInt(value);
                        if (isNaN(num) || num < 1 || num > 120) {
                            return 'Please enter a number between 1 and 120';
                        }
                        return null;
                    }
                });

                if (!customTime) return;
                minutes = parseInt(customTime);
            }

            const seconds = minutes * 60;
            this.statusBar.showLoadingAnimation('Cultivating custom growth...', 1300);
            setTimeout(() => {
                this.timer.start(seconds, TimerState.CUSTOM);
                vscode.window.showInformationMessage(`✨ Custom growth started! ${minutes} minutes of focused cultivation.`);
            }, 1300);

        } catch (error) {
            console.error('Error starting custom timer:', error);
            this.statusBar.updateMessage('Error cultivating growth', '❌');
            vscode.window.showErrorMessage(`Failed to start custom timer: ${error}`);
        }
    }

    public async playLofi() {
        try {
            await this.soundManager.playLofi();
            const soundIcon = this.soundManager.getSoundIcon();
            // Update status bar to show sound is playing
            if (this.timer.getState().isRunning) {
                // Timer is running, updateTimer will handle the sound icon
            } else {
                this.statusBar.updateIdle(soundIcon);
            }
        } catch (error) {
            console.error('Error playing lofi:', error);
            vscode.window.showErrorMessage('Failed to play lofi music');
        }
    }

    public async playRain() {
        try {
            await this.soundManager.playRain();
            const soundIcon = this.soundManager.getSoundIcon();
            // Update status bar to show sound is playing
            if (this.timer.getState().isRunning) {
                // Timer is running, updateTimer will handle the sound icon
            } else {
                this.statusBar.updateIdle(soundIcon);
            }
        } catch (error) {
            console.error('Error playing rain:', error);
            vscode.window.showErrorMessage('Failed to play rain sounds');
        }
    }

    public async stopSounds() {
        try {
            await this.soundManager.stopAllSounds();
            // Update status bar to remove sound icon
            if (this.timer.getState().isRunning) {
                // Timer is running, updateTimer will handle the removal
            } else {
                this.statusBar.updateIdle();
            }
            vscode.window.showInformationMessage('🔇 Ambient sounds stopped');
        } catch (error) {
            console.error('Error stopping sounds:', error);
            vscode.window.showErrorMessage('Failed to stop sounds');
        }
    }

    public showSoundMenu() {
        const currentSound = this.soundManager.getCurrentSound();
        const items = [
            {
                label: '🎵 Play Lofi Music',
                description: currentSound === 'lofi' ? '(Currently playing)' : 'Chill beats for focus',
                command: 'lofi'
            },
            {
                label: '🌧️ Play Rain Sounds',
                description: currentSound === 'rain' ? '(Currently playing)' : 'Natural ambient sounds',
                command: 'rain'
            },
            {
                label: '🔇 Stop All Sounds',
                description: 'Stop ambient sounds',
                command: 'stop'
            }
        ];

        vscode.window.showQuickPick(items, {
            placeHolder: 'Choose ambient sound',
            title: '🎧 Ambient Sound Player'
        }).then(selection => {
            if (!selection) return;

            switch (selection.command) {
                case 'lofi':
                    this.playLofi();
                    break;
                case 'rain':
                    this.playRain();
                    break;
                case 'stop':
                    this.stopSounds();
                    break;
            }
        });
    }

    public getStats(): string {
        const overallStats = this.statsManager.getOverallStats();
        const todayStats = this.statsManager.getDailyStats();
        const soundInfo = this.soundManager.isCurrentlyPlaying() ? 
            ` | Sound: ${this.soundManager.getSoundLabel()}` : '';
        
        return `Today: ${Math.round(todayStats.totalFocusTime)}min focus, ${todayStats.completedSessions} sessions | Total: ${Math.round(overallStats.totalFocusTime)}h, ${overallStats.treesGrown} trees grown | Streak: ${overallStats.currentStreak} days${soundInfo}`;
    }

    public async showDetailedStats() {
        const overall = this.statsManager.getOverallStats();
        const today = this.statsManager.getDailyStats();
        const week = this.statsManager.getWeeklyStats();
        
        const statsMessage = `
📊 **Pinedoro Growth Statistics**

🌱 **Today:**
• Focus Time: ${Math.round(today.totalFocusTime)} minutes
• Sessions: ${today.completedSessions} completed
• Productivity: ${Math.round(today.productivity)}%
• Lines Added: ${today.totalLinesAdded} 📝
• Keystrokes: ${today.totalKeystrokes} ⌨️
• Files Edited: ${today.filesEdited} 📁
• Languages: ${today.languagesUsed.join(', ')} 💻

🌿 **This Week:**
• Total Focus: ${Math.round(week.totalFocusTime)} minutes
• Daily Average: ${Math.round(week.averageDailyFocus)} minutes
• Consistency: ${Math.round(week.consistency)}%

🌳 **Overall Growth:**
• Total Sessions: ${overall.totalSessions}
• Focus Hours: ${Math.round(overall.totalFocusTime)} hours
• Trees Grown: ${overall.treesGrown} 🌳
• Current Streak: ${overall.currentStreak} days
• Longest Streak: ${overall.longestStreak} days
• Completion Rate: ${Math.round(overall.completionRate)}%
• Days Used: ${overall.totalDaysUsed}

💻 **Coding Progress:**
• Lines of Code: ${overall.totalLinesOfCode} 📝
• Total Keystrokes: ${overall.totalKeystrokes} ⌨️
• Files Edited: ${overall.totalFilesEdited} 📁
• Favorite Language: ${overall.favoriteLanguage || 'None'} 💻
• Avg Lines/Session: ${Math.round(overall.averageLinesPerSession)} 📊
• Coding Efficiency: ${Math.round(overall.codingEfficiency)}% ⚡

🎵 **Preferences:**
• Favorite Sound: ${overall.favoriteSound || 'Silent'} ${this.getSoundEmoji(overall.favoriteSound)}
        `;

        const choice = await vscode.window.showInformationMessage(
            statsMessage,
            'Export Data', 'Close'
        );

        switch (choice) {
            case 'Export Data':
                await this.exportStats();
                break;
        }
    }

    private getSoundEmoji(sound?: string): string {
        switch (sound) {
            case 'lofi': return '🎵';
            case 'rain': return '🌧️';
            default: return '🔇';
        }
    }



    public async exportStats() {
        try {
            const data = this.statsManager.exportAllData();
            const jsonData = JSON.stringify(data, null, 2);
            
            const saveLocation = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(`pinedoro-stats-${new Date().toISOString().split('T')[0]}.json`),
                filters: {
                    'JSON Files': ['json'],
                    'All Files': ['*']
                }
            });

            if (saveLocation) {
                await vscode.workspace.fs.writeFile(saveLocation, Buffer.from(jsonData, 'utf8'));
                vscode.window.showInformationMessage(`📊 Statistics exported to ${saveLocation.fsPath}`);
            }
        } catch (error) {
            console.error('Error exporting stats:', error);
            vscode.window.showErrorMessage(`Failed to export: ${error}`);
        }
    }



    public initialize() {
        try {
            this.statusBar.updateIdle();
            console.log('Pomodoro Controller initialized successfully');
        } catch (error) {
            console.error('Error initializing controller:', error);
            vscode.window.showErrorMessage('Failed to initialize Pomodoro timer');
        }
    }

    private updateCodingMetrics() {
        const codingStats = this.statsManager.getCurrentCodingStats();
        if (codingStats && codingStats.totalKeystrokes > 0) {
            // Show coding progress in status bar tooltip or quick notification
            const summary = `📝 ${codingStats.totalLinesAdded} lines • ⌨️ ${codingStats.totalKeystrokes} keys • 📁 ${codingStats.filesEdited} files`;
            this.statusBar.showCodingProgress(summary);
        }
    }

    public dispose() {
        try {
            this.timer.reset();
            this.statusBar.dispose();
            this.soundManager.dispose();
            this.statsManager.dispose();
            console.log('Pomodoro Controller disposed successfully');
        } catch (error) {
            console.error('Error disposing controller:', error);
        }
    }
}