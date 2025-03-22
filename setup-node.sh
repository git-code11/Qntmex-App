
#!/bin/bash
# Improved setup script for Node.js in Replit

echo "Setting up Node.js environment..."

# Try to use directly installed Node.js
if command -v node &> /dev/null; then
  echo "Node.js found in system path!"
  node -v
  npm -v
else
  echo "Node not found in system path, trying alternative methods..."
  
  # Try to find Node.js in Nix store
  NODE_PATH=$(find /nix/store -name node -type f -executable 2>/dev/null | head -1)
  if [ -n "$NODE_PATH" ]; then
    NODE_DIR=$(dirname "$NODE_PATH")
    echo "Found Node.js at $NODE_DIR"
    export PATH="$NODE_DIR:$PATH"
    node -v
  else
    echo "Could not find Node.js executable in Nix store"
  fi
fi

# Check again if node is available now
if command -v node &> /dev/null; then
  echo "Node.js is now available. Version: $(node -v)"
  npm -v
  
  # Install dependencies
  echo "Installing dependencies..."
  npm install || echo "Failed to install dependencies"
  
  echo "Setup complete. Starting application..."
else
  echo "ERROR: Failed to find Node.js. Please check your replit.nix configuration."
  exit 1
fi
