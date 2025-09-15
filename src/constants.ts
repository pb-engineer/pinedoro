// src/constants.ts
export const COMMAND_START_FOCUS = 'pinedoro.startFocus';
export const COMMAND_START_BREAK = 'pinedoro.startBreak';
export const COMMAND_STOP_TIMER = 'pinedoro.stopTimer';
export const COMMAND_RESET_TIMER = 'pinedoro.resetTimer';
export const COMMAND_CUSTOM_TIMER = 'pinedoro.customTimer';
export const COMMAND_PLAY_LOFI = 'pinedoro.playLofi';
export const COMMAND_PLAY_RAIN = 'pinedoro.playRain';
export const COMMAND_STOP_SOUNDS = 'pinedoro.stopSounds';

export const FOCUS_DURATION = 25 * 60; // 25 minutes
export const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
export const LONG_BREAK_DURATION = 15 * 60; // 15 minutes

export enum TimerState {
    IDLE = 'idle',
    FOCUS = 'focus',
    SHORT_BREAK = 'short-break',
    LONG_BREAK = 'long-break',
    CUSTOM = 'custom'
}

export enum SoundType {
    NONE = 'none',
    LOFI = 'lofi',
    RAIN = 'rain'
}

// Tree-themed color animation based on growth
export const TREE_THEMES = {
    FOCUS: {
        seed: '🌱', // Starting - seedling
        growing: '🌿', // Middle - growing plant
        mature: '🌳' // End - mature tree
    },
    BREAK: {
        seed: '🍃', // Starting - leaf
        growing: '🌾', // Middle - grain
        mature: '🌲' // End - evergreen
    },
    CUSTOM: {
        seed: '🔸', // Starting - small diamond
        growing: '🔶', // Middle - orange diamond
        mature: '✨' // End - sparkles
    }
};

// Minimalist loading animations
export const LOADING_FRAMES = {
    TREE_GROWTH: ['🌱', '🌿', '🌳', '🌳', '🌿', '🌱'],
    TIME_FLOW: ['⏳', '⌛', '⏳', '⌛'],
    SIMPLE_DOTS: ['   ', '.  ', '.. ', '...', ' ..', '  .'],
    LEAF_FALL: ['🍃', ' 🍃', '  🍃', '   🍃', '    🍃']
};

// Preset time options (in minutes)
export const PRESET_TIMES = [
    { label: '5 minutes', value: 5 },
    { label: '10 minutes', value: 10 },
    { label: '15 minutes', value: 15 },
    { label: '20 minutes', value: 20 },
    { label: '25 minutes (Classic)', value: 25 },
    { label: '30 minutes', value: 30 },
    { label: '45 minutes', value: 45 },
    { label: '60 minutes', value: 60 },
    { label: 'Custom...', value: 0 }
];

// Nature-themed ambient sounds
export const AMBIENT_SOUNDS = {
    LOFI: 'https://www.youtube.com/watch?v=jfKfPfyJRdk', // Forest sounds / Lofi
    RAIN: 'https://www.youtube.com/watch?v=mPZkdNFkNps'   // Rain sounds
};