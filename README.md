# CSV to JSON API

A Node.js API to upload CSV files, convert them to JSON, and store them in a PostgreSQL database with batch inserts.

- Upload CSV files via `/upload` endpoint
- Stream-based CSV parsing for large files
- Batch insert into database with configurable batch size
- Tracks upload summary and age-group distribution

