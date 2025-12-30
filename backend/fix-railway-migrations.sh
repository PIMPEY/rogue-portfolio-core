#!/bin/bash

# Railway Migration Fix Script
# This script helps resolve ghost migrations on Railway

echo "========================================="
echo "Railway Migration Fix Script"
echo "========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL is not set"
    echo ""
    echo "Please set it first:"
    echo "export DATABASE_URL='postgresql://user:pass@host:port/database'"
    echo ""
    echo "You can find your Railway DATABASE_URL in:"
    echo "Railway Dashboard → PostgreSQL Service → Variables"
    exit 1
fi

echo "✅ DATABASE_URL is set"
echo ""

# Check Prisma CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ ERROR: npx is not available"
    echo "Please install Node.js and npm"
    exit 1
fi

echo "✅ Prisma CLI is available"
echo ""

# Show current migration status
echo "========================================="
echo "Current Migration Status"
echo "========================================="
npx prisma migrate status
echo ""

# Ask user what to do
echo "========================================="
echo "Available Actions"
echo "========================================="
echo "1) Resolve ghost migration as rolled back"
echo "2) Deploy migrations"
echo "3) Reset database (WARNING: deletes all data)"
echo "4) Exit"
echo ""
read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "Resolving ghost migration..."
        read -p "Enter migration name to resolve (e.g., 20251229155517_phase1_investment_setup): " migration_name
        
        if [ -z "$migration_name" ]; then
            echo "❌ ERROR: Migration name is required"
            exit 1
        fi
        
        echo ""
        echo "Running: npx prisma migrate resolve --rolled-back $migration_name"
        npx prisma migrate resolve --rolled-back "$migration_name"
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Migration resolved successfully"
            echo ""
            echo "Now running migrate deploy..."
            npx prisma migrate deploy
        else
            echo ""
            echo "❌ ERROR: Failed to resolve migration"
            exit 1
        fi
        ;;
    2)
        echo ""
        echo "Running migrate deploy..."
        npx prisma migrate deploy
        ;;
    3)
        echo ""
        echo "⚠️  WARNING: This will delete all data in the database!"
        read -p "Are you sure? (type 'yes' to confirm): " confirm
        
        if [ "$confirm" = "yes" ]; then
            echo ""
            echo "Resetting database..."
            npx prisma migrate reset --force
        else
            echo "Cancelled"
            exit 0
        fi
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "❌ ERROR: Invalid option"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "Final Migration Status"
echo "========================================="
npx prisma migrate status
echo ""

echo "✅ Done!"
