#!/usr/bin/env python3
"""
Phase 1: Discovery & Preparation
Extract figures and prepare structured search terms
"""

import json
import sys
from pathlib import Path

def load_historical_figures():
    """Load historical figures from JSON file"""
    try:
        with open('historical-figures-achievements.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ Error: historical-figures-achievements.json not found")
        print("Please run this script from the orb-game root directory")
        sys.exit(1)

def generate_search_queries(figure_name, category, achievement):
    """Generate search queries for each image type"""
    # Extract key words from achievement for better search terms
    achievement_words = achievement.lower().split()
    key_words = [word for word in achievement_words if len(word) > 3][:3]  # Take first 3 key words
    
    return {
        "portrait": [
            f'"{figure_name} portrait"',
            f'"{figure_name} bust"',
            f'"{figure_name} statue"',
            f'"{figure_name} painting"',
            f'"{figure_name} image"'
        ],
        "achievement": [
            f'"{figure_name} {key_words[0]}"' if key_words else f'"{figure_name} achievement"',
            f'"{figure_name} {key_words[1]}"' if len(key_words) > 1 else f'"{figure_name} discovery"',
            f'"{figure_name} {key_words[2]}"' if len(key_words) > 2 else f'"{figure_name} contribution"',
            f'"{figure_name} {achievement.split()[0]}"',  # First word of achievement
            f'"{figure_name} work"'
        ],
        "invention": [
            f'"{figure_name} invention"',
            f'"{figure_name} device"',
            f'"{figure_name} machine"',
            f'"{figure_name} tool"',
            f'"{figure_name} creation"'
        ],
        "artifact": [
            f'"{figure_name} artifact"',
            f'"{figure_name} object"',
            f'"{figure_name} relic"',
            f'"{figure_name} instrument"',
            f'"{figure_name} tool"'
        ]
    }

def main():
    """Main execution function"""
    print("🔍 Phase 1: Discovery & Preparation")
    print("=" * 40)
    
    # Load historical figures
    print("📖 Loading historical figures...")
    data = load_historical_figures()
    
    # Extract search targets
    search_targets = []
    total_figures = 0
    
    for category, epochs in data.items():
        if category == "metadata":
            continue
            
        for epoch, figures in epochs.items():
            for figure in figures:
                total_figures += 1
                figure_name = figure["name"]
                achievement = figure["achievement"]
                
                # Generate search queries for each image type
                queries = generate_search_queries(figure_name, category, achievement)
                
                search_target = {
                    "name": figure_name,
                    "category": category,
                    "epoch": epoch,
                    "achievement": achievement,
                    "queries": queries,
                    "priority": "high" if figure_name in ["Archimedes", "Albert Einstein", "Leonardo da Vinci"] else "medium"
                }
                
                search_targets.append(search_target)
    
    # Save search targets
    output_file = "search_targets.json"
    with open(output_file, "w") as f:
        json.dump(search_targets, f, indent=2)
    
    # Generate summary
    print(f"✅ Extracted {total_figures} figures")
    print(f"📁 Saved search targets to: {output_file}")
    
    # Show sample queries
    print("\n📋 Sample search queries:")
    sample = search_targets[0]  # First figure
    print(f"Figure: {sample['name']}")
    print(f"Category: {sample['category']}")
    print(f"Epoch: {sample['epoch']}")
    print("Queries:")
    for img_type, queries in sample['queries'].items():
        print(f"  {img_type}: {queries[0]}")  # Show first query for each type
    
    # Generate coverage summary
    categories = set(target['category'] for target in search_targets)
    epochs = set(target['epoch'] for target in search_targets)
    
    print(f"\n📊 Coverage Summary:")
    print(f"  Total Figures: {total_figures}")
    print(f"  Categories: {len(categories)} ({', '.join(sorted(categories))})")
    print(f"  Epochs: {len(epochs)} ({', '.join(sorted(epochs))})")
    print(f"  Queries per Figure: 20 (5 types × 4 queries each)")
    print(f"  Total Queries: {total_figures * 20}")
    
    print("\n🎯 Next step: Run phase2-integration.py to start image retrieval")

if __name__ == "__main__":
    main() 