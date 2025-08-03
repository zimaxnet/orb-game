#!/usr/bin/env python3
"""
Phase 4: Store Images and Metadata in MongoDB
Insert images into MongoDB, structured by figure and image type
"""

import json
import sys
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

def store_figure_images(collection, figure_name, category, epoch, images):
    """Store or update images for a figure"""
    try:
        if not images:
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
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to store images for {figure_name}: {e}")
        return False

def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description="Phase 4: Store Images in MongoDB")
    parser.add_argument("--mongo-uri", required=True, help="MongoDB connection string")
    parser.add_argument("--test", action="store_true", help="Test with first 10 figures only")
    
    args = parser.parse_args()
    
    print("💾 Phase 4: Store Images and Metadata in MongoDB")
    print("=" * 50)
    
    # Check if filtered images exist
    if not os.path.exists("filtered_images.json"):
        print("❌ Error: filtered_images.json not found")
        print("Please run phase3-validation.py first")
        sys.exit(1)
    
    # Connect to MongoDB
    print("🔌 Connecting to MongoDB...")
    client = connect_mongodb(args.mongo_uri)
    db = client.orbgame
    collection = db.historical_figure_images
    
    # Load filtered images
    print("📖 Loading filtered images...")
    with open("filtered_images.json", "r") as f:
        filtered_images = json.load(f)
    
    print(f"📊 Processing {len(filtered_images)} filtered images...")
    
    # Group images by figure
    figures = {}
    for img in filtered_images:
        figure_key = (img["figureName"], img["category"], img["epoch"])
        if figure_key not in figures:
            figures[figure_key] = []
        figures[figure_key].append(img)
    
    # Process figures
    processed_figures = 0
    successful_figures = 0
    total_images = 0
    
    figure_list = list(figures.items())
    if args.test:
        figure_list = figure_list[:10]  # Test with first 10 figures
        print("🧪 TEST MODE: Processing first 10 figures only")
    
    for (figure_name, category, epoch), images in figure_list:
        processed_figures += 1
        
        print(f"\n📋 [{processed_figures}/{len(figure_list)}] Storing {figure_name} ({category}/{epoch})")
        print(f"    📸 {len(images)} images")
        
        # Store in MongoDB
        success = store_figure_images(collection, figure_name, category, epoch, images)
        
        if success:
            successful_figures += 1
            total_images += len(images)
            print(f"    ✅ Successfully stored")
        else:
            print(f"    ❌ Failed to store")
    
    # Generate summary
    print("\n" + "=" * 50)
    print("📊 PHASE 4 SUMMARY")
    print("=" * 50)
    print(f"Total Figures Processed: {processed_figures}")
    print(f"Successful Figures: {successful_figures}")
    print(f"Failed Figures: {processed_figures - successful_figures}")
    print(f"Total Images Stored: {total_images}")
    print(f"Success Rate: {(successful_figures/processed_figures*100):.1f}%")
    
    # Database statistics
    try:
        total_docs = collection.count_documents({})
        print(f"Total Documents in Collection: {total_docs}")
        
        # Coverage statistics
        pipeline = [
            {"$group": {
                "_id": None,
                "totalFigures": {"$sum": 1},
                "totalImages": {"$sum": "$totalImages"},
                "avgImagesPerFigure": {"$avg": "$totalImages"}
            }}
        ]
        
        stats = list(collection.aggregate(pipeline))
        if stats:
            stats = stats[0]
            print(f"Database Statistics:")
            print(f"  Total Figures in DB: {stats['totalFigures']}")
            print(f"  Total Images in DB: {stats['totalImages']}")
            print(f"  Avg Images per Figure: {stats['avgImagesPerFigure']:.1f}")
        
    except Exception as e:
        print(f"⚠️ Could not get database statistics: {e}")
    
    print("\n🎯 Next step: Test image retrieval with your API endpoints")
    print("   curl -s \"https://api.orbgame.us/api/orb/images/stats\" | jq .")

if __name__ == "__main__":
    import os
    main() 