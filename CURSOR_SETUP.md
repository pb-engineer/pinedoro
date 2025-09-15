# 🍅 Pinodoro Extension - Cursor Setup Guide

## 🚀 How to Run in Cursor

### **Method 1: F5 Key (Fastest)**
1. Open project in Cursor
2. Press **F5**
3. Select "🍅 Run Pinodoro Extension"
4. Extension Development Host opens automatically

### **Method 2: Debug Panel**
1. Open **Run and Debug** panel (`Ctrl+Shift+D`)
2. Select "🍅 Run Pinodoro Extension" from dropdown
3. Click green ▶️ play button

### **Method 3: Command Palette**
1. Press `Ctrl+Shift+P`
2. Type: **"Debug: Start Debugging"**
3. Select "🍅 Run Pinodoro Extension"

---

## 🔧 Available Launch Configurations

- **🍅 Run Pinodoro Extension** - Clean run with compilation
- **🍅 Run Extension (Watch Mode)** - Auto-recompile on changes
- **🧪 Extension Tests** - Run test suite

---

## ✅ Quick Verification

Once Extension Development Host opens:

1. **Check Status Bar** (bottom) - Should show: `$(watch) Start Pomodoro`
2. **Click Status Bar** - Starts 25-minute timer
3. **Command Palette** (`Ctrl+Shift+P`) → Type "Pomodoro" → See 8 commands

### Commands Available:
- Start Focus Session (25min)
- Start Break (5min)
- Start Long Break (15min)
- Stop Timer
- Reset Timer
- Pause/Resume Timer
- Show Statistics

---

## 🐛 Troubleshooting

### If Extension Doesn't Load:
```bash
npm run compile
```

### If Commands Don't Appear:
1. Check console for errors
2. Restart Extension Development Host
3. Try: `Ctrl+Shift+P` → "Developer: Reload Window"

### If Status Bar Is Empty:
- Extension loaded successfully if you see welcome notification
- Click anywhere in status bar area

---

## 🎯 Features You'll Experience

- **Visual Progress**: `🔥 24:59 [████████░]`
- **Smart Notifications**: "🎉 Focus session completed!"
- **Break Suggestions**: Auto-prompts after focus sessions
- **Click-to-Action**: Status bar is fully interactive
- **Session Tracking**: Counts completed pomodoros
- **Full Pomodoro Technique**: 25min focus → 5min break → repeat

---

## 📱 Status Bar States

- **Idle**: `$(watch) Start Pomodoro`
- **Focus**: `🔥 24:59 [████████░]`
- **Break**: `☕ 04:59 [███░░░░░░]`
- **Completed**: `🎉 Focus session completed!`

The extension works exactly like a professional Pomodoro timer with full VS Code/Cursor integration!