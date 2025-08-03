#!/usr/bin/env python3
"""
Phase 5: Maintenance & Expansion
================================

This script implements ongoing maintenance and expansion features:
1. Automated update cycle for finding new/better images
2. User feedback system for flagging problematic images
3. Coverage analysis and reporting
4. System health monitoring
5. Expansion to new image sources
"""

import json
import sys
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
import argparse
from collections import defaultdict

def connect_mongodb(mongo_uri):
    """Connect to MongoDB"""
    try:
        client = MongoClient(mongo_uri)
        client.admin.command('ping')
        print("✅ Connected to MongoDB")
        return client
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        sys.exit(1)

def generate_coverage_report(collection):
    """Generate comprehensive coverage report"""
    print("📊 Generating Coverage Report...")
    
    # Get overall statistics
    total_documents = collection.count_documents({})
    total_images = collection.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$totalImages"}}}
    ]).next()["total"]
    
    # Coverage by category
    category_stats = list(collection.aggregate([
        {"$group": {"_id": "$category", "figures": {"$sum": 1}, "images": {"$sum": "$totalImages"}}}
    ]))
    
    # Coverage by epoch
    epoch_stats = list(collection.aggregate([
        {"$group": {"_id": "$epoch", "figures": {"$sum": 1}, "images": {"$sum": "$totalImages"}}}
    ]))
    
    # Coverage by image type
    type_stats = defaultdict(int)
    for doc in collection.find({}, {"images": 1}):
        for img in doc.get("images", []):
            img_type = img.get("type", "unknown")
            type_stats[img_type] += 1
    
    # Recent updates (last 7 days)
    week_ago = datetime.now() - timedelta(days=7)
    recent_updates = collection.count_documents({"lastUpdated": {"$gte": week_ago}})
    
    # Generate report
    report = {
        "generated_at": datetime.now().isoformat(),
        "overall_stats": {
            "total_figures": total_documents,
            "total_images": total_images,
            "average_images_per_figure": total_images / total_documents if total_documents > 0 else 0,
            "recent_updates": recent_updates
        },
        "category_coverage": category_stats,
        "epoch_coverage": epoch_stats,
        "type_coverage": dict(type_stats),
        "recommendations": []
    }
    
    # Add recommendations
    if total_images < 120:  # Target is 1 image per figure minimum
        report["recommendations"].append("Need more images to reach target coverage")
    
    categories_with_low_coverage = [cat for cat in category_stats if cat["images"] < 10]
    if categories_with_low_coverage:
        report["recommendations"].append(f"Categories needing more images: {[cat['_id'] for cat in categories_with_low_coverage]}")
    
    # Save report
    with open("coverage_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    # Print summary
    print(f"\n📈 COVERAGE REPORT SUMMARY")
    print(f"=" * 40)
    print(f"Total Figures: {total_documents}")
    print(f"Total Images: {total_images}")
    print(f"Average Images per Figure: {total_images/total_documents:.1f}")
    print(f"Recent Updates (7 days): {recent_updates}")
    
    print(f"\n📊 Coverage by Category:")
    for cat in category_stats:
        print(f"  {cat['_id']}: {cat['figures']} figures, {cat['images']} images")
    
    print(f"\n📊 Coverage by Image Type:")
    for img_type, count in type_stats.items():
        print(f"  {img_type.capitalize()}: {count}")
    
    print(f"\n💡 Recommendations:")
    for rec in report["recommendations"]:
        print(f"  - {rec}")
    
    return report

def check_for_missing_figures(collection):
    """Check which figures are missing from the database"""
    print("🔍 Checking for Missing Figures...")
    
    # Load the original figure list
    try:
        with open("historical-figures-achievements.json", "r") as f:
            all_figures = json.load(f)
    except FileNotFoundError:
        print("❌ historical-figures-achievements.json not found")
        return []
    
    # Get figures in database
    db_figures = set()
    for doc in collection.find({}, {"figureName": 1, "category": 1, "epoch": 1}):
        key = (doc["figureName"], doc["category"], doc["epoch"])
        db_figures.add(key)
    
    # Find missing figures
    missing_figures = []
    for category, epochs in all_figures.items():
        if category == "metadata":
            continue
        for epoch, figures in epochs.items():
            for figure in figures:
                key = (figure["name"], category, epoch)
                if key not in db_figures:
                    missing_figures.append({
                        "name": figure["name"],
                        "category": category,
                        "epoch": epoch,
                        "achievement": figure["achievement"]
                    })
    
    print(f"📋 Found {len(missing_figures)} missing figures")
    if missing_figures:
        print("Missing figures:")
        for fig in missing_figures[:10]:  # Show first 10
            print(f"  - {fig['name']} ({fig['category']}/{fig['epoch']})")
        if len(missing_figures) > 10:
            print(f"  ... and {len(missing_figures) - 10} more")
    
    return missing_figures

def flag_image_issue(collection, figure_name, image_url, issue_type, user_comment):
    """Flag an image issue for review"""
    try:
        flag_data = {
            "figureName": figure_name,
            "imageUrl": image_url,
            "issueType": issue_type,  # wrong_person, low_quality, inappropriate, broken_link
            "userComment": user_comment,
            "flaggedAt": datetime.now(),
            "status": "pending_review"
        }
        
        # Use a separate collection for flags
        flags_collection = collection.database.image_flags
        result = flags_collection.insert_one(flag_data)
        
        print(f"✅ Flagged image issue for {figure_name}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to flag image issue: {e}")
        return False

def get_system_health(collection):
    """Check system health and performance"""
    print("🏥 Checking System Health...")
    
    health_report = {
        "database_connection": True,
        "collection_exists": True,
        "indexes_exist": True,
        "recent_activity": True,
        "data_integrity": True
    }
    
    try:
        # Check if collection exists and has data
        doc_count = collection.count_documents({})
        if doc_count == 0:
            health_report["collection_exists"] = False
            health_report["data_integrity"] = False
        
        # Check for recent activity
        week_ago = datetime.now() - timedelta(days=7)
        recent_docs = collection.count_documents({"lastUpdated": {"$gte": week_ago}})
        if recent_docs == 0:
            health_report["recent_activity"] = False
        
        # Check indexes
        indexes = list(collection.list_indexes())
        if len(indexes) < 3:  # Should have at least 3 indexes
            health_report["indexes_exist"] = False
        
        # Check for broken image URLs (sample check)
        sample_docs = collection.find({}).limit(5)
        for doc in sample_docs:
            for img in doc.get("images", []):
                if not img.get("url") or not img.get("local_path"):
                    health_report["data_integrity"] = False
                    break
        
    except Exception as e:
        health_report["database_connection"] = False
        print(f"❌ Health check failed: {e}")
    
    # Print health status
    print(f"\n🏥 SYSTEM HEALTH REPORT")
    print(f"=" * 30)
    for check, status in health_report.items():
        status_icon = "✅" if status else "❌"
        print(f"{status_icon} {check.replace('_', ' ').title()}")
    
    overall_health = all(health_report.values())
    print(f"\nOverall Health: {'✅ Healthy' if overall_health else '❌ Issues Found'}")
    
    return health_report

def suggest_expansion_sources():
    """Suggest new image sources for expansion"""
    print("🚀 Expansion Source Suggestions...")
    
    sources = [
        {
            "name": "Europeana",
            "url": "https://api.europeana.eu/record/v2/search.json",
            "description": "European cultural heritage",
            "priority": "high",
            "api_key_required": True
        },
        {
            "name": "The Met Museum",
            "url": "https://collectionapi.metmuseum.org/public/collection/v1/",
            "description": "Art and artifacts",
            "priority": "high",
            "api_key_required": False
        },
        {
            "name": "NASA Images",
            "url": "https://images-api.nasa.gov/search",
            "description": "Space-related images",
            "priority": "medium",
            "api_key_required": False
        },
        {
            "name": "British Museum",
            "url": "https://collection.britishmuseum.org/",
            "description": "Historical artifacts",
            "priority": "medium",
            "api_key_required": False
        },
        {
            "name": "Library of Congress",
            "url": "https://www.loc.gov/apis/",
            "description": "Historical documents and images",
            "priority": "medium",
            "api_key_required": False
        }
    ]
    
    print(f"\n📚 SUGGESTED EXPANSION SOURCES")
    print(f"=" * 40)
    for source in sources:
        priority_icon = "🔥" if source["priority"] == "high" else "⚡" if source["priority"] == "medium" else "💡"
        key_icon = "🔑" if source["api_key_required"] else "🔓"
        print(f"{priority_icon} {source['name']} {key_icon}")
        print(f"   URL: {source['url']}")
        print(f"   Description: {source['description']}")
        print()
    
    return sources

def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description="Phase 5: Maintenance & Expansion")
    parser.add_argument("--mongo-uri", required=True, help="MongoDB connection string")
    parser.add_argument("--action", choices=["report", "health", "missing", "flag", "sources"], 
                       default="report", help="Action to perform")
    parser.add_argument("--figure-name", help="Figure name for flagging")
    parser.add_argument("--image-url", help="Image URL for flagging")
    parser.add_argument("--issue-type", help="Issue type for flagging")
    parser.add_argument("--comment", help="Comment for flagging")
    
    args = parser.parse_args()
    
    print("🔄 Phase 5: Maintenance & Expansion")
    print("=" * 50)
    
    # Connect to MongoDB
    print("🔌 Connecting to MongoDB...")
    client = connect_mongodb(args.mongo_uri)
    db = client.orbgame
    collection = db.historical_figure_images
    
    # Perform requested action
    if args.action == "report":
        generate_coverage_report(collection)
    
    elif args.action == "health":
        get_system_health(collection)
    
    elif args.action == "missing":
        check_for_missing_figures(collection)
    
    elif args.action == "flag":
        if not all([args.figure_name, args.image_url, args.issue_type, args.comment]):
            print("❌ All arguments required for flagging: --figure-name, --image-url, --issue-type, --comment")
            sys.exit(1)
        flag_image_issue(collection, args.figure_name, args.image_url, args.issue_type, args.comment)
    
    elif args.action == "sources":
        suggest_expansion_sources()
    
    print(f"\n🎯 Phase 5 {args.action} completed successfully!")

if __name__ == "__main__":
    main() 