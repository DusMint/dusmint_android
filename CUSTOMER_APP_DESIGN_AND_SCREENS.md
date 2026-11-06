# DusMint Customer App - Comprehensive Architecture, Screens & Typography Guide

> **Target Audience:** AI Engineering Assistants (Claude / GPT), Product Designers, and React Native Developers.  
> **Repository:** `dusmint_android`  
> **Runtime Stack:** Expo SDK 54 • React Native 0.81.5 • React 19.1.0 • React Navigation 6 • TypeScript (Strict) • TanStack Query 5 • Zustand

---

## 1. Executive Summary & Architecture Overview

DusMint Customer App is a hyper-local, 10-minute quick-commerce mobile application built for Android. The architecture is modeled after top-tier quick-commerce experiences (Swiggy Instamart, Blinkit, and Zepto), customized for Indian tier-1/tier-2 urban markets with a farm-fresh, verified local mandi merchant network.

### High-Level Navigation Architecture
The navigation tree is managed by `RootNavigator.tsx` via `@react-navigation/native-stack` wrapped in a `SafeAreaProvider`:
```
RootStack (Native Stack)
├── Onboarding & Auth Flow (Splash, OnBoarding, Welcome, Login, SignUp, Otp)
├── MainTabs (Bottom Tab Navigator)
│   ├── HomeTab (HomeScreen - 10-min grocery discovery feed)
│   ├── CategoriesTab (CategoriesScreen - full catalog grid)
│   ├── OrdersTab (OrdersListScreen - active & past orders)
│   └── AccountTab (ProfileScreen - user settings, addresses, support)
├── Discovery & Items Flow (ItemListScreen, ProductDetailScreen, SearchScreen)
├── Cart & Checkout Flow (CartScreen, SlotAndAddressScreen)
├── Wishlist Flow (WishlistScreen)
├── Location & Geo Flow (SelectLocationScreen, ConfirmLocationMapScreen, LocationDetailsScreen)
└── Fulfillment & Post-Order (OrderTrackingScreen, ReportClaimScreen)
```

---

## 2. Complete Screen Directory & Trigger Matrix

Total Registered Screens: **21 Screens**

