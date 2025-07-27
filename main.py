from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import uvicorn

# Simple FastAPI app
app = FastAPI(title="Techari Platform", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Find the correct directory with HTML files
project_dir = "."
if os.path.exists("Techari") and os.path.isdir("Techari"):
    # HTML files are in Techari subdirectory
    project_dir = "Techari"
    print(" Found Techari subdirectory - using that as project root")

# Mount the project directory as static files
app.mount("/", StaticFiles(directory=project_dir, html=True), name="static_root")

# Simple models
class ContactForm(BaseModel):
    name: str
    email: str
    message: str
    subject: Optional[str] = None

class Stats(BaseModel):
    mentors: int = 200
    mentees: int = 500
    sessions: int = 1000
    countries: int = 15

# API endpoints
@app.get("/api/health")
def health_check():
    return {"status": "OK", "message": "Techari API is running"}

@app.get("/api/stats")
def get_stats():
    return Stats().dict()

@app.post("/api/contact")
def contact_form(contact: ContactForm):
    print(f"Contact form: {contact.name} ({contact.email}) - {contact.message}")
    return {"success": True, "message": "Thank you for your message!"}

# Serve HTML pages
@app.get("/", response_class=HTMLResponse)
def home():
    about_path = os.path.join(project_dir, "about.html")
    if os.path.exists(about_path):
        return FileResponse(about_path)
    else:
        return HTMLResponse("<h1>Welcome to Techari!</h1><p>Please add your about.html file.</p>")

@app.get("/about", response_class=HTMLResponse)
def about():
    about_path = os.path.join(project_dir, "about.html")
    if os.path.exists(about_path):
        return FileResponse(about_path)
    else:
        raise HTTPException(status_code=404, detail="About page not found")

@app.get("/index", response_class=HTMLResponse)
def index():
    index_path = os.path.join(project_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    else:
        raise HTTPException(status_code=404, detail="Index page not found")

# Serve any HTML file dynamically
@app.get("/{page_name}", response_class=HTMLResponse)
def serve_page(page_name: str):
    # Remove .html if included in URL
    if page_name.endswith('.html'):
        page_name = page_name[:-5]
    
    file_path = os.path.join(project_dir, f"{page_name}.html")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    else:
        raise HTTPException(status_code=404, detail=f"Page '{page_name}' not found")

# 404 handler
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return HTMLResponse("""
    <html>
        <head>
            <title>404 - Page Not Found</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 50px; }
                h1 { color: #8B5CF6; }
                a { color: #8B5CF6; text-decoration: none; }
            </style>
        </head>
        <body>
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
            <a href="/">← Back to Home</a>
        </body>
    </html>
    """, status_code=404)

if __name__ == "__main__":
    # Show debugging info
    print(f" Current directory: {os.getcwd()}")
    print(f" Project directory: {project_dir}")
    print(f" Available HTML files:")
    
    try:
        html_files = [f for f in os.listdir(project_dir) if f.endswith('.html')]
        if html_files:
            for file in html_files:
                print(f"    {file}")
        else:
            print("    No HTML files found")
        
        print(f" Available directories in {project_dir}:")
        dirs = [d for d in os.listdir(project_dir) if os.path.isdir(os.path.join(project_dir, d)) and not d.startswith('.')]
        for directory in dirs:
            print(f" {directory}/")
    except Exception as e:
        print(f"Error reading directory: {e}")
    
    port = int(os.environ.get("PORT", 8000))
    print(f"\n Starting Techari server on http://localhost:{port}")
    print(f" Your about page: http://localhost:{port}/")
    print(f" API docs: http://localhost:{port}/docs")
    
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
