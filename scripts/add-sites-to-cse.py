#!/usr/bin/env python3
"""
Script to help add sites to Google Custom Search Engine
"""

import re
import sys

def extract_sites_from_file(filename):
    """Extract site domains from the sites list file"""
    sites = []
    
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract domains using regex
        # Look for lines that are just domain names (no http, no comments, no empty lines)
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            # Skip empty lines, comments, and section headers
            if (line and 
                not line.startswith('#') and 
                not line.startswith('##') and
                not line.startswith('http') and
                '.' in line and
                not line.startswith('-')):
                sites.append(line)
        
        return sites
    except FileNotFoundError:
        print(f"❌ File {filename} not found")
        return []
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return []

def categorize_sites(sites):
    """Categorize sites by type for better organization"""
    categories = {
        'Museums & Cultural': [],
        'Educational & Research': [],
        'Art & Portraits': [],
        'Science & Technology': [],
        'Historical & Biographical': [],
        'Achievement & Awards': [],
        'Invention & Patents': [],
        'Government & Official': [],
        'International': [],
        'News & Media': [],
        'Cultural & Entertainment': [],
        'Sports & Achievement': [],
        'Academic & Research': [],
        'Library & Archive': [],
        'Historical & Cultural': [],
        'Creative Commons & Open Source': [],
        'Reference & Documentation': [],
        'Search & Discovery': [],
        'Data & Analytics': [],
        'Specialized Historical Figure': []
    }
    
    # Simple categorization based on domain patterns
    for site in sites:
        if any(keyword in site.lower() for keyword in ['museum', 'gallery', 'art', 'louvre', 'tate', 'moma', 'getty']):
            categories['Museums & Cultural'].append(site)
        elif any(keyword in site.lower() for keyword in ['edu', 'university', 'college', 'academy', 'institute']):
            categories['Educational & Research'].append(site)
        elif any(keyword in site.lower() for keyword in ['art', 'portrait', 'painting', 'sculpture', 'creative']):
            categories['Art & Portraits'].append(site)
        elif any(keyword in site.lower() for keyword in ['science', 'nature', 'research', 'arxiv', 'ieee', 'acm']):
            categories['Science & Technology'].append(site)
        elif any(keyword in site.lower() for keyword in ['history', 'biography', 'encyclopedia', 'ancestry']):
            categories['Historical & Biographical'].append(site)
        elif any(keyword in site.lower() for keyword in ['nobel', 'pulitzer', 'oscar', 'grammy', 'award']):
            categories['Achievement & Awards'].append(site)
        elif any(keyword in site.lower() for keyword in ['patent', 'uspto', 'epo', 'wipo']):
            categories['Invention & Patents'].append(site)
        elif any(keyword in site.lower() for keyword in ['gov', 'whitehouse', 'congress', 'senate', 'house']):
            categories['Government & Official'].append(site)
        elif any(keyword in site.lower() for keyword in ['un.org', 'unesco', 'who.int', 'imf.org']):
            categories['International'].append(site)
        elif any(keyword in site.lower() for keyword in ['news', 'reuters', 'ap.org', 'bbc', 'cnn']):
            categories['News & Media'].append(site)
        elif any(keyword in site.lower() for keyword in ['imdb', 'entertainment', 'culture', 'film', 'music']):
            categories['Cultural & Entertainment'].append(site)
        elif any(keyword in site.lower() for keyword in ['sport', 'olympic', 'nba', 'nfl', 'mlb']):
            categories['Sports & Achievement'].append(site)
        elif any(keyword in site.lower() for keyword in ['library', 'archive', 'loc.gov', 'nara.gov']):
            categories['Library & Archive'].append(site)
        elif any(keyword in site.lower() for keyword in ['creativecommons', 'opensource', 'gnu', 'apache']):
            categories['Creative Commons & Open Source'].append(site)
        elif any(keyword in site.lower() for keyword in ['docs', 'developer', 'documentation']):
            categories['Reference & Documentation'].append(site)
        elif any(keyword in site.lower() for keyword in ['google', 'bing', 'yahoo', 'search']):
            categories['Search & Discovery'].append(site)
        elif any(keyword in site.lower() for keyword in ['data', 'kaggle', 'analytics']):
            categories['Data & Analytics'].append(site)
        else:
            # Default to Specialized Historical Figure for unmatched sites
            categories['Specialized Historical Figure'].append(site)
    
    return categories

def print_sites_for_cse(sites, categories):
    """Print sites in a format suitable for Google CSE"""
    print("🔧 Google Custom Search Engine Sites Setup")
    print("=" * 50)
    print("")
    print("📋 Instructions:")
    print("1. Go to https://cse.google.com/")
    print("2. Select your Custom Search Engine")
    print("3. Go to 'Sites to search' section")
    print("4. Add the sites below (one per line)")
    print("")
    print("🎯 Recommended Approach:")
    print("- Start with the top 10-20 sites from each category")
    print("- Focus on Museums, Educational, and Art sites first")
    print("- Add more sites gradually to test performance")
    print("")
    
    print("📁 SITES BY CATEGORY:")
    print("=" * 30)
    
    for category, category_sites in categories.items():
        if category_sites:
            print(f"\n🏷️  {category} ({len(category_sites)} sites):")
            print("-" * 40)
            for site in category_sites[:10]:  # Show first 10 from each category
                print(f"  • {site}")
            if len(category_sites) > 10:
                print(f"  ... and {len(category_sites) - 10} more")
    
    print(f"\n📊 SUMMARY:")
    print(f"Total sites: {len(sites)}")
    print(f"Categories: {len([c for c in categories.values() if c])}")
    
    print(f"\n🚀 QUICK START (Top 20 sites):")
    print("=" * 30)
    quick_start = []
    for category, sites_list in categories.items():
        if sites_list and len(quick_start) < 20:
            quick_start.extend(sites_list[:2])  # Take 2 from each category
    
    for i, site in enumerate(quick_start[:20], 1):
        print(f"{i:2d}. {site}")

def main():
    """Main function"""
    filename = "scripts/google-cse-sites-list.txt"
    
    print("🔍 Extracting sites from file...")
    sites = extract_sites_from_file(filename)
    
    if not sites:
        print("❌ No sites found. Please check the file.")
        return
    
    print(f"✅ Found {len(sites)} sites")
    
    print("📂 Categorizing sites...")
    categories = categorize_sites(sites)
    
    print_sites_for_cse(sites, categories)
    
    print("\n💡 TIPS:")
    print("- Start with 20-30 sites to test performance")
    print("- Focus on high-quality image sources first")
    print("- Monitor search results quality")
    print("- Add more sites gradually")
    print("- Consider removing low-performing sites")

if __name__ == "__main__":
    main() 