#!/bin/bash

# Setup script for Amphibious local development hostname
# This adds 'amphibious.local' to your /etc/hosts file

echo "🐸 Setting up Amphibious local hostname..."
echo

# Check if amphibious.local already exists in /etc/hosts
if grep -q "amphibious.local" /etc/hosts; then
    echo "✅ amphibious.local already exists in /etc/hosts"
else
    echo "📝 Adding amphibious.local to /etc/hosts..."
    echo "127.0.0.1       amphibious.local" | sudo tee -a /etc/hosts > /dev/null

    if [ $? -eq 0 ]; then
        echo "✅ Successfully added amphibious.local to /etc/hosts"
    else
        echo "❌ Failed to add hostname. You may need to run this script with sudo privileges."
        exit 1
    fi
fi

echo
echo "🚀 Setup complete! You can now access Amphibious at:"
echo "   http://amphibious.local:2960"
echo
echo "💡 To start the development server, run:"
echo "   bun run dev"
echo
echo "📝 To remove the hostname later, edit /etc/hosts and remove the line:"
echo "   127.0.0.1       amphibious.local"