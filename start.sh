#!/bin/bash

# Quiz Application Startup Script
echo "🚀 Starting Quiz Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get local IP address
get_local_ip() {
    # Try different methods to get local IP
    if command_exists ip; then
        ip route get 1.1.1.1 | grep -oP 'src \K\S+' 2>/dev/null
    elif command_exists ifconfig; then
        ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1
    elif command_exists hostname; then
        hostname -I | awk '{print $1}' 2>/dev/null
    else
        echo "localhost"
    fi
}

# Check if Python is installed
if ! command_exists python3 && ! command_exists python; then
    echo -e "${RED}❌ Python is not installed. Please install Python 3.8+ first.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Get local IP address
LOCAL_IP=$(get_local_ip)
if [ -z "$LOCAL_IP" ] || [ "$LOCAL_IP" = "localhost" ]; then
    LOCAL_IP="localhost"
    echo -e "${YELLOW}⚠️  Using localhost as fallback IP${NC}"
else
    echo -e "${GREEN}🌐 Detected local IP: $LOCAL_IP${NC}"
fi

# Create .env file with API configuration
echo -e "${BLUE}📝 Creating .env file...${NC}"
cat > .env << EOF
# Quiz Application Configuration
VITE_API_BASE_URL=http://$LOCAL_IP:8000
VITE_API_HOST=$LOCAL_IP
VITE_API_PORT=8000

# Development Configuration
VITE_DEV_SERVER_PORT=5173
EOF

echo -e "${GREEN}✅ .env file created with API URL: http://$LOCAL_IP:8000${NC}"

# Install frontend dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
fi

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend

# Check if requirements.txt exists
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ requirements.txt not found in backend directory${NC}"
    exit 1
fi

# Install Python dependencies
if command_exists python3; then
    cd backend
    source venv/bin/activate
    python3 -m pip install -r requirements.txt
else
    python -m pip install -r requirements.txt
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Go back to root directory
cd ..

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend server stopped${NC}"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Frontend server stopped${NC}"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo -e "${BLUE}🐍 Starting FastAPI backend server...${NC}"
cd backend
source venv/bin/activate
if command_exists python3; then
    python3 main.py > ../logs/backend.log 2>&1 &
else
    python main.py > ../logs/backend.log 2>&1 &
fi
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Failed to start backend server. Check logs/backend.log for details.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}📡 Backend API available at: http://$LOCAL_IP:8000${NC}"

# Start frontend server
echo -e "${BLUE}⚛️  Starting React frontend server...${NC}"
npm run dev -- --host > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Check if frontend is running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Failed to start frontend server. Check logs/frontend.log for details.${NC}"
    cleanup
    exit 1
fi

echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}"
echo -e "${GREEN}🌐 Frontend available at: http://localhost:5173${NC}"

# Display startup summary
echo -e "\n${GREEN}🎉 Quiz Application is now running!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📱 Frontend:${NC} http://$LOCAL_IP:5173"
echo -e "${GREEN}🔧 Backend API:${NC} http://$LOCAL_IP:8000"
echo -e "${GREEN}👨‍💼 Admin Panel:${NC} http://$LOCAL_IP:5173/admin/logs"
echo -e "${GREEN}📊 API Docs:${NC} http://$LOCAL_IP:8000/docs"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}💡 Admin Credentials: admin / admin123${NC}"
echo -e "${YELLOW}📝 Logs are saved in the 'logs' directory${NC}"
echo -e "${YELLOW}🛑 Press Ctrl+C to stop both servers${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Keep script running and monitor processes
while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend server stopped unexpectedly${NC}"
        cleanup
        exit 1
    fi
    
    # Check if frontend is still running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend server stopped unexpectedly${NC}"
        cleanup
        exit 1
    fi
    
    sleep 5
done
