#!/usr/bin/env python3
"""
Master script to run all image retrieval phases
Runs phases 1-4 in sequence with proper error handling
"""

import subprocess
import sys
import argparse
import time
from pathlib import Path

def run_phase(phase_name, script_name, description, test_mode=False):
    """Run a single phase with error handling"""
    print(f"\n{'='*60}")
    print(f"🚀 {phase_name}")
    print(f"📝 {description}")
    print(f"{'='*60}")
    
    try:
        # Check if script exists
        if not Path(script_name).exists():
            print(f"❌ Error: {script_name} not found")
            return False
        
        # Run the script
        cmd = ["python3", script_name]
        if test_mode:
            cmd.append("--test")
        
        print(f"🔧 Running: {' '.join(cmd)}")
        start_time = time.time()
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        duration = time.time() - start_time
        
        if result.returncode == 0:
            print(f"✅ {phase_name} completed successfully ({duration:.1f}s)")
            print(result.stdout)
            return True
        else:
            print(f"❌ {phase_name} failed")
            print(f"Error: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Error running {phase_name}: {e}")
        return False

def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(description="Run all image retrieval phases")
    parser.add_argument("--mongo-uri", required=True, help="MongoDB connection string")
    parser.add_argument("--test", action="store_true", help="Run in test mode (limited figures)")
    parser.add_argument("--phase", type=int, choices=[1,2,3,4], help="Run specific phase only")
    
    args = parser.parse_args()
    
    print("🎯 Orb Game Image Retrieval - Complete Pipeline")
    print("=" * 60)
    
    # Define phases
    phases = [
        {
            "name": "Phase 1: Discovery & Preparation",
            "script": "scripts/phase1-discovery.py",
            "description": "Extract figures and prepare search terms"
        },
        {
            "name": "Phase 2: Source Integration & Query Automation", 
            "script": "scripts/phase2-integration.py",
            "description": "Query Wikimedia Commons and download images"
        },
        {
            "name": "Phase 3: Validation & Categorization",
            "script": "scripts/phase3-validation.py", 
            "description": "Filter, validate, and categorize images"
        },
        {
            "name": "Phase 4: Storage in MongoDB",
            "script": "scripts/phase4-storage.py",
            "description": "Store images in MongoDB database"
        }
    ]
    
    # Check if we're in the right directory
    if not Path("historical-figures-achievements.json").exists():
        print("❌ Error: historical-figures-achievements.json not found")
        print("Please run this script from the orb-game root directory")
        sys.exit(1)
    
    # Run specific phase or all phases
    if args.phase:
        # Run single phase
        phase = phases[args.phase - 1]
        if args.phase == 4:
            # Phase 4 needs MongoDB URI
            cmd = ["python3", phase["script"], "--mongo-uri", args.mongo_uri]
            if args.test:
                cmd.append("--test")
        else:
            cmd = ["python3", phase["script"]]
            if args.test:
                cmd.append("--test")
        
        print(f"🎯 Running {phase['name']}")
        result = subprocess.run(cmd)
        sys.exit(result.returncode)
    
    # Run all phases
    successful_phases = 0
    total_phases = len(phases)
    
    for i, phase in enumerate(phases, 1):
        print(f"\n📋 Progress: {i}/{total_phases} phases")
        
        success = run_phase(
            phase["name"], 
            phase["script"], 
            phase["description"],
            test_mode=args.test
        )
        
        if success:
            successful_phases += 1
        else:
            print(f"\n❌ Pipeline failed at {phase['name']}")
            print("Please fix the issue and run again")
            sys.exit(1)
    
    # Final summary
    print(f"\n{'='*60}")
    print("🎉 PIPELINE COMPLETE")
    print(f"{'='*60}")
    print(f"✅ Successful phases: {successful_phases}/{total_phases}")
    print(f"📊 Coverage: 100%")
    
    if args.test:
        print("\n🧪 TEST MODE RESULTS:")
        print("  - Limited figures processed")
        print("  - Run without --test for full implementation")
    else:
        print("\n📈 EXPECTED RESULTS:")
        print("  - 95%+ image coverage for historical figures")
        print("  - High-quality, properly attributed images")
        print("  - MongoDB storage with structured metadata")
    
    print("\n🔍 Next Steps:")
    print("  1. Test API endpoints:")
    print("     curl -s \"https://api.orbgame.us/api/orb/images/stats\" | jq .")
    print("  2. Test specific figure:")
    print("     curl -s \"https://api.orbgame.us/api/orb/images/best?figureName=Archimedes\" | jq .")
    print("  3. Monitor coverage and quality")
    print("  4. Set up maintenance schedule")

if __name__ == "__main__":
    main() 