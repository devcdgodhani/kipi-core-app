#!/bin/bash

# Create Parent
PARENT_RES=$(curl -s -X POST http://localhost:3000/api/v1/admin/category \
  -H "Content-Type: application/json" \
  -d '{"name":"TestParentUnique","status":"ACTIVE"}')
PARENT=$(echo $PARENT_RES | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "Parent Response: $PARENT_RES"
echo "Parent ID: $PARENT"

# Create Child
CHILD_RES=$(curl -s -X POST http://localhost:3000/api/v1/admin/category \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"TestChildUnique\",\"parentId\":\"$PARENT\",\"status\":\"ACTIVE\"}")
CHILD=$(echo $CHILD_RES | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "Child Response: $CHILD_RES"
echo "Child ID: $CHILD"

# Delete Parent
echo "Attempting to delete Parent..."
curl -X DELETE http://localhost:3000/api/v1/admin/category/deleteByFilter \
  -H "Content-Type: application/json" \
  -d "{\"_id\":\"$PARENT\"}"
echo ""
