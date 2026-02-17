# Fixes: Sticky Header & Services Filtering

## Changes

1.  **Sticky Header Alignment**:
    - Adjusted `ServiceInfoClient.tsx` header to `top-[74px]` and `bg-[#120d14]/95` to seamlessly blend with the navbar.

2.  **Services Not Showing**:
    - Simplified the base query in `src/app/servicios/page.tsx` to remove the complex join with `service_categories` that was likely causing empty results due to schema definition issues or missing relationships.

3.  **Filtering Logic**:
    - Refactored the filtering logic in `src/app/servicios/page.tsx`. Instead of using an inner join on the `slug`, we now first query the `service_categories` table to resolve the category ID from the slug, and then filter `products` directly by `category_id`. This is more robust and prevents errors.

## Verification
- `npm run build` passed.
- Services should now appear on the `/servicios` page.
- Filters (like "Limpiezas") should now correctly display the relevant services.
