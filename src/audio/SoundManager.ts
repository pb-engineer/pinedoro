// src/audio/SoundManager.ts
import * as vscode from 'vscode';
import { SoundType, AMBIENT_SOUNDS } from '../constants';

export class SoundManager {
    private currentSound: SoundType = SoundType.NONE;
    private audioContext: any = null; // Use any for AudioContext compatibility
    private isPlaying: boolean = false;

    constructor() {
        // Initialize audio context when needed
    }

    public async playLofi() {
        try {
            await this.stopAllSounds();
            this.currentSound = SoundType.LOFI;
            this.isPlaying = true;
            
            // Open lofi playlist in browser (since VS Code can't directly play audio)
            await vscode.env.openExternal(vscode.Uri.parse(AMBIENT_SOUNDS.LOFI));
            
            vscode.window.showInformationMessage(
                '🎵 Forest sounds opened in browser! Minimize for ambient growth.',
                'Stop Sounds'
            ).then(selection => {
                if (selection === 'Stop Sounds') {
                    this.stopAllSounds();
                }
            });
            
        } catch (error) {
            console.error('Error playing lofi:', error);
            vscode.window.showErrorMessage('Failed to open lofi music');
        }
    }

    public async playRain() {
        try {
            await this.stopAllSounds();
            this.currentSound = SoundType.RAIN;
            this.isPlaying = true;
            
            // Open rain sounds in browser
            await vscode.env.openExternal(vscode.Uri.parse(AMBIENT_SOUNDS.RAIN));
            
            vscode.window.showInformationMessage(
                '🌧️ Rain sounds opened in browser! Perfect for deep forest meditation.',
                'Stop Sounds'
            ).then(selection => {
                if (selection === 'Stop Sounds') {
                    this.stopAllSounds();
                }
            });
            
        } catch (error) {
            console.error('Error playing rain:', error);
            vscode.window.showErrorMessage('Failed to open rain sounds');
        }
    }

    public async playLocalSound(soundFile: string) {
        // Future implementation for local audio files
        try {
            // This would be for local .mp3/.wav files
            // For now, we'll use the browser approach
            vscode.window.showInformationMessage(`Playing local sound: ${soundFile}`);
        } catch (error) {
            console.error('Error playing local sound:', error);
        }
    }

    public async stopAllSounds() {
        try {
            this.currentSound = SoundType.NONE;
            this.isPlaying = false;
            
            // Note: We can't actually stop browser audio from VS Code
            // But we can show a helpful message
            if (this.isPlaying) {
                vscode.window.showInformationMessage(
                    '🔇 To stop ambient sounds, close or mute the browser tab that was opened.'
                );
            }
            
        } catch (error) {
            console.error('Error stopping sounds:', error);
        }
    }

    public getCurrentSound(): SoundType {
        return this.currentSound;
    }

    public isCurrentlyPlaying(): boolean {
        return this.isPlaying;
    }

    public getSoundIcon(): string {
        switch (this.currentSound) {
            case SoundType.LOFI:
                return '🎵';
            case SoundType.RAIN:
                return '🌧️';
            default:
                return '';
        }
    }

    public getSoundLabel(): string {
        switch (this.currentSound) {
            case SoundType.LOFI:
                return 'Forest Playing';
            case SoundType.RAIN:
                return 'Rain Playing';
            default:
                return '';
        }
    }

    public dispose() {
        this.stopAllSounds();
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}