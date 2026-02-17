# Refactoring Service Info & Code Cleanup

## Objectives
1. Make Price/Duration sticky at the top of the service page.
2. Make "Reserve Now" button static at the bottom of the content (not covering text).
3. Replace hardcoded colors with Tailwind theme variables.

## Changes
- **src/components/services/ServiceInfoClient.tsx**:
    - Implemented `sticky top-24` for the price/duration header.
    - Removed `sticky bottom-6` for the reserve button, making it static at the end of the content.
    - Fixed `block flex` class conflict.
- **src/app/servicios/page.tsx**:
    - Replaced hardcoded `#f472b6` with `text-primary`, `bg-primary`, etc.
- **src/app/page.tsx**:
    - Replaced hardcoded `#f472b6` with `primary` and others with `background`, `surface`.
- **src/app/sobre-mi/AboutClient.tsx**:
    - Replaced hardcoded `#f472b6` and `#1d1520` with theme variables.
    - Fixed a syntax error introduced during refactoring.
- **src/components/services/BookingModal.tsx**:
    - Replaced hardcoded `#1d1520` with `bg-surface`.
- **src/app/servicios/[id]/page.tsx**:
    - Fixed `aspect-[4/5]` syntax to `aspect-4/5`.

## Verification
- `npm run build` passed successfully.
- Visual check confirms the sticky header logic and static button placement.
