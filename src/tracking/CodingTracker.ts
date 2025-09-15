// src/tracking/CodingTracker.ts
import * as vscode from 'vscode';

export interface CodingActivity {
    fileName: string;
    language: string;
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
    charactersTyped: number;
    keystrokes: number;
    timeSpent: number; // in seconds
    firstEdit: Date;
    lastEdit: Date;
}

export interface SessionCodingStats {
    totalLinesAdded: number;
    totalLinesRemoved: number;
    totalLinesModified: number;
    totalCharactersTyped: number;
    totalKeystrokes: number;
    filesEdited: number;
    languagesUsed: string[];
    mostActiveFile: string;
    codingTime: number; // active coding time in seconds
    activities: CodingActivity[];
}

export class CodingTracker {
    private isTracking = false;
    private sessionStats: SessionCodingStats;
    private fileActivities = new Map<string, CodingActivity>();
    private lastActiveTime = Date.now();
    private disposables: vscode.Disposable[] = [];

    constructor() {
        this.sessionStats = this.initializeStats();
    }

    public startTracking(): void {
        if (this.isTracking) return;
        
        this.isTracking = true;
        this.sessionStats = this.initializeStats();
        this.fileActivities.clear();
        this.lastActiveTime = Date.now();

        // Track document changes
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(this.onDocumentChanged.bind(this))
        );

