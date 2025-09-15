// src/data/StatisticsManager.ts
import * as vscode from 'vscode';
import { TimerState, SoundType } from '../constants';
import { SessionCodingStats, CodingTracker } from '../tracking/CodingTracker';

export interface SessionData {
    id: string;
    type: TimerState;
    plannedDuration: number; // in seconds
    actualDuration: number; // in seconds
    startTime: Date;
    endTime: Date;
    completed: boolean;
    interrupted: boolean;
    interruptionCount: number;
    soundUsed?: SoundType;
    projectName?: string;
    tags?: string[];
    codingStats?: SessionCodingStats;
}

export interface DailyStats {
    date: string; // YYYY-MM-DD
    totalFocusTime: number; // in minutes
    totalBreakTime: number; // in minutes
    completedSessions: number;
    interruptedSessions: number;
    totalSessions: number;
    productivity: number; // percentage
    longestStreak: number;
    mostUsedSound?: SoundType;
    totalLinesAdded: number;
    totalKeystrokes: number;
    filesEdited: number;
    languagesUsed: string[];
    activeCodingTime: number; // in minutes
}

export interface WeeklyStats {
    weekStart: string; // YYYY-MM-DD
    dailyStats: DailyStats[];
    totalFocusTime: number;
    averageDailyFocus: number;
    bestDay: string;
    consistency: number; // percentage of days used
}

export interface MonthlyStats {
    month: string; // YYYY-MM
    weeklyStats: WeeklyStats[];
    totalFocusTime: number;
    averageWeeklyFocus: number;
    growth: number; // percentage compared to previous month
    achievements: string[];
}

export interface OverallStats {
    totalSessions: number;
    totalFocusTime: number; // in hours
    totalBreakTime: number; // in hours
    averageSessionLength: number; // in minutes
    completionRate: number; // percentage
    currentStreak: number;
    longestStreak: number;
    totalDaysUsed: number;
    favoriteSound?: SoundType;
    productivity: number; // overall percentage
    treesGrown: number; // metaphorical trees based on completed sessions
    totalLinesOfCode: number;
    totalKeystrokes: number;
    totalFilesEdited: number;
    favoriteLanguage?: string;
    averageLinesPerSession: number;
    codingEfficiency: number; // percentage of focus time spent actively coding
}

