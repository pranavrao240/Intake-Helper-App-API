#!/bin/bash

# Script to remove MongoDB credentials from Git history
# WARNING: This will rewrite Git history - use with caution!

echo "WARNING: This will rewrite your Git history to remove credentials."
echo "Make sure you have a backup of your repository."
read -p "Continue? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Remove MongoDB credentials from index.js
    git filter-branch --force --index-filter \
        'git index-filter --tree-filter \
        "sed -i \"s/mongodb+srv:\/\/pranavrao210:HCBunmPYZZ2tkbJQ@nutrition.obx6bxv.mongodb.net\/IntakeHelperDB/mongodb+srv:\/\/username:password@cluster.mongodb.net\/dbname/g\" index.js"' \
        --prune-empty --tag-name-filter cat -- --all

    echo "Credentials removed from Git history."
    echo "Now force push to update remote repository:"
    echo "git push origin --force --all"
    echo "git push origin --force --tags"
else
    echo "Operation cancelled."
fi
