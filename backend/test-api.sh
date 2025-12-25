#!/bin/bash

# BeyondChats API Testing Script
# Make sure the server is running before executing this script

BASE_URL="http://localhost:3000"

echo "=== BeyondChats API Testing Script ==="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test 1: Check server health
echo -e "${BLUE}Test 1: Checking if server is running...${NC}"
curl -s "$BASE_URL/" | jq .
echo ""
echo ""

# Test 2: Create first article
echo -e "${BLUE}Test 2: Creating first article...${NC}"
RESPONSE1=$(curl -s -X POST "$BASE_URL/api/articles" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Introduction to BeyondChats",
    "content": "BeyondChats is an innovative platform for managing and generating articles.",
    "source_url": "https://beyondchats.com/intro",
    "source_type": "web",
    "is_generated": false,
    "references": ["AI", "Chat", "Articles"]
  }')
echo "$RESPONSE1" | jq .
ARTICLE_ID_1=$(echo "$RESPONSE1" | jq -r '.id')
echo -e "${GREEN}Created article with ID: $ARTICLE_ID_1${NC}"
echo ""
echo ""

# Test 3: Create second article
echo -e "${BLUE}Test 3: Creating second article...${NC}"
RESPONSE2=$(curl -s -X POST "$BASE_URL/api/articles" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started with APIs",
    "content": "APIs are essential for modern web development. This guide covers the basics.",
    "source_url": "https://example.com/api-guide",
    "source_type": "web"
  }')
echo "$RESPONSE2" | jq .
ARTICLE_ID_2=$(echo "$RESPONSE2" | jq -r '.id')
echo -e "${GREEN}Created article with ID: $ARTICLE_ID_2${NC}"
echo ""
echo ""

# Test 4: Get all articles
echo -e "${BLUE}Test 4: Getting all articles...${NC}"
curl -s "$BASE_URL/api/articles" | jq .
echo ""
echo ""

# Test 5: Get first article by ID
echo -e "${BLUE}Test 5: Getting article by ID ($ARTICLE_ID_1)...${NC}"
curl -s "$BASE_URL/api/articles/$ARTICLE_ID_1" | jq .
echo ""
echo ""

# Test 6: Get second article by ID
echo -e "${BLUE}Test 6: Getting article by ID ($ARTICLE_ID_2)...${NC}"
curl -s "$BASE_URL/api/articles/$ARTICLE_ID_2" | jq .
echo ""
echo ""

echo -e "${GREEN}=== All tests completed! ===${NC}"