export class StatisticsManager {
    private context: vscode.ExtensionContext;
    private currentSession: SessionData | null = null;
    private codingTracker: CodingTracker;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.codingTracker = new CodingTracker();
    }

    // Session Management
    public startSession(type: TimerState, duration: number, sound?: SoundType): string {
        const sessionId = this.generateSessionId();
        
        this.currentSession = {
            id: sessionId,
            type,
            plannedDuration: duration,
            actualDuration: 0,
            startTime: new Date(),
            endTime: new Date(),
            completed: false,
            interrupted: false,
            interruptionCount: 0,
            soundUsed: sound,
            projectName: this.getCurrentProjectName(),
            tags: this.getCurrentTags()
        };

        // Start coding tracking for focus sessions
        if (type === TimerState.FOCUS) {
            this.codingTracker.startTracking();
        }

        this.saveCurrentSession();
        return sessionId;
    }

    public updateSession(actualDuration: number) {
        if (this.currentSession) {
            this.currentSession.actualDuration = actualDuration;
            this.currentSession.endTime = new Date();
            this.saveCurrentSession();
        }
    }

    public completeSession() {
        if (this.currentSession) {
            // Stop coding tracking and capture stats
            if (this.currentSession.type === TimerState.FOCUS) {
                this.currentSession.codingStats = this.codingTracker.stopTracking();
            }
            
            this.currentSession.completed = true;
            this.currentSession.endTime = new Date();
            this.finalizeSession();
        }
    }

    public interruptSession() {
        if (this.currentSession) {
            // Stop coding tracking and capture stats
            if (this.currentSession.type === TimerState.FOCUS) {
                this.currentSession.codingStats = this.codingTracker.stopTracking();
            }
            
            this.currentSession.interrupted = true;
            this.currentSession.interruptionCount++;
            this.currentSession.endTime = new Date();
            this.finalizeSession();
        }
    }

    private finalizeSession() {
        if (this.currentSession) {
            // Add to session history
            const sessions = this.getAllSessions();
            sessions.push({ ...this.currentSession });
            this.context.globalState.update('pinedoro.sessions', sessions);

            // Update daily stats
            this.updateDailyStats(this.currentSession);

            // Reset current session
            this.currentSession = null;
            this.context.globalState.update('pinedoro.currentSession', null);
        }
    }

    // Data Retrieval
    public getDailyStats(date?: string): DailyStats {
        const targetDate = date || this.getTodayString();
        const sessions = this.getSessionsForDate(targetDate);
        
        return this.calculateDailyStats(targetDate, sessions);
    }

    public getWeeklyStats(weekStart?: string): WeeklyStats {
        const start = weekStart || this.getWeekStartString();
        const weekDates = this.getWeekDates(start);
        
        const dailyStats = weekDates.map(date => this.getDailyStats(date));
        
        return {
            weekStart: start,
            dailyStats,
            totalFocusTime: dailyStats.reduce((sum, day) => sum + day.totalFocusTime, 0),
            averageDailyFocus: dailyStats.reduce((sum, day) => sum + day.totalFocusTime, 0) / 7,
            bestDay: this.getBestDay(dailyStats),
            consistency: (dailyStats.filter(day => day.totalSessions > 0).length / 7) * 100
        };
    }

    public getMonthlyStats(month?: string): MonthlyStats {
        const targetMonth = month || this.getCurrentMonthString();
        const weeks = this.getWeeksInMonth(targetMonth);
        
        const weeklyStats = weeks.map(week => this.getWeeklyStats(week));
        
        return {
            month: targetMonth,
            weeklyStats,
            totalFocusTime: weeklyStats.reduce((sum, week) => sum + week.totalFocusTime, 0),
            averageWeeklyFocus: weeklyStats.reduce((sum, week) => sum + week.totalFocusTime, 0) / weeks.length,
            growth: this.calculateMonthlyGrowth(targetMonth),
            achievements: this.getMonthlyAchievements(targetMonth)
        };
    }

    public getOverallStats(): OverallStats {
        const sessions = this.getAllSessions();
        const completedSessions = sessions.filter(s => s.completed);
        const focusSessions = sessions.filter(s => s.type === TimerState.FOCUS);
        const focusSessionsWithCoding = focusSessions.filter(s => s.codingStats);
        
        const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.actualDuration, 0) / 60;
        const totalBreakMinutes = sessions
            .filter(s => [TimerState.SHORT_BREAK, TimerState.LONG_BREAK].includes(s.type))
            .reduce((sum, s) => sum + s.actualDuration, 0) / 60;

        // Calculate coding statistics
        const totalLinesOfCode = focusSessionsWithCoding.reduce((sum, s) => sum + (s.codingStats?.totalLinesAdded || 0), 0);
        const totalKeystrokes = focusSessionsWithCoding.reduce((sum, s) => sum + (s.codingStats?.totalKeystrokes || 0), 0);
        const allFilesEdited = new Set<string>();
        const languageCounts = new Map<string, number>();
        let totalCodingTime = 0;

        focusSessionsWithCoding.forEach(session => {
            if (session.codingStats) {
                session.codingStats.activities.forEach(activity => {
                    allFilesEdited.add(activity.fileName);
                });
                totalCodingTime += session.codingStats.codingTime;
                session.codingStats.languagesUsed.forEach(lang => {
                    languageCounts.set(lang, (languageCounts.get(lang) || 0) + 1);
                });
            }
        });

        // Find favorite language
        let favoriteLanguage: string | undefined;
        let maxLangCount = 0;
        languageCounts.forEach((count, lang) => {
            if (count > maxLangCount) {
                maxLangCount = count;
                favoriteLanguage = lang;
            }
        });

        return {
            totalSessions: sessions.length,
            totalFocusTime: totalFocusMinutes / 60, // hours
            totalBreakTime: totalBreakMinutes / 60, // hours
            averageSessionLength: sessions.length > 0 ? 
                sessions.reduce((sum, s) => sum + s.actualDuration, 0) / sessions.length / 60 : 0,
            completionRate: sessions.length > 0 ? 
                (completedSessions.length / sessions.length) * 100 : 0,
            currentStreak: this.getCurrentStreak(),
            longestStreak: this.getLongestStreak(),
            totalDaysUsed: this.getTotalDaysUsed(),
            favoriteSound: this.getFavoriteSound(),
            productivity: this.calculateOverallProductivity(),
            treesGrown: Math.floor(completedSessions.filter(s => s.type === TimerState.FOCUS).length / 4),
            totalLinesOfCode,
            totalKeystrokes,
            totalFilesEdited: allFilesEdited.size,
            favoriteLanguage,
            averageLinesPerSession: focusSessionsWithCoding.length > 0 ? totalLinesOfCode / focusSessionsWithCoding.length : 0,
            codingEfficiency: totalFocusMinutes > 0 ? (totalCodingTime / (totalFocusMinutes * 60)) * 100 : 0
        };
    }

    // Helper Methods
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private getCurrentProjectName(): string {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        return workspaceFolder?.name || 'Unknown Project';
    }

    private getCurrentTags(): string[] {
        // Could be expanded to read from workspace settings or user input
        return [];
    }

    private saveCurrentSession() {
        this.context.globalState.update('pinedoro.currentSession', this.currentSession);
    }

    private getAllSessions(): SessionData[] {
        return this.context.globalState.get('pinedoro.sessions', []);
    }

    private getSessionsForDate(date: string): SessionData[] {
        return this.getAllSessions().filter(session => {
            const sessionDate = new Date(session.startTime).toISOString().split('T')[0];
            return sessionDate === date;
        });
    }

    private calculateDailyStats(date: string, sessions: SessionData[]): DailyStats {
        const focusSessions = sessions.filter(s => s.type === TimerState.FOCUS);
        const breakSessions = sessions.filter(s => 
            [TimerState.SHORT_BREAK, TimerState.LONG_BREAK].includes(s.type)
        );
        
        const totalFocusTime = focusSessions.reduce((sum, s) => sum + s.actualDuration, 0) / 60;
        const totalBreakTime = breakSessions.reduce((sum, s) => sum + s.actualDuration, 0) / 60;
        const completedSessions = sessions.filter(s => s.completed).length;
        const interruptedSessions = sessions.filter(s => s.interrupted).length;

        // Calculate coding statistics
        const focusSessionsWithCoding = focusSessions.filter(s => s.codingStats);
        const totalLinesAdded = focusSessionsWithCoding.reduce((sum, s) => sum + (s.codingStats?.totalLinesAdded || 0), 0);
        const totalKeystrokes = focusSessionsWithCoding.reduce((sum, s) => sum + (s.codingStats?.totalKeystrokes || 0), 0);
        const filesEditedSet = new Set<string>();
        const languageSet = new Set<string>();
        let activeCodingTime = 0;

        focusSessionsWithCoding.forEach(session => {
            if (session.codingStats) {
                session.codingStats.activities.forEach(activity => {
                    filesEditedSet.add(activity.fileName);
                });
                activeCodingTime += session.codingStats.codingTime;
                session.codingStats.languagesUsed.forEach(lang => languageSet.add(lang));
            }
        });

        return {
            date,
            totalFocusTime,
            totalBreakTime,
            completedSessions,
            interruptedSessions,
            totalSessions: sessions.length,
            productivity: sessions.length > 0 ? (completedSessions / sessions.length) * 100 : 0,
            longestStreak: this.getLongestStreakForDate(date),
            mostUsedSound: this.getMostUsedSoundForDate(date, sessions),
            totalLinesAdded,
            totalKeystrokes,
            filesEdited: filesEditedSet.size,
            languagesUsed: Array.from(languageSet),
            activeCodingTime: activeCodingTime / 60 // convert to minutes
        };
    }

    private getTodayString(): string {
        return new Date().toISOString().split('T')[0];
    }

    private getWeekStartString(): string {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - dayOfWeek + 1);
        return monday.toISOString().split('T')[0];
    }

    private getCurrentMonthString(): string {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    }

    private getWeekDates(weekStart: string): string[] {
        const dates = [];
        const start = new Date(weekStart);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date.toISOString().split('T')[0]);
        }
        
        return dates;
    }

    private getWeeksInMonth(month: string): string[] {
        const [year, monthNum] = month.split('-').map(Number);
        const firstDay = new Date(year, monthNum - 1, 1);
        const lastDay = new Date(year, monthNum, 0);
        
        const weeks = [];
        let current = new Date(firstDay);
        
        // Start from Monday of the first week
        current.setDate(current.getDate() - current.getDay() + 1);
        
        while (current <= lastDay) {
            weeks.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 7);
        }
        
        return weeks;
    }

    private getBestDay(dailyStats: DailyStats[]): string {
        return dailyStats.reduce((best, current) => 
            current.totalFocusTime > best.totalFocusTime ? current : best
        ).date;
    }

    private calculateMonthlyGrowth(month: string): number {
        // Simplified growth calculation to avoid circular reference
        const [year, monthNum] = month.split('-').map(Number);
        const prevMonth = monthNum === 1 ? 
            `${year - 1}-12` : 
            `${year}-${String(monthNum - 1).padStart(2, '0')}`;
            
        // Get weeks for both months and calculate totals directly
        const currentWeeks = this.getWeeksInMonth(month);
        const prevWeeks = this.getWeeksInMonth(prevMonth);
        
        const currentTotal = currentWeeks.reduce((sum, week) => {
            const weekStats = this.getWeeklyStats(week);
            return sum + weekStats.totalFocusTime;
        }, 0);
        
        const prevTotal = prevWeeks.reduce((sum, week) => {
            const weekStats = this.getWeeklyStats(week);
            return sum + weekStats.totalFocusTime;
        }, 0);
        
        return prevTotal > 0 ? 
            ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
    }

    private getMonthlyAchievements(month: string): string[] {
        const achievements = [];
        
        // Calculate achievements directly to avoid circular reference
        const weeks = this.getWeeksInMonth(month);
        const weeklyStats = weeks.map(week => this.getWeeklyStats(week));
        const totalFocusTime = weeklyStats.reduce((sum, week) => sum + week.totalFocusTime, 0);
        const averageWeeklyFocus = weeklyStats.length > 0 ? totalFocusTime / weeklyStats.length : 0;
        
        if (totalFocusTime > 100) achievements.push('🌳 Century Focus - 100+ hours');
        if (weeklyStats.length > 0 && weeklyStats[0].consistency > 80) achievements.push('🌱 Consistent Grower - 80%+ consistency');
        if (averageWeeklyFocus > 20) achievements.push('🌿 Weekly Warrior - 20+ hours/week');
        
        return achievements;
    }

    private getCurrentStreak(): number {
        const sessions = this.getAllSessions();
        let streak = 0;
        let currentDate = new Date();
        
        while (true) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayHasSessions = sessions.some(s => {
                const sessionDate = new Date(s.startTime).toISOString().split('T')[0];
                return sessionDate === dateStr && s.completed;
            });
            
            if (dayHasSessions) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }

    private getLongestStreak(): number {
        // Implementation to calculate longest streak
        const sessions = this.getAllSessions();
        const completedByDate = new Map<string, boolean>();
        
        sessions.forEach(session => {
            if (session.completed) {
                const date = new Date(session.startTime).toISOString().split('T')[0];
                completedByDate.set(date, true);
            }
        });
        
        let maxStreak = 0;
        let currentStreak = 0;
        
        const dates = Array.from(completedByDate.keys()).sort();
        for (let i = 0; i < dates.length; i++) {
            if (i === 0 || this.isConsecutiveDay(dates[i-1], dates[i])) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 1;
            }
        }
        
        return maxStreak;
    }

    private getTotalDaysUsed(): number {
        const sessions = this.getAllSessions();
        const uniqueDates = new Set(
            sessions.map(s => new Date(s.startTime).toISOString().split('T')[0])
        );
        return uniqueDates.size;
    }

    private getFavoriteSound(): SoundType | undefined {
        const sessions = this.getAllSessions();
        const soundCounts = new Map<SoundType, number>();
        
        sessions.forEach(session => {
            if (session.soundUsed) {
                soundCounts.set(session.soundUsed, (soundCounts.get(session.soundUsed) || 0) + 1);
            }
        });
        
        let maxCount = 0;
        let favoriteSound: SoundType | undefined;
        
        soundCounts.forEach((count, sound) => {
            if (count > maxCount) {
                maxCount = count;
                favoriteSound = sound;
            }
        });
        
        return favoriteSound;
    }

    private calculateOverallProductivity(): number {
        const sessions = this.getAllSessions();
        if (sessions.length === 0) return 0;
        
        const completedSessions = sessions.filter(s => s.completed).length;
        return (completedSessions / sessions.length) * 100;
    }

    private getLongestStreakForDate(date: string): number {
        // Simplified implementation for daily longest streak
        return this.getLongestStreak();
    }

    private getMostUsedSoundForDate(date: string, sessions: SessionData[]): SoundType | undefined {
        const soundCounts = new Map<SoundType, number>();
        
        sessions.forEach(session => {
            if (session.soundUsed) {
                soundCounts.set(session.soundUsed, (soundCounts.get(session.soundUsed) || 0) + 1);
            }
        });
        
        let maxCount = 0;
        let mostUsedSound: SoundType | undefined;
        
        soundCounts.forEach((count, sound) => {
            if (count > maxCount) {
                maxCount = count;
                mostUsedSound = sound;
            }
        });
        
        return mostUsedSound;
    }

    private isConsecutiveDay(date1: string, date2: string): boolean {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
    }

    private updateDailyStats(session: SessionData) {
        // This method updates daily aggregated stats for faster retrieval
        const date = new Date(session.startTime).toISOString().split('T')[0];
        const dailyStatsKey = `pinedoro.dailyStats.${date}`;
        
        // Force recalculation of daily stats
        const stats = this.getDailyStats(date);
        this.context.globalState.update(dailyStatsKey, stats);
    }

    // Export methods for API
    public exportAllData() {
        return {
            sessions: this.getAllSessions(),
            overall: this.getOverallStats(),
            daily: this.getDailyStats(),
            weekly: this.getWeeklyStats(),
            monthly: this.getMonthlyStats()
        };
    }

    public clearAllData() {
        this.context.globalState.update('pinedoro.sessions', []);
        this.context.globalState.update('pinedoro.currentSession', null);
        // Clear daily stats cache
        const keys = this.context.globalState.keys();
        keys.forEach(key => {
            if (key.startsWith('pinedoro.dailyStats.')) {
                this.context.globalState.update(key, undefined);
            }
        });
    }

    // Get current session coding stats (live during session)
    public getCurrentCodingStats(): SessionCodingStats | null {
        return this.codingTracker.getCurrentStats();
    }

    // Dispose method to clean up coding tracker
    public dispose() {
        this.codingTracker.dispose();
    }
}