#!/usr/bin/env python3
"""
Phase 4 (Final): Store Images and Metadata in MongoDB
====================================================

This script stores the grouped image data from Phase 3 into MongoDB:
- Connects to MongoDB using provided URI
- Stores images grouped by figure
- Creates indexes for efficient retrieval
- Calculates coverage statistics
"""

import json
import sys
import os
from datetime import datetime
from pymongo import MongoClient
import argparse

def connect_mongodb(mongo_uri):
    """Connect to MongoDB"""
    try:
        client = MongoClient(mongo_uri)
        # Test connection
        client.admin.command('ping')
        print("✅ Connected to MongoDB")
        return client
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        sys.exit(1)

def calculate_coverage(images):
    """Calculate coverage by image type"""
    coverage = {
        "portrait": 0,
        "achievement": 0,
        "invention": 0,
        "artifact": 0
    }
    
    for img in images:
        img_type = img.get("type", "achievement")
        if img_type in coverage:
            coverage[img_type] += 1
    
    return coverage

def store_figure_images(collection, figure_data):
    """Store or update images for a figure"""
    try:
        figure_name = figure_data["figure_name"]
        category = figure_data["category"]
        epoch = figure_data["epoch"]
        images = figure_data["images"]
        
        if not images:
            print(f"    ⚠️ No images for {figure_name}")
            return False
        
        # Calculate coverage
        coverage = calculate_coverage(images)
        
        # Prepare document
        doc = {
            "figureName": figure_name,
            "category": category,
            "epoch": epoch,
            "images": images,
            "lastUpdated": datetime.now(),
            "totalImages": len(images),
            "coverage": coverage
        }
        
        # Upsert to database
        filter_query = {
            "figureName": figure_name,
            "category": category,
            "epoch": epoch
        }
        
        result = collection.replace_one(filter_query, doc, upsert=True)
        
        if result.modified_count > 0 or result.upserted_id:
            print(f"    ✅ Stored {len(images)} images for {figure_name}")
            return True
        else:
            print(f"    ⚠️ No changes for {figure_name}")
            return False
        
    except Exception as e:
        print(f"    ❌ Failed to store images for {figure_name}: {e}")
        return False

def create_indexes(collection):
    """Create indexes for efficient retrieval"""
    try:
        # Create indexes
        collection.create_index([("figureName", 1), ("category", 1), ("epoch", 1)])
        collection.create_index([("category", 1)])
        collection.create_index([("epoch", 1)])
        collection.create_index([("lastUpdated", -1)])
        
        print("✅ Created database indexes")
        return True
    except Exception as e:
        print(f"❌ Failed to create indexes: {e}")
        return False

def get_database_stats(collection):
    """Get statistics about stored data"""
    try:
        total_documents = collection.count_documents({})
        total_images = collection.aggregate([
            {"$group": {"_id": None, "total": {"$sum": "$totalImages"}}}
        ]).next()["total"]
        
        # Coverage by category
        category_stats = collection.aggregate([
            {"$group": {"_id": "$category", "figures": {"$sum": 1}, "images": {"$sum": "$totalImages"}}}
        ])
        
        # Coverage by epoch
        epoch_stats = collection.aggregate([
            {"$group": {"_id": "$epoch", "figures": {"$sum": 1}, "images": {"$sum": "$totalImages"}}}
        ])
        
        return {
            "total_documents": total_documents,
            "total_images": total_images,
            "category_stats": list(category_stats),
            "epoch_stats": list(epoch_stats)
        }
    except Exception as e:
        print(f"❌ Failed to get database stats: {e}")
        return None

def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description="Phase 4 (Final): Store Images in MongoDB")
    parser.add_argument("--mongo-uri", required=True, help="MongoDB connection string")
    parser.add_argument("--test", action="store_true", help="Test with first 10 figures only")
    
    args = parser.parse_args()
    
    print("💾 Phase 4 (Final): Store Images and Metadata in MongoDB")
    print("=" * 60)
    
    # Check if grouped images exist
    grouped_file = "grouped_images_for_mongodb.json"
    if not os.path.exists(grouped_file):
        print(f"❌ Error: {grouped_file} not found")
        print("Please run phase3-validation-final.py first")
        sys.exit(1)
    
    # Connect to MongoDB
    print("🔌 Connecting to MongoDB...")
    client = connect_mongodb(args.mongo_uri)
    db = client.orbgame
    collection = db.historical_figure_images
    
    # Load grouped images
    print(f"📖 Loading grouped images from {grouped_file}...")
    with open(grouped_file, "r") as f:
        grouped_data = json.load(f)
    
    print(f"📊 Processing {len(grouped_data)} figures...")
    
    # Process figures
    successful_stores = 0
    total_images_stored = 0
    
    # Limit to first 10 if test mode
    if args.test:
        grouped_data = grouped_data[:10]
        print(f"🧪 Test mode: Processing first {len(grouped_data)} figures")
    
    for i, figure_data in enumerate(grouped_data):
        figure_name = figure_data["figure_name"]
        category = figure_data["category"]
        epoch = figure_data["epoch"]
        images = figure_data["images"]
        
        print(f"📋 [{i+1}/{len(grouped_data)}] Processing {figure_name} ({category}/{epoch})")
        
        if store_figure_images(collection, figure_data):
            successful_stores += 1
            total_images_stored += len(images)
    
    # Create indexes
    print("\n🔧 Creating database indexes...")
    create_indexes(collection)
    
    # Get database statistics
    print("\n📊 Getting database statistics...")
    stats = get_database_stats(collection)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 PHASE 4 (FINAL) SUMMARY")
    print("=" * 60)
    print(f"Total Figures Processed: {len(grouped_data)}")
    print(f"Successful Stores: {successful_stores}")
    print(f"Total Images Stored: {total_images_stored}")
    print(f"Success Rate: {(successful_stores/len(grouped_data)*100):.1f}%")
    
    if stats:
        print(f"\n📈 Database Statistics:")
        print(f"  Total Documents: {stats['total_documents']}")
        print(f"  Total Images: {stats['total_images']}")
        
        print(f"\n📈 Coverage by Category:")
        for cat_stat in stats['category_stats']:
            print(f"  {cat_stat['_id']}: {cat_stat['figures']} figures, {cat_stat['images']} images")
        
        print(f"\n📈 Coverage by Epoch:")
        for epoch_stat in stats['epoch_stats']:
            print(f"  {epoch_stat['_id']}: {epoch_stat['figures']} figures, {epoch_stat['images']} images")
    
    print(f"\n🎯 Images are now available in MongoDB!")
    print(f"   Database: orbgame")
    print(f"   Collection: historical_figure_images")
    print(f"   Query example: db.historical_figure_images.find({{'figureName': 'Archimedes'}})")

if __name__ == "__main__":
    main() 