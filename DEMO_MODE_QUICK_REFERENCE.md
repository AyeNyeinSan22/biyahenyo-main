# DEMO_MODE Quick Reference

## ⚡ Quick Start

```bash
# Frontend is already configured
cd biyahenyo_frontend
npm run dev
```

**Status**: `VITE_DEMO_MODE=true` ✅

---

## 🎯 Complete Flow

### Passenger View
1. Login → Plan Trip
2. **Route Planner Page** shows:
   - Walking route (blue dashed) with 8 min walk
   - Pickup point (green marker) at GCH Gate
   - Destination (red marker) at Hilltop Road
   - "📍 Demo Passenger Flow" with 3 steps
3. Click "Start My Journey"
4. **Live Map Page** shows:
   - Jeepney (🚌) smoothly moving from driver's position
   - ETA and traffic updating dynamically
5. When driver reaches GCH Gate:
   - **Modal appears**: "Jeepney Arrived!"
   - Click "🚪 Board Jeepney"
   - Green banner: "✅ You are on board!"

### Driver View
1. Login → Driver Dashboard
2. See **"DEMO MODE"** label
3. See **4 checkpoint buttons**:
   - 🏬 SM Hypermarket (12 min away)
   - 🏛️ Capitolio (7 min away)
   - 📍 Near GCH Gate (3 min away)
   - 🚌 GCH Gate (0 min - ARRIVED)
4. Click buttons in sequence
5. **Real-time updates**:
   - Jeepney marker moves smoothly
   - ETA counts down
   - Traffic shows current condition

---

## 🔧 Key Implementation Files

| File | Purpose | What Changed |
|------|---------|--------------|
| `src/demo/demoData.js` | Demo scenario data | Added passenger routes + stages |
| `src/components/PassengerMap.jsx` | Map display | Added route visualization |
| `src/pages/RoutePlannerPage.jsx` | Trip planning | Added passenger flow section |
| `src/pages/LiveMapPage.jsx` | Live tracking | Added arrival modal + boarding |
| `src/pages/DriverDashboardPage.jsx` | Driver panel | No changes (already works) |

---

## 📊 Demo Data

### Passenger Journey
- **Start**: BSU Alangilan Campus (13.7598, 121.0580)
- **Pickup**: GCH Gate (13.7498, 121.0508)
- **Destination**: Hilltop Road (13.7405, 121.0450)
- **Walk**: 8 minutes via 5 waypoints
- **Ride**: 15 minutes via 5 waypoints
- **Total**: ~35 minutes + waiting

### Driver Checkpoints
1. **SM Hypermarket** (13.7565, 121.0558) - ETA 12 min, MODERATE
2. **Capitolio** (13.7539, 121.0536) - ETA 7 min, MODERATE
3. **Near GCH Gate** (13.7512, 121.0521) - ETA 3 min, LIGHT
4. **GCH Gate** (13.7498, 121.0508) - ETA 0 min, LIGHT ← **TRIGGERS ARRIVAL MODAL**

---

## ✅ Requirements Met

| # | Requirement | Status |
|---|-------------|--------|
| 1 | Keep production realtime intact | ✅ No backend changes |
| 2 | DEMO_MODE as parallel flow | ✅ Guarded by `if (DEMO_MODE)` |
| 3 | Passenger walks to pickup | ✅ Blue dashed polyline + 8 min |
| 4 | Show walking route | ✅ With user/pickup/destination markers |
| 5 | Display incoming jeepney | ✅ Yellow marker with animation |
| 6 | Driver control panel | ✅ 4 checkpoint buttons |
| 7 | Smooth animation | ✅ 1s linear interpolation |
| 8 | Jeepney arrived message | ✅ Modal with "Board Jeepney" |
| 9 | Continue trip | ✅ Green confirmation banner |
| 10 | Keep backend/API logic | ✅ All APIs active |
| 11 | Disable GPS in DEMO | ✅ Uses manual buttons instead |
| 12 | Dynamic ETA/traffic | ✅ Updates with each button click |

---