        // Track active editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChanged.bind(this))
        );

        // Track typing activity
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(this.onTypingActivity.bind(this))
        );

        console.log('🌱 Coding activity tracking started');
    }

    public stopTracking(): SessionCodingStats {
        if (!this.isTracking) return this.sessionStats;

        this.isTracking = false;
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];

        // Finalize session stats
        this.finalizeSessionStats();
        
        console.log('🌳 Coding activity tracking stopped');
        return { ...this.sessionStats };
    }

    public getCurrentStats(): SessionCodingStats {
        this.updateSessionStats();
        return { ...this.sessionStats };
    }

    private initializeStats(): SessionCodingStats {
        return {
            totalLinesAdded: 0,
            totalLinesRemoved: 0,
            totalLinesModified: 0,
            totalCharactersTyped: 0,
            totalKeystrokes: 0,
            filesEdited: 0,
            languagesUsed: [],
            mostActiveFile: '',
            codingTime: 0,
            activities: []
        };
    }

    private onDocumentChanged(event: vscode.TextDocumentChangeEvent): void {
        if (!this.isTracking || event.document.uri.scheme !== 'file') return;

        const fileName = event.document.fileName;
        const language = event.document.languageId;
        
        // Get or create activity for this file
        let activity = this.fileActivities.get(fileName);
        if (!activity) {
            activity = {
                fileName: this.getRelativeFileName(fileName),
                language,
                linesAdded: 0,
                linesRemoved: 0,
                linesModified: 0,
                charactersTyped: 0,
                keystrokes: 0,
                timeSpent: 0,
                firstEdit: new Date(),
                lastEdit: new Date()
            };
            this.fileActivities.set(fileName, activity);
        }

        // Process each change
        for (const change of event.contentChanges) {
            this.processTextChange(activity, change);
        }

        activity.lastEdit = new Date();
        this.updateActiveTime();
    }

    private processTextChange(activity: CodingActivity, change: vscode.TextDocumentContentChangeEvent): void {
        const oldText = change.rangeLength > 0 ? 'placeholder' : '';
        const newText = change.text;
        
        // Count lines
        const oldLines = oldText.split('\n').length - 1;
        const newLines = newText.split('\n').length - 1;
        
        if (change.rangeLength > 0) {
            // Deletion or replacement
            activity.linesRemoved += oldLines;
            if (newText.length > 0) {
                activity.linesModified++;
            }
        }
        
        if (newText.length > 0) {
            // Addition
            activity.linesAdded += newLines;
            activity.charactersTyped += newText.length;
            if (newLines === 0) {
                activity.linesModified++;
            }
        }

        activity.keystrokes++;
    }

    private onActiveEditorChanged(editor: vscode.TextEditor | undefined): void {
        if (!this.isTracking || !editor) return;
        
        this.updateActiveTime();
    }

    private onTypingActivity(event: vscode.TextDocumentChangeEvent): void {
        if (!this.isTracking) return;
        
        this.updateActiveTime();
    }

    private updateActiveTime(): void {
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActiveTime;
        
        // Only count as active coding time if less than 30 seconds since last activity
        if (timeSinceLastActivity < 30000) {
            this.sessionStats.codingTime += timeSinceLastActivity / 1000;
        }
        
        this.lastActiveTime = now;
    }

    private updateSessionStats(): void {
        // Reset counters
        this.sessionStats.totalLinesAdded = 0;
        this.sessionStats.totalLinesRemoved = 0;
        this.sessionStats.totalLinesModified = 0;
        this.sessionStats.totalCharactersTyped = 0;
        this.sessionStats.totalKeystrokes = 0;
        this.sessionStats.filesEdited = this.fileActivities.size;
        
        const languageSet = new Set<string>();
        let mostActiveFile = '';
        let maxActivity = 0;

        // Aggregate from all file activities
        for (const [fileName, activity] of this.fileActivities) {
            this.sessionStats.totalLinesAdded += activity.linesAdded;
            this.sessionStats.totalLinesRemoved += activity.linesRemoved;
            this.sessionStats.totalLinesModified += activity.linesModified;
            this.sessionStats.totalCharactersTyped += activity.charactersTyped;
            this.sessionStats.totalKeystrokes += activity.keystrokes;
            
            languageSet.add(activity.language);
            
            // Calculate activity score for most active file
            const activityScore = activity.linesAdded + activity.linesModified + (activity.keystrokes / 10);
            if (activityScore > maxActivity) {
                maxActivity = activityScore;
                mostActiveFile = activity.fileName;
            }
        }

        this.sessionStats.languagesUsed = Array.from(languageSet);
        this.sessionStats.mostActiveFile = mostActiveFile;
        this.sessionStats.activities = Array.from(this.fileActivities.values());
    }

    private finalizeSessionStats(): void {
        this.updateSessionStats();
        
        // Update final coding time
        this.updateActiveTime();
    }

    private getRelativeFileName(fullPath: string): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            return vscode.workspace.asRelativePath(fullPath, false);
        }
        return fullPath.split('/').pop() || fullPath;
    }

    public dispose(): void {
        this.stopTracking();
    }

    // Helper methods for statistics display
    public getProductivityMetrics(): {
        linesPerMinute: number;
        keystrokesPerMinute: number;
        averageLineLength: number;
        codingEfficiency: number; // percentage of session time spent actively coding
    } {
        const codingTimeMinutes = this.sessionStats.codingTime / 60;
        const sessionTimeMinutes = codingTimeMinutes; // This would be passed from session duration
        
        return {
            linesPerMinute: codingTimeMinutes > 0 ? this.sessionStats.totalLinesAdded / codingTimeMinutes : 0,
            keystrokesPerMinute: codingTimeMinutes > 0 ? this.sessionStats.totalKeystrokes / codingTimeMinutes : 0,
            averageLineLength: this.sessionStats.totalLinesAdded > 0 ? this.sessionStats.totalCharactersTyped / this.sessionStats.totalLinesAdded : 0,
            codingEfficiency: sessionTimeMinutes > 0 ? (this.sessionStats.codingTime / (sessionTimeMinutes * 60)) * 100 : 0
        };
    }

    public getCodingSummary(): string {
        const stats = this.sessionStats;
        const metrics = this.getProductivityMetrics();
        
        return `🌱 Coding Growth:
📝 ${stats.totalLinesAdded} lines added, ${stats.totalLinesRemoved} removed
⚡ ${stats.totalKeystrokes} keystrokes (${metrics.keystrokesPerMinute.toFixed(1)}/min)
📁 ${stats.filesEdited} files in ${stats.languagesUsed.length} languages
🎯 Most active: ${stats.mostActiveFile}
⏱️ Active coding: ${Math.round(stats.codingTime)} seconds`;
    }
}