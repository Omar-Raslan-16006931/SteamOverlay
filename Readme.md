<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=10&height=200&section=header&text=Steam%20Price%20Overlay&fontSize=56&fontColor=ffffff&fontAlignY=36&desc=Always-on-top%20desktop%20overlay%20that%20converts%20Steam%20prices%20in%20real%20time&descSize=16&descAlignY=58&animation=fadeIn" width="100%" alt="Steam Price Overlay"/>

<img src="https://img.shields.io/github/last-commit/Omar-Raslan-16006931/SteamOverlay?style=for-the-badge&color=6366f1" alt="Last commit"/>
<img src="https://img.shields.io/github/languages/top/Omar-Raslan-16006931/SteamOverlay?style=for-the-badge&color=0ea5e9" alt="Top language"/>

<br/><br/>

<img src="https://skillicons.dev/icons?i=electron,js,html,css,nodejs&theme=dark" alt="Tech stack"/>

</div>

---

> A lightweight always-on-top desktop overlay that converts Steam store prices between any two currencies in real time.

---

## ✨ Features

- 💱 **160+ currencies** — loaded live from the exchange rate API on every startup
- 🔄 **Auto rate fetch** — latest rates loaded automatically when the app opens
- ↕️ **Bidirectional conversion** — edit either amount and the other updates instantly
- 🔁 **Swap button** — flip from/to currencies in one click
- 📌 **Always on top** — stays above Steam and all other windows
- 🔒 **Lock mode** — overlay becomes click-through so Steam stays fully usable underneath
- 🖱️ **Draggable** — drag the top bar to reposition anywhere on screen
- ⌨️ **Hotkeys** — show/hide and lock/unlock without touching the mouse

---

## 🚀 Installation

1. Download the latest **SteamPriceOverlay-Setup.exe** from the releases page
2. Run the installer and follow the steps
3. Launch **Steam Price Overlay** from your desktop or Start Menu

> ⚠️ Windows may show a SmartScreen warning on first launch since the app is not signed.
> Click **More info → Run anyway** to proceed. The app is safe.

---

## 🧭 How to Use

| Step | Action |
|------|--------|
| 1 | Open **Steam** and browse to any game store page |
| 2 | Launch **Steam Price Overlay** |
| 3 | Select **From currency** (e.g. `UAH - Ukrainian Hryvnia`) |
| 4 | Select **To currency** (e.g. `SAR - Saudi Riyal`) |
| 5 | Type the store price in the **From amount** field |
| 6 | The converted price appears instantly in **To amount** |
| 7 | Drag the top bar to position the overlay over the Steam price |
| 8 | Click **Lock overlay** so mouse clicks pass through to Steam |

---

## ⌨️ Hotkeys

| Hotkey | Action |
|--------|--------|
| `Ctrl + Shift + O` | Show / hide overlay |
| `Ctrl + Shift + L` | Lock / unlock click-through |

---

## 🔒 Lock Mode

When locked:
- The overlay becomes **click-through** — Steam is fully clickable underneath
- The lock button turns **red**
- To unlock, press `Ctrl + Shift + L` or click the button again

---

## 💱 Exchange Rates

- Rates are fetched from [open.er-api.com](https://open.er-api.com) — **no API key needed**
- Rates update automatically every time the app starts
- You can manually refresh rates at any time using the **Refresh** button
- You can also type a custom rate manually in the rate field

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| Windows blocked the app | Click **More info → Run anyway** on the SmartScreen popup |
| Overlay shows black or glitched | Close and reopen the app |
| Rates not loading | Check internet connection, click **Refresh** to retry |
| Cannot click Steam under overlay | Click **Lock overlay** or press `Ctrl + Shift + L` |
| Cannot move overlay | Drag the **top bar** — the rest of the window does not drag by design |
| Cannot edit inputs after locking | Press `Ctrl + Shift + L` to unlock first |

---

## 📌 Notes

- This app does **not** auto-read Steam prices (yet) from the screen — you type the price manually for now
- The overlay window is transparent and borderless, so it blends naturally over Steam
- Works on **Windows 10 and 11**

---

*Built with [Electron](https://www.electronjs.org/) · Rates from [ExchangeRate-API](https://open.er-api.com)*

---

<div align="center">

**Made with ❤️ by [Omar Raslan](https://github.com/Omar-Raslan-16006931)**

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=10&height=100&section=footer" width="100%"/>

</div>
