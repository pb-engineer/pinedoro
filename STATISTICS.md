# 📊🌲 **Pinedoro Statistics**

## 🎯 **Overview**

Pinedoro tracks your productivity sessions locally with comprehensive statistics and coding activity monitoring. All data is stored locally in VS Code's global state - no cloud, no API, just pure minimalist tracking.

---

## 📊 **What's Tracked**

### **🌱 Session Data**
- Focus time vs. break time
- Session completion rates
- Interruption tracking
- Project names and tags
- Sound preferences

### **💻 Coding Activity** (During focus sessions)
- Lines of code added/removed/modified
- Keystrokes and characters typed
- Files edited and languages used
- Active coding time vs. thinking time
- Most productive files

### **📈 Aggregated Statistics**
- **Daily**: Today's productivity metrics
- **Weekly**: 7-day rolling statistics
- **Monthly**: Growth trends and achievements
- **Overall**: Lifetime productivity insights

---

## 🌟 **Key Metrics**

### **Productivity Metrics**
- **Focus Time**: Minutes spent in focus sessions
- **Completion Rate**: Percentage of sessions completed
- **Current Streak**: Consecutive days with completed sessions
- **Trees Grown**: Visual representation of progress (1 tree per 4 focus sessions)

### **Coding Metrics**
- **Lines Per Session**: Average code productivity
- **Coding Efficiency**: Active coding time vs. total focus time
- **Favorite Language**: Most frequently used programming language
- **Files Edited**: Total unique files worked on

---

## 🔧 **Available Commands**

### **Statistics Commands**
- **📊 Show Statistics** - View detailed productivity stats
- **📊 Export Statistics** - Save data as JSON file locally

### **Timer Commands**  
- **🌱 Start Focus Session** - 25min productivity timer
- **🍃 Start Break** - 5min rest timer
- **🌳 Start Long Break** - 15min deep rest
- **⏰ Custom Timer** - Any duration you need

### **Sound Commands**
- **🎵 Play Forest Sounds** - Lofi background
- **🌧️ Play Rain Sounds** - Natural ambience
- **🎧 Ambient Sound Menu** - Quick sound picker

---

## 📱 **Statistics Display**

When you run **"Pinedoro: Show Statistics"**, you'll see:

```
📊 Pinedoro Growth Statistics

🌱 Today:
• Focus Time: 120 minutes
• Sessions: 5 completed
• Productivity: 83%
• Lines Added: 247 📝
• Keystrokes: 1,580 ⌨️
• Files Edited: 3 📁
• Languages: typescript, javascript 💻

🌿 This Week:
• Total Focus: 540 minutes
• Daily Average: 77 minutes
• Consistency: 71%

🌳 Overall Growth:
• Total Sessions: 156
• Focus Hours: 78 hours
• Trees Grown: 39 🌳
• Current Streak: 5 days
• Longest Streak: 12 days
• Completion Rate: 84%

💻 Coding Progress:
• Lines of Code: 8,247 📝
• Total Keystrokes: 52,340 ⌨️
• Files Edited: 127 📁
• Favorite Language: typescript 💻
• Avg Lines/Session: 53 📊
• Coding Efficiency: 67% ⚡

🎵 Preferences:
• Favorite Sound: lofi 🎵
```

---

## 📁 **Data Storage**

All your data is stored locally using VS Code's global state:
- **Sessions**: `pinedoro.sessions`
- **Current Session**: `pinedoro.currentSession`
- **Daily Stats Cache**: `pinedoro.dailyStats.{date}`

### **Export Format**
When you export statistics, you get a JSON file with:
```json
{
  "sessions": [...],
  "overall": {...},
  "daily": {...},
  "weekly": {...},
  "monthly": {...}
}
```

---

## 🌱 **Growth Philosophy**

Pinedoro follows a minimalist philosophy:
- **Local-only**: No cloud, no tracking, no external dependencies
- **Tree metaphor**: Growth visualized through tree emojis
- **Mindful productivity**: Focus on quality over quantity
- **Beautiful simplicity**: Clean, distraction-free interface

---

## 🚀 **Getting Started**

1. **Install** Pinedoro extension in VS Code
2. **Start tracking** with `Ctrl+Shift+P` → "Pinedoro: Start Focus Session"
3. **Code mindfully** during focus sessions
4. **View progress** with "Pinedoro: Show Statistics"
5. **Export data** anytime for backup or analysis

Your productivity journey starts with a single focus session! 🌲✨