| # | Screen Name | File Path | Route Key | Trigger / How It Is Triggered | Transition |
|---|---|---|---|---|---|
| 1 | **Splash** | `src/screens/onboarding/SplashScreen.tsx` | `Splash` | Initial app launch (`initialRouteName="Splash"`) | Fade |
| 2 | **OnBoarding** | `src/screens/onboarding/OnBoardingScreen.tsx` | `OnBoarding` | Triggered from `Splash` if first-time user | Slide right |
| 3 | **Welcome** | `src/screens/onboarding/WelcomeScreen.tsx` | `Welcome` | Triggered after OnBoarding completion | Slide right |
| 4 | **Login** | `src/screens/auth/LoginScreen.tsx` | `Login` | Triggered from Welcome "Login" or session expiry | Slide right |
| 5 | **SignUp** | `src/screens/auth/SignUpScreen.tsx` | `SignUp` | Triggered from Login screen via "Create Account" link | Slide right |
| 6 | **Otp** | `src/screens/auth/OtpScreen.tsx` | `Otp` | Triggered from Login/SignUp after entering valid phone | Slide right |
| 7 | **Home** | `src/screens/home/HomeScreen.tsx` | `MainTabs > HomeTab` | Default tab after auth or guest exploration | Tab Switch |
| 8 | **Categories** | `src/screens/categories/CategoriesScreen.tsx` | `MainTabs > CategoriesTab` | Bottom tab tap on "Categories" or "See All" | Tab Switch |
| 9 | **Orders List** | `src/screens/orders/OrdersListScreen.tsx` | `MainTabs > OrdersTab` | Bottom tab tap on "Orders" | Tab Switch |
| 10 | **Profile / Account**| `src/screens/profile/ProfileScreen.tsx` | `MainTabs > AccountTab` | Bottom tab tap on "Account" | Tab Switch |
| 11 | **Item List** | `src/screens/items/ItemListScreen.tsx` | `ItemList` | Tapping any Category Tile, Banner, or Collection | Slide right |
| 12 | **Product Detail** | `src/screens/product_detail/ProductDetailScreen.tsx` | `ProductDetail` | Tapping any Product Card anywhere across the app | Bottom Sheet Slide |
| 13 | **Search** | `src/screens/search/SearchScreen.tsx` | `Search` | Tapping Search Bar on Home or Categories screen | Fade |
| 14 | **Cart** | `src/screens/cart/CartScreen.tsx` | `Cart` | Tapping `CartStickyBar` or Cart Icon in header | Slide right |
| 15 | **Slot & Address** | `src/screens/checkout/SlotAndAddressScreen.tsx` | `SlotAndAddress` | Tapping "Proceed to Checkout" from `CartScreen` | Slide right |
| 16 | **Select Location** | `src/screens/location/SelectLocationScreen.tsx` | `SelectLocation` | Tapping Address Pill in Home header or Cart | Bottom Sheet Slide |
| 17 | **Confirm Map** | `src/screens/location/ConfirmLocationMapScreen.tsx` | `ConfirmLocationMap` | Tapping "Add New Address" or pin-drop on map | Bottom Sheet Slide |
| 18 | **Location Details** | `src/screens/location/LocationDetailsScreen.tsx` | `LocationDetails` | Triggered after dropping map pin in Confirm Map | Slide right |
| 19 | **Order Tracking** | `src/screens/orders/OrderTrackingScreen.tsx` | `OrderTracking` | Triggered immediately post-checkout or from Orders | Slide right |
| 20 | **Report Claim** | `src/screens/orders/ReportClaimScreen.tsx` | `ReportClaim` | Tapping "Report Issue / Claim" on a delivered order | Slide right |
| 21 | **Wishlist** | `src/screens/wishlist/WishlistScreen.tsx` | `Wishlist` | Tapping Heart icon in Header or Profile | Slide right |

---

## 3. Screen-by-Screen Component & Content Inventory

### 3.1 SplashScreen (`SplashScreen.tsx`)
- **How Triggered:** App launch.
- **Visual Components:**
  - Fullscreen gradient container (`#FAF8F5` to `#FFFFFF`)
  - Animated pulsing DusMint circular clock/speed emblem (`assets/img/app_logo.png`)
  - Circular animated ripple waves
  - Bottom tagline & trust badge strip
- **Written Content:**
  - Hero Brand: `10 MINT`
  - Subtitle: `Groceries delivered in minutes`
  - Body: `Fresh sabzi, dairy and more at your door`
  - Trust Marks: `FRESH • FAST • TRUSTED`
- **Actions:** Auto-navigates to `MainTabs` if authenticated/guest or `OnBoarding` if first visit.

### 3.2 LoginScreen (`LoginScreen.tsx`) & OtpScreen (`OtpScreen.tsx`)
- **How Triggered:** Auth gateway.
- **Visual Components:**
  - DusMint hero illustration banner
  - Country code dropdown pill (`+91` with custom `IndiaFlag` SVG widget)
  - 10-digit mobile number input card (`RoundTextField`)
  - 6-digit split OTP input boxes with auto-focus and auto-submit
  - OTP Resend countdown timer pill
  - Biometric / Truecaller one-tap prompt placeholder
- **Written Content:**
  - Heading: `India's Last Minute App`
  - Subtitle: `Log in or sign up to continue`
  - OTP Prompt: `We've sent a 6-digit code to +91 XXXXX XXXXX`
  - Legal disclaimer: `By continuing, you agree to our Terms of Service & Privacy Policy`

