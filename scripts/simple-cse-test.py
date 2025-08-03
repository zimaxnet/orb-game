#!/usr/bin/env python3
"""
Simple test for Google Custom Search API
"""

import requests
import json
import os
import sys

def get_credentials():
    """Get Google CSE credentials"""
    try:
        import subprocess
        # Get from Azure Key Vault
        api_key_result = subprocess.run([
            'az', 'keyvault', 'secret', 'show', 
            '--name', 'GOOGLE-CSE-API-KEY', 
            '--vault-name', 'orb-game-kv-eastus2', 
            '--query', 'value', '-o', 'tsv'
        ], capture_output=True, text=True)
        
        cx_result = subprocess.run([
            'az', 'keyvault', 'secret', 'show', 
            '--name', 'GOOGLE-CSE-CX', 
            '--vault-name', 'orb-game-kv-eastus2', 
            '--query', 'value', '-o', 'tsv'
        ], capture_output=True, text=True)
        
        if api_key_result.returncode == 0:
            api_key = api_key_result.stdout.strip()
        else:
            api_key = None
            
        if cx_result.returncode == 0:
            cx = cx_result.stdout.strip()
        else:
            cx = None
            
        return api_key, cx
    except Exception as e:
        print(f"Error getting credentials: {e}")
        return None, None

def test_api():
    """Test the API with different approaches"""
    api_key, cx = get_credentials()
    
    if not api_key or not cx:
        print("❌ Could not retrieve credentials")
        return
    
    print(f"🔍 Testing with API Key: {api_key[:10]}...")
    print(f"🔍 Testing with CX: {cx[:10]}...")
    
    # Test 1: Basic search
    print("\n🧪 Test 1: Basic search")
    test_basic_search(api_key, cx)
    
    # Test 2: Web search
    print("\n🧪 Test 2: Web search")
    test_web_search(api_key, cx)
    
    # Test 3: Image search
    print("\n🧪 Test 3: Image search")
    test_image_search(api_key, cx)

def test_basic_search(api_key, cx):
    """Test basic search functionality"""
    endpoint = 'https://www.googleapis.com/customsearch/v1'
    params = {
        'key': api_key,
        'cx': cx,
        'q': 'test',
        'num': 1
    }
    
    try:
        response = requests.get(endpoint, params=params, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Basic search works!")
        else:
            print(f"Response: {response.text[:200]}...")
    except Exception as e:
        print(f"Error: {e}")

def test_web_search(api_key, cx):
    """Test web search functionality"""
    endpoint = 'https://www.googleapis.com/customsearch/v1'
    params = {
        'key': api_key,
        'cx': cx,
        'q': 'Albert Einstein',
        'num': 1,
        'searchType': 'web'
    }
    
    try:
        response = requests.get(endpoint, params=params, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Web search works!")
        else:
            print(f"Response: {response.text[:200]}...")
    except Exception as e:
        print(f"Error: {e}")

def test_image_search(api_key, cx):
    """Test image search functionality"""
    endpoint = 'https://www.googleapis.com/customsearch/v1'
    params = {
        'key': api_key,
        'cx': cx,
        'q': 'Albert Einstein portrait',
        'searchType': 'image',
        'num': 1
    }
    
    try:
        response = requests.get(endpoint, params=params, timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Image search works!")
            if 'items' in data and data['items']:
                print(f"Found image: {data['items'][0].get('link', 'No link')}")
        else:
            print(f"Response: {response.text[:200]}...")
    except Exception as e:
        print(f"Error: {e}")

def main():
    """Main function"""
    print("🔧 Google Custom Search API Diagnostic Test")
    print("=" * 50)
    
    test_api()
    
    print("\n💡 Troubleshooting Tips:")
    print("1. Check API key restrictions in Google Cloud Console")
    print("2. Ensure billing is enabled (even for free tier)")
    print("3. Verify Custom Search Engine has 'Search entire web' enabled")
    print("4. Check if you've hit API quotas")
    print("5. Try creating a new API key if issues persist")

if __name__ == "__main__":
    main() 