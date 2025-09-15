// src/extension.ts
import * as vscode from 'vscode';
import { PomodoroController } from './core/PomodoroController';
import { COMMAND_START_FOCUS, COMMAND_START_BREAK, COMMAND_STOP_TIMER, COMMAND_RESET_TIMER, COMMAND_CUSTOM_TIMER, COMMAND_PLAY_LOFI, COMMAND_PLAY_RAIN, COMMAND_STOP_SOUNDS } from './constants';

let controller: PomodoroController;

export function activate(context: vscode.ExtensionContext) {
    console.log('🌲 Pinedoro extension activated!');

    try {
        controller = new PomodoroController(context);
        controller.initialize();

        // Register all commands individually for better error tracking
        const startFocusCommand = vscode.commands.registerCommand(COMMAND_START_FOCUS, () => {
            console.log('Start Focus command executed');
            controller.startFocus();
        });

        const startBreakCommand = vscode.commands.registerCommand(COMMAND_START_BREAK, () => {
            console.log('Start Break command executed');
            controller.startShortBreak();
        });

        const stopTimerCommand = vscode.commands.registerCommand(COMMAND_STOP_TIMER, () => {
            console.log('Stop Timer command executed');
            controller.stopTimer();
        });

        const resetTimerCommand = vscode.commands.registerCommand(COMMAND_RESET_TIMER, () => {
            console.log('Reset Timer command executed');
            controller.resetTimer();
        });

        const startLongBreakCommand = vscode.commands.registerCommand('pomodoro.startLongBreak', () => {
            console.log('Start Long Break command executed');
            controller.startLongBreak();
        });

        const pauseTimerCommand = vscode.commands.registerCommand('pomodoro.pauseTimer', () => {
            console.log('Pause Timer command executed');
            controller.pauseTimer();
        });

        const resumeTimerCommand = vscode.commands.registerCommand('pomodoro.resumeTimer', () => {
            console.log('Resume Timer command executed');
            controller.resumeTimer();
        });

        const showStatsCommand = vscode.commands.registerCommand('pinedoro.showStats', () => {
            console.log('Show Stats command executed');
            controller.showDetailedStats();
        });

        const exportStatsCommand = vscode.commands.registerCommand('pinedoro.exportStats', () => {
            console.log('Export Stats command executed');
            controller.exportStats();
        });

        // Custom timer command
        const customTimerCommand = vscode.commands.registerCommand(COMMAND_CUSTOM_TIMER, () => {
            console.log('Custom Timer command executed');
            controller.startCustomTimer();
        });

        // Sound commands
        const playLofiCommand = vscode.commands.registerCommand(COMMAND_PLAY_LOFI, () => {
            console.log('Play Lofi command executed');
            controller.playLofi();
        });

        const playRainCommand = vscode.commands.registerCommand(COMMAND_PLAY_RAIN, () => {
            console.log('Play Rain command executed');
            controller.playRain();
        });

        const stopSoundsCommand = vscode.commands.registerCommand(COMMAND_STOP_SOUNDS, () => {
            console.log('Stop Sounds command executed');
            controller.stopSounds();
        });

        const soundMenuCommand = vscode.commands.registerCommand('pinedoro.soundMenu', () => {
            console.log('Sound Menu command executed');
            controller.showSoundMenu();
        });

        // Test command to verify registration
        const testCommand = vscode.commands.registerCommand('pinedoro.test', () => {
            vscode.window.showInformationMessage('✅ Pinedoro commands are working! 🌲 Beautiful, minimalist & growing!');
        });

        // Add all commands to context subscriptions
        context.subscriptions.push(
            startFocusCommand,
            startBreakCommand,
            stopTimerCommand,
            resetTimerCommand,
            startLongBreakCommand,
            pauseTimerCommand,
            resumeTimerCommand,
            showStatsCommand,
            exportStatsCommand,
            customTimerCommand,
            playLofiCommand,
            playRainCommand,
            stopSoundsCommand,
            soundMenuCommand,
            testCommand,
            controller
        );

        console.log('🌲 All Pinedoro commands registered successfully');

        // Show welcome message with delay to ensure UI is ready
        setTimeout(() => {
            vscode.window.showInformationMessage(
                '🌲 Pinedoro Timer activated! Beautiful tree growth with minimalist animations 🌱',
                'Test Growth', 'Forest Sounds'
            ).then(selection => {
                if (selection === 'Test Growth') {
                    vscode.commands.executeCommand('pinedoro.test');
                } else if (selection === 'Forest Sounds') {
                    vscode.commands.executeCommand('pinedoro.soundMenu');
                }
            });
        }, 1000);

    } catch (error) {
        console.error('Error activating Pinedoro extension:', error);
        vscode.window.showErrorMessage(`Failed to activate Pinedoro extension: ${error}`);
    }
}

export function deactivate() {
    if (controller) {
        controller.dispose();
    }
}