### 3.3 HomeScreen (`HomeScreen.tsx`)
- **How Triggered:** Primary Home Tab.
- **Visual Components:**
  - `AddressHeader`: Delivery time badge (`⚡ 9 MINS`), Address label, dropdown caret, Profile avatar & Wishlist heart button.
  - `SearchBarWidget`: Search input bar with rotating placeholder (`"Search 'tamatar', 'amul milk'..."`) and mic icon.
  - `PromoBannerCarousel`: Auto-scrolling horizontal banner cards for Mandi discounts and flash sales.
  - `QuickCategoryGrid`: 8-10 circular/rounded category tiles with vibrant soft backgrounds (`Vegetables`, `Fruits`, `Dairy & Bread`, `Mandi Specials`).
  - `MandiPriceComparisonWidget`: Live Govt Mandi vs DusMint rate comparison pill (`Govt Mandi Rate vs DusMint Direct`).
  - `ProductHorizontalRail`: "Fresh Vegetables Near You", "Instant Cooking Essentials" rails with `ItemCard`.
  - `CartStickyBar`: Bottom floating cart bar displaying item count, subtotal, and "View Cart →".
- **Written Content:**
  - Delivery ETA: `9 MINS to Home`
  - Address: `Royal Palms, Scheme 54, Vijay Nagar, Indore`
  - Headings: `Mandi Fresh Sabzi`, `Direct from Farmers`, `Best Deals Today`

### 3.4 ItemListScreen (`ItemListScreen.tsx`)
- **How Triggered:** Tapping category from Home or Categories tab.
- **Visual Components:**
  - Top search & category title header with Back arrow
  - Filter & Sort Horizontal Chip Bar: `Sort By`, `Price: Low to High`, `Discount`, `In Stock Only`
  - 2-Column Responsive Product Grid utilizing `ItemCard`
  - Out-of-stock badge overlays
  - `CartStickyBar` anchored to bottom
- **Written Content:**
  - Category Title: `Fresh Vegetables (38 items)`
  - Subtitle: `Sourced fresh at 4:00 AM from Indore Mandi`

### 3.5 ProductDetailScreen (`ProductDetailScreen.tsx`)
- **How Triggered:** Tapping any product card (rendered as a bottom sheet modal).
- **Visual Components:**
  - Product Image Carousel (high-res images with zoom & pagination dots)
  - Delivery ETA chip (`⚡ 9 MINS`)
  - Mandi Freshness Guarantee Badge (`Farm to Table within 6 hours`)
  - Weight / Pack Size Selector Chips (`500 g`, `1 kg`, `2 kg`)
  - Price & MRP strip with calculated savings percentage
  - Stepper Quantity Button (`- 1 +`)
  - Product Highlights Table: Shelf Life, Storage Instructions, Source Mandi
  - Similar Items Recommended Rail
- **Written Content:**
  - Title: `Desi Hybrid Tomato / देशी टमाटर`
  - Price: `₹35` • MRP: `₹45` • `(22% OFF)`
  - Nutrition & Mandi Info bullet points

### 3.6 CartScreen (`CartScreen.tsx`)
- **How Triggered:** Tapping "View Cart" on sticky bar or header.
- **Visual Components:**
  - Delivery ETA Strip: `Delivering to Home in 9 mins`
  - Cart Item List: Thumbnail, item title, unit, price, and `- / +` stepper button
  - Missing Items / Smart Add-on Carousel ("Customers also bought coriander, green chillies")
  - Coupon Code Input Card with "Apply" button
  - Bill Details Card:
    - Item Total
    - Delivery Fee (`FREE` over ₹99)
    - Handling / Small Cart Fee
    - Total Savings Badge
    - Grand Total in bold
  - Cancellation Policy info card
  - Bottom Floating Checkout Bar: Grand Total + `Proceed to Checkout →`
- **Written Content:**
  - Headings: `Bill Summary`, `Offers & Coupons`, `Delivery Partner Tip`

