# Quick Reference Guide - Category Fix Deployment

## 🚀 For Administrators/DevOps

### Pre-Deployment Checklist
- [ ] Review migration file: `supabase/migrations/20260222170000_add_missing_default_categories.sql`
- [ ] Check current category count in production database
- [ ] Backup database (optional but recommended)
- [ ] Schedule deployment during low-traffic period (optional - zero downtime)

### Deployment Steps

#### Option 1: Using Supabase CLI (Recommended)
```bash
# 1. Navigate to project directory
cd /path/to/lemon-beta

# 2. Apply migrations
supabase db push

# 3. Verify deployment
supabase db query < supabase/migrations/VERIFY_20260222170000.sql
```

#### Option 2: Using Supabase Dashboard
```
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of: supabase/migrations/20260222170000_add_missing_default_categories.sql
3. Paste and Execute
4. Run verification queries from VERIFY_20260222170000.sql
```

#### Option 3: Direct Database Connection
```bash
# Connect to database
psql "postgresql://[connection-string]"

# Run migration
\i supabase/migrations/20260222170000_add_missing_default_categories.sql

# Verify
\i supabase/migrations/VERIFY_20260222170000.sql
```

### Post-Deployment Verification

#### Expected Results
```sql
-- Should return:
--  type     | count
-- ----------+-------
--  expense  |    16
--  income   |     9
--  internal |     1

SELECT type, COUNT(*) as count
FROM public.categories 
WHERE is_default = TRUE 
GROUP BY type
ORDER BY type;
```

#### Success Criteria
✅ 16 expense categories  
✅ 9 income categories  
✅ 1 internal category  
✅ No old category names (check with verification script)  
✅ No errors in migration log

### Rollback (If Needed)

**Note**: Rollback is NOT recommended as changes are additive only.

If absolutely necessary:
```sql
-- Delete newly added categories
DELETE FROM public.categories 
WHERE is_default = TRUE 
  AND name IN (
    'Langganan Digital',
    'Bisnis & Produktivitas',
    'Keluarga & Anak',
    'Sosial & Donasi',
    'Investasi & Aset',
    'Cicilan & Pinjaman'
  )
  AND type = 'expense';

-- Revert renamed categories
UPDATE public.categories SET name = 'Rumah' 
WHERE name = 'Rumah & Properti' AND is_default = TRUE;

UPDATE public.categories SET name = 'Lain-lain' 
WHERE name IN ('Biaya Lain-lain', 'Pendapatan Lain') AND is_default = TRUE;
```

---

## 👨‍💻 For Developers

### Understanding the Fix

**Root Cause**: Code defined 26 categories, database only had 12-19 (depending on migration history)

**Solution**: Migration adds missing 7 categories + renames 3 for consistency

### Code Integration

Categories are globally available via RLS policy:
```sql
CREATE POLICY "Users can view default categories and their own" 
ON public.categories
FOR SELECT 
USING (is_default = TRUE OR auth.uid() = user_id);
```

This means:
- Default categories (is_default=TRUE, user_id=NULL) visible to ALL users
- No code changes needed in frontend
- Categories automatically appear in selectors

### Testing Locally

1. **Start local Supabase** (if applicable):
   ```bash
   supabase start
   ```

2. **Apply migration**:
   ```bash
   supabase db reset  # Reset to clean state
   # or
   supabase db push   # Apply new migrations only
   ```

3. **Verify in app**:
   - Open app
   - Create new transaction
   - Check category selector shows all 26 categories

4. **Run verification script**:
   ```bash
   supabase db query < supabase/migrations/VERIFY_20260222170000.sql
   ```

### Code Locations

- **Category Definitions**: `src/lib/categories.ts`
- **Category Hooks**: `src/features/transactions/hooks/use-categories.ts`
- **Category Selector UI**: `src/features/transactions/components/form-partials/category-selector.tsx`
- **Database Schema**: `supabase/migrations/20260119000001_categories_setup.sql`

### Adding New Categories (Future)

To add new categories in the future:

1. **Update code**: Add to `src/lib/categories.ts`
2. **Create migration**: Add INSERT statement with IF NOT EXISTS check
3. **Document**: Update CHANGELOG.md and relevant docs
4. **Verify**: Test locally before deploying

---

## 📊 Monitoring & Health Checks

### Key Metrics to Monitor

```sql
-- Category count by type
SELECT type, COUNT(*) FROM public.categories 
WHERE is_default = TRUE GROUP BY type;

-- Recent category usage
SELECT category, COUNT(*) as usage_count 
FROM public.transactions 
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY category 
ORDER BY usage_count DESC;

-- Categories with no transactions (potential unused)
SELECT c.name, c.type 
FROM public.categories c
LEFT JOIN public.transactions t ON t.category = c.name
WHERE c.is_default = TRUE 
  AND t.id IS NULL;
```

### Common Issues & Solutions

#### Issue: Categories not showing up
**Cause**: Migration not applied  
**Solution**: Run migration, verify with VERIFY script

#### Issue: Users reporting missing categories
**Cause**: Cache or stale data  
**Solution**: Users should refresh app, or check RLS policy

#### Issue: Duplicate categories
**Cause**: Migration run multiple times without IF NOT EXISTS  
**Solution**: This migration is idempotent, but check for duplicates:
```sql
SELECT name, type, COUNT(*) 
FROM public.categories 
WHERE is_default = TRUE 
GROUP BY name, type 
HAVING COUNT(*) > 1;
```

---

## 📚 Documentation Links

- **User Guide**: [KATEGORI_FIX_README.md](KATEGORI_FIX_README.md) (Indonesian + English)
- **Visual Docs**: [CATEGORIES_VISUAL.md](CATEGORIES_VISUAL.md) (Diagrams and comparisons)
- **Technical Analysis**: [SOLUTION_SUMMARY.md](SOLUTION_SUMMARY.md) (Root cause & solution)
- **Migration Docs**: [supabase/migrations/README_20260222170000.md](supabase/migrations/README_20260222170000.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md) (Version 2.5.1)

---

## 🆘 Support

**Questions?** Check the documentation links above or review:
- Code: `src/lib/categories.ts`
- Database: `supabase/migrations/20260222170000_add_missing_default_categories.sql`
- Verification: `supabase/migrations/VERIFY_20260222170000.sql`

**Found an issue?** 
1. Check verification script results
2. Review migration logs
3. Compare with expected counts (16/9/1)
4. Open issue with details

---

**Version**: 2.5.1  
**Date**: 22 February 2026  
**Status**: ✅ Ready for Production Deployment
