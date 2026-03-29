---
name: Supabase Expert
description: Expert guidance on optimizing Supabase queries and schema design.
---

# Supabase Expert Skill

This skill provides expert guidance for:
1. **Query Optimization**: Advanced techniques for Supabase/Postgres query performance.
2. **Indexing**: Correct use of GIST, GIN, and B-Tree indexes for complex data.
3. **Schema Design**: Relational best practices for Postgres in a Supabase context.
4. **Performance Tuning**: Monitoring and identifying slow queries.

## Best Practices
- Use `supabase-postgres-best-practices` as the foundation.
- Prefer `SELECT` with specific columns over `*`.
- Use `explain analyze` to debug performance.
- Optimize RLS (Row Level Security) policies to avoid slow table scans.
