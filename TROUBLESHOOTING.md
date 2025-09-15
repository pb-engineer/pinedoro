# 🔧 Pinodoro Extension Troubleshooting

## ❌ Problem: Commands Don't Appear in Command Palette

### ✅ **Solution Steps:**

#### **Step 1: Check Extension Activation**
1. Open Extension Development Host (F5)
2. Look for notification: "🍅 Pomodoro Timer activated!"
3. If no notification appears, check console for errors

#### **Step 2: Force Extension Reload**
1. In Extension Development Host window:
2. Press `Ctrl+Shift+P`
3. Type: **"Developer: Reload Window"**
4. Extension should reactivate

#### **Step 3: Test Command Registration**
1. Press `Ctrl+Shift+P`
2. Type: **"Pomodoro: Test Commands"**
3. If this works, all other commands should too

#### **Step 4: Manual Command Test**
1. Open console (`F12` → Console tab)
2. Run: `vscode.commands.executeCommand('pomodoro.test')`
3. Should show: "✅ Pomodoro commands are working!"

#### **Step 5: Check Console Logs**
Look for these messages in console:
```
🍅 Pomodoro extension activated!
🍅 All Pomodoro commands registered successfully
```

### 🚨 **If Commands Still Don't Appear:**

#### **Option A: Restart Everything**
1. Close Extension Development Host
2. Close main Cursor window
3. Reopen project in Cursor
4. Press F5 again

#### **Option B: Clean Rebuild**
```bash
rm -rf out/
npm run compile
```
Then press F5

#### **Option C: Check VS Code Version**
- Extension requires VS Code 1.104.0+
- Cursor should be compatible

### ✅ **Expected Commands in Palette:**
When you type "Pomodoro" you should see:
- Pomodoro: Start Focus Session
- Pomodoro: Start Break  
- Pomodoro: Start Long Break (15min)
- Pomodoro: Stop Timer
- Pomodoro: Reset Timer
- Pomodoro: Pause Timer
- Pomodoro: Resume Timer
- Pomodoro: Show Statistics
- Pomodoro: Test Commands

### 🐛 **Still Having Issues?**

1. **Check activation events** - Extension activates on first command use
2. **Try clicking status bar** - Should show timer
3. **Check for error notifications** - VS Code will show extension errors
4. **Verify file compilation** - Check `out/` folder has .js files

### 📱 **Quick Verification:**
- Status bar shows: `$(watch) Start Pomodoro`
- Clicking it starts timer
- Welcome notification appears
- Commands appear in palette

The extension should work immediately after pressing F5!