### 3.7 SlotAndAddressScreen (`SlotAndAddressScreen.tsx`)
- **How Triggered:** "Proceed to Checkout" from Cart.
- **Visual Components:**
  - Delivery Address Selection Card (selected address, "Change" button)
  - Delivery Slot Selector:
    - `⚡ Instant Delivery (8-10 mins)`
    - `🌅 Morning Slot (07:00 AM - 10:00 AM)`
    - `🌆 Evening Slot (05:00 PM - 08:00 PM)`
  - Substitution Preference Selector Radio Group:
    - `Replace with similar product if unavailable`
    - `Do not substitute (refund to original payment mode)`
  - Payment Method Options:
    - UPI Instant (GPay / PhonePe / Paytm intent)
    - Doorstep Dynamic UPI QR on Delivery
    - Cash on Delivery (COD)
  - Slide to Pay / Confirm Button
- **Written Content:**
  - Notice: `Delivery Partner carries digital scale for open-box weight verification`

### 3.8 Location Selection & Map Flow (`SelectLocationScreen`, `ConfirmLocationMapScreen`, `LocationDetailsScreen`)
- **How Triggered:** Address picker or checkout.
- **Visual Components:**
  - Interactive Leaflet / WebView Map with center animated pin drop
  - GPS Current Location Button (`Use Current Location`)
  - Live Reverse-Geocoded Address Card (`Indore, Scheme 54, Vijay Nagar`)
  - House / Flat / Block No Text Input
  - Landmark & Floor Input
  - Address Type Selector Chips: `Home 🏠`, `Work 🏢`, `Other 📍`
  - Serviceability Warning Banner (if outside cluster delivery radius)

### 3.9 OrderTrackingScreen (`OrderTrackingScreen.tsx`)
- **How Triggered:** Post-payment or tapping an active order.
- **Visual Components:**
  - Live Animated Leaflet Map with real-time rider GPS tracking marker
  - Delivery ETA Countdown Ring (`Arriving in 6 mins`)
  - Multi-Stage Status Timeline:
    1. `Order Placed`
    2. `Packed & Weighed at Mandi Hub` (with Tamper Seal ID)
    3. `Rider Picked Up`
    4. `At Your Doorstep`
  - Delivery OTP Card: Large bold 4-digit code presented to delivery rider
  - Order Items Summary Accordion
  - Delivery Partner Card: Rider photo, name, vehicle number, "Call Partner" button
  - "Need Help? / Dispute Item" button

---

## 4. Reusable Component Inventory

| Component Name | File Path | Purpose & Visual Output |
|---|---|---|
| `ItemCard` | `src/ui/components/ItemCard.tsx` | Standard 2-column product card with image, weight tag, price, MRP line-through, and `+ ADD` stepper button. |
| `CartStickyBar` | `src/ui/components/CartStickyBar.tsx` | Floating bottom bar visible on scroll whenever cart count > 0. Displays items count, subtotal, and arrow. |
| `OfflineTopBanner` | `src/ui/components/OfflineTopBanner.tsx` | Non-intrusive amber/red top banner that slides down when internet connection drops. |
| `OfflineFullScreenView` | `src/ui/components/OfflineFullScreenView.tsx` | Full-page fallback when network is required for checkout/order placement. |
| `RoundButton` | `src/ui/components/RoundButton.tsx` | Standard high-converting rounded CTA button with primary orange background and bold white text. |
| `RoundTextField` | `src/ui/components/RoundTextField.tsx` | Pill-shaped text input with clean placeholder, clear icon, and active border highlight. |
| `SlotBadge` | `src/ui/components/SlotBadge.tsx` | Amber / Orange slot pill tag for morning and evening delivery badges. |
| `TrustBadge` | `src/ui/components/TrustBadge.tsx` | Mandi verified / 100% fresh guarantee badge with shield icon. |

---

## 5. Typography Scale & Font Hierarchy

### Current Font Setup
The app officially loads **Metropolis** and **Okra** font files (`assets/font/Metropolis-*.otf`) in `App.tsx` via `expo-font`, with backward-compatible aliases for legacy Poppins and NotoSans:
- `Metropolis-Regular` (400)
- `Metropolis-Medium` (500)
- `Metropolis-SemiBold` (600)
- `Metropolis-Bold` (700)
- `Metropolis-ExtraBold` (800)

