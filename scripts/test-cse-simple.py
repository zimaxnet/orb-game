#!/usr/bin/env python3
"""
Very simple test for Google CSE
"""

import requests

def test_simple():
    """Test with minimal parameters"""
    
    # Get credentials
    import subprocess
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
    
    api_key = api_key_result.stdout.strip()
    cx = cx_result.stdout.strip()
    
    print(f"Testing with API Key: {api_key[:20]}...")
    print(f"Testing with CX: {cx}")
    
    # Test with minimal parameters
    endpoint = 'https://www.googleapis.com/customsearch/v1'
    params = {
        'key': api_key,
        'cx': cx,
        'q': 'test'
    }
    
    try:
        response = requests.get(endpoint, params=params, timeout=10)
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ SUCCESS! API is working!")
            data = response.json()
            if 'items' in data:
                print(f"Found {len(data['items'])} results")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Simple Google CSE Test")
    print("=" * 30)
    test_simple() 