## 🧪 Test Checklist

- [ ] Route Planner shows "📍 Demo Passenger Flow"
- [ ] Walking polyline visible (blue dashed)
- [ ] Riding polyline visible (yellow solid)
- [ ] Pickup marker is green (📍)
- [ ] Destination marker is red (🎯)
- [ ] User marker is blue (👤)
- [ ] Driver Dashboard shows "DEMO MODE" label
- [ ] 4 checkpoint buttons visible
- [ ] Clicking buttons moves jeepney smoothly
- [ ] ETA updates when button clicked
- [ ] Traffic status updates
- [ ] Current stage indicator updates
- [ ] "Jeepney Arrived!" modal appears at GCH Gate
- [ ] "Board Jeepney" button works
- [ ] Green "You are on board!" banner shows

---

## 📱 UI Elements

### Passenger Flow Steps
```
🚶 Walk to GCH Gate (~8 min)
   └─ Walking distance: ~800m

⏳ Wait for Jeepney (~12 min)
   └─ Jeepney will arrive at GCH Gate

🚌 Ride to Hilltop Road (~15 min)
   └─ Ride duration: ~15 minutes
```

### Arrival Modal
```
┌─────────────────────────────────┐
│     🚌 Large Icon               │
│                                 │
│   Jeepney Arrived!              │
│                                 │
│   Your jeepney is now at        │
│   GCH Gate. Get ready to board! │
│                                 │
│   [🚪 Board Jeepney]            │
│                                 │
│   Next: Ride to Hilltop Road    │
│   (~15 min)                     │
└─────────────────────────────────┘
```

### Post-Boarding Banner
```
┌─────────────────────────────┐
│ ✅ You are on board!        │
│ Heading to Hilltop Road     │
└─────────────────────────────┘
```

---

## 🔄 Data Flow

```
Driver clicks checkpoint
    ↓
handleDemoStage() called
    ↓
updateDriverLiveLocation() API
    ↓
Backend updates driver location
    ↓
Passenger's polling fetches new position
    ↓
PassengerMap receives new driverLocation
    ↓
Smooth 1s animation to new position
    ↓
Marker updates without remounting
    ↓
ETA/traffic display updates
```

---

## 🎬 Demo Script

### 5-Minute Demo
1. **Open RoutePlannerPage**: "See the passenger's planned route"
   - Highlight walking segment (blue polyline)
   - Highlight riding segment (yellow polyline)
   - Show markers (user, pickup, destination)
2. **Click "Start My Journey"**: "Passenger is ready to board"
3. **Show LiveMapPage**: "Passenger watching jeepney approach"
4. **Switch to DriverDashboard**: "Driver controls movement with buttons"
5. **Click "GCH Gate"**: "Jeepney arrives at pickup point"
6. **Show modal**: "'Jeepney Arrived!' - Passenger boards"
7. **Click "Board Jeepney"**: "Confirmation - Trip Started!"

**Total Time**: ~5 minutes  
**Highlights**: Smooth animation, real-time updates, automatic arrival detection

---

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Demo buttons not showing | Check `VITE_DEMO_MODE=true` in .env |
| Jeepney not moving | Ensure driver clicked at least one checkpoint |
| "Jeepney Arrived!" doesn't appear | Driver must click "GCH Gate" button (4th one) |
| Routes not visible on map | Confirm `showDemoRoute={DEMO_MODE}` prop exists |
| Marker teleporting | Check `markerRef.current` is not null during animation |

---

## 💡 Key Technical Points

- **No Backend Changes**: All changes in frontend only
- **Polling-Based**: Uses existing 2000ms polling interval
- **useRef Preservation**: 4 refs prevent marker disappearance
- **Linear Interpolation**: 1-second smooth animation
- **Backward Compatible**: Works with `VITE_DEMO_MODE=false` too
- **Automatic Detection**: Arrival detection uses proximity (100m radius)

---

## 🎯 Ready To Go!

All requirements implemented ✅  
All code compiles ✅  
No errors ✅  

**Start the frontend and test the flow!**
