---
description: ## Objective Build a **frontend-only mobile application** that simulates photo-based billing and business management for a retail store.   All flows use mocked or locally stored data.
---

# Frontend Workflow – React Native (Expo)

---

## Global App Flow

App Launch  
→ Load local data (inventory, bills, balance)  
→ Open Bottom Tab Navigation  
→ User interacts with core business workflows

---

## Workflow 1: Photo-Based Billing (Home Tab)

User opens Home tab  
→ Taps "Capture Products"  
→ Camera permission check  
→ Camera opens  
→ User clicks product image  
→ Image preview shown

User confirms image  
→ Load mock detected products  
→ Display editable product list  
→ User edits quantity / price  
→ System recalculates bill total  
→ User taps "Generate Bill"

Bill generated  
→ Bill summary screen displayed  
→ Bill stored in local state  
→ Inventory quantities updated locally  
→ Cashflow updated locally

---

## Workflow 2: Inventory Management (Inventory Tab)

User opens Inventory tab  
→ Inventory list loaded from local storage  
→ Products displayed with quantity & price

User actions:

- Edit product quantity
- Edit product price
- Add new product

After update  
→ Local inventory state updated  
→ Changes persisted in AsyncStorage  
→ UI refreshed instantly

---

## Workflow 3: Cashflow Visibility (Cashflow Tab)

User opens Cashflow tab  
→ Load bills & inventory data  
→ Calculate total sales  
→ Calculate expenses (mock values)  
→ Compute current cash balance

Insights displayed:
→ Money locked in inventory  
→ Pending payments (mocked)  
→ Daily / monthly cashflow

Visuals:
→ Summary cards  
→ Charts (UI only)

---

## Workflow 4: Account & Business Analytics (Account Tab)

User opens Account tab  
→ Profile details loaded

User actions:
→ Update profile info  
→ Add / update opening balance

System calculations:
→ Total revenue from bills  
→ Total expenses (mock)  
→ Net profit or loss

Analytics displayed:
→ Best selling products  
→ Average daily sales  
→ Simple business health indicators

---

## Data Handling Workflow (Frontend Only)

App start  
→ Load AsyncStorage data  
→ If no data exists  
→ Initialize with mock data

On any update:
→ Update Context state  
→ Persist changes to AsyncStorage  
→ Re-render affected screens

---

## Navigation Workflow

Bottom Tabs:
Home ↔ Inventory ↔ Cashflow ↔ Account

Internal stack navigation:
Home  
→ Camera  
→ Bill Preview

No external API dependency.

---

## Key Constraints

- No backend calls
- No ML processing
- Camera used only for UX realism
- All calculations done locally
- Focus on clarity and usability

---

## Outcome

A fully navigable, realistic mobile app that demonstrates:

- Photo-based billing flow
- Inventory control
- Cashflow visibility
- Business analytics

Designed to be backend- and ML-ready in future phases.
