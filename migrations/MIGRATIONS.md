# Migrations

To assist with changes to the database schema over time we have a set script that will
run off migration sql queries that update the schema, these sql queries will run in alphabetical
order running as part of the start up functions

## File Name Format

    Expected format: "000_add_some_columns.sql"