---

### The Problem: Font Fragmentation
Currently, across different screens, various arbitrary font sizes are used (`9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 34`). This causes visual inconsistency, layout shifting across Android display scaling settings, and difficult maintenance.

---

### Disciplined 6-Tier Typography Scale (Design System Recommendation)

To create a clean, cohesive visual hierarchy, all customer app components should be mapped to the following **6 standardized typographic tiers**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TIER 1: DISPLAY / HERO (32px • ExtraBold 800 • LineHeight: 38px)       │
│ Usage: Brand splash, Big ETA numbers ("9 MINS"), Order Success Code    │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 2: TITLE / SECTION HEADER (20px • Bold 700 • LineHeight: 26px)    │
│ Usage: Page Titles, Main Section Headers ("Mandi Fresh Sabzi")         │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 3: CARD TITLE / SUBTITLE (16px • SemiBold 600 • LineHeight: 22px) │
│ Usage: Product Titles in Detail, Order Card IDs, Bill Grand Total      │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 4: BODY PRIMARY / LABELS (14px • Medium 500 • LineHeight: 20px)   │
│ Usage: ItemCard Product Names, Address lines, Button Labels, Price     │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 5: BODY SECONDARY / CAPTIONS (12px • Regular 400 • LineHeight: 16)│
│ Usage: Subtext, Timestamps, Delivery Slot notes, MRP strikethroughs    │
├────────────────────────────────────────────────────────────────────────┤
│ TIER 6: MICRO / BADGES / CHIPS (10px • Bold 700 • LineHeight: 14px)    │
│ Usage: "90% OFF" chips, "ACTION REQUIRED", Status dots, Qty badges     │
└────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Specification Table

| Level | Size (`fontSize`) | Weight (`fontWeight`) | Font Family | Line Height | Letter Spacing | Best Used For |
|---|---|---|---|---|---|---|
| **Display** | `32px` | `800` (ExtraBold) | `Metropolis-ExtraBold` | `38px` | `-0.5px` | Big Delivery ETA, Splash title, Delivery OTP |
| **Title / H1** | `20px` | `700` (Bold) | `Metropolis-Bold` | `26px` | `-0.2px` | Screen Top Titles (`Search`, `Checkout`, `Cart`) |
| **Subtitle / H2**| `16px` | `600` (SemiBold) | `Metropolis-SemiBold`| `22px` | `0px` | Category headers, Product Title in details |
| **Body Primary**| `14px` | `500` (Medium) | `Metropolis-Medium` | `20px` | `0px` | Product title in grid, Item quantity, Button CTAs |
| **Caption** | `12px` | `400` (Regular) | `Metropolis-Regular`| `16px` | `0px` | Secondary text, MRP, store cluster info |
| **Micro / Tag** | `10px` | `700` (Bold) | `Metropolis-Bold` | `14px` | `+0.5px` (Caps) | Action badges, Discount chips, Status tags |

---

## 6. UI Betterment & Clean Coding Recommendations

1. **Strict Typecheck Guarantee:**  
   Always run `npm run typecheck` (`tsc --noEmit`) before committing code to ensure API payload contracts and component props match.
2. **Safe Area Inset Discipline:**  
   Never import `SafeAreaView` from `'react-native'`. Always use `useSafeAreaInsets` from `react-native-safe-area-context` to apply dynamic `paddingTop: insets.top` on custom headers and `paddingBottom: insets.bottom` on floating buttons.
3. **Price & Currency Formatting Rule:**  
   Always store currency in integer paise (e.g., `3500` paise = `₹35`). Render using `Math.round(pricePaise / 100)` to eliminate floating-point rounding bugs (`₹34.99999`).
4. **4-Point / 8-Point Spacing Grid:**  
   Standardize spacing increments: `4px (xs)`, `8px (sm)`, `12px (md)`, `16px (base)`, `24px (lg)`, `32px (xl)`.

