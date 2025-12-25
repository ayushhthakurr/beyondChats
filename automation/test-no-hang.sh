#!/bin/bash

echo "========================================"
echo "Testing Automation Script - Exit Behavior"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "Test 1: Simple HTTP test (should exit immediately)"
echo "---------------------------------------------------"
node test-exit.js &
PID=$!
sleep 5

if ps -p $PID > /dev/null 2>&1; then
  echo "❌ FAIL: Process still running (HANGING)"
  kill -9 $PID 2>/dev/null
  exit 1
else
  echo "✅ PASS: Process exited cleanly"
fi

echo ""
echo "Test 2: Full automation script"
echo "---------------------------------------------------"
node src/index.js &
PID=$!
sleep 25

if ps -p $PID > /dev/null 2>&1; then
  echo "❌ FAIL: Process still running (HANGING)"
  kill -9 $PID 2>/dev/null
  exit 1
else
  echo "✅ PASS: Process exited cleanly"
fi

echo ""
echo "========================================"
echo "✅ ALL TESTS PASSED - NO HANGING"
echo "========================================"

