#!/usr/bin/env python3
"""
Simple test script for Google Custom Search API setup
"""

import requests
import json
import os
import sys

def get_credentials():
    """Get Google CSE credentials from environment or Azure Key Vault"""
    api_key = os.getenv('GOOGLE_CSE_API_KEY')
    cx = os.getenv('GOOGLE_CSE_CX')
    
    if not api_key or not cx:
        try:
            import subprocess
            # Try to get from Azure Key Vault
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
            
            if cx_result.returncode == 0:
                cx = cx_result.stdout.strip()
                
        except Exception as e:
            print(f"Could not retrieve credentials: {e}")
    
    return api_key, cx

def test_google_cse():
    """Test Google Custom Search API"""
    print("🧪 Testing Google Custom Search API Setup")
    print("=" * 50)
    
    # Get credentials
    api_key, cx = get_credentials()
    
    if not api_key:
        print("❌ No Google CSE API key found")
        print("Run: ./scripts/setup-google-custom-search.sh")
        return False
    
    if not cx:
        print("❌ No Google CSE Search Engine ID (CX) found")
        print("Run: ./scripts/setup-google-custom-search.sh")
        return False
    
    print(f"✅ API Key: {'*' * (len(api_key) - 8) + api_key[-8:]}")
    print(f"✅ Search Engine ID: {cx[:20]}...")
    
    # Test API call
    endpoint = 'https://www.googleapis.com/customsearch/v1'
    test_query = "Albert Einstein portrait"
    
    params = {
        'key': api_key,
        'cx': cx,
        'q': test_query,
        'searchType': 'image',
        'num': 1,
        'safe': 'high'
    }
    
    print(f"\n🔍 Testing with query: '{test_query}'")
    
    try:
        response = requests.get(endpoint, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            
            if items:
                image_url = items[0].get('link', 'No URL found')
                print(f"✅ Test successful!")
                print(f"📸 Found image: {image_url}")
                return True
            else:
                print("❌ No images found in response")
                print("Response:", json.dumps(data, indent=2))
                return False
                
        else:
            print(f"❌ API request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False

def main():
    """Main function"""
    success = test_google_cse()
    
    if success:
        print("\n🎉 Google Custom Search API is configured and working!")
        print("\nNext steps:")
        print("1. Run full image search: python3 scripts/google-custom-search.py")
        print("2. Check usage limits in Google Cloud Console")
        print("3. Monitor costs and implement caching if needed")
    else:
        print("\n❌ Setup incomplete. Please check the errors above.")
        print("\nTroubleshooting:")
        print("1. Verify your API key is correct")
        print("2. Verify your Search Engine ID (CX) is correct")
        print("3. Make sure Custom Search API is enabled")
        print("4. Check that 'Search the entire web' is enabled in CSE settings")
        print("5. Run: ./scripts/setup-google-custom-search.sh")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main()) 