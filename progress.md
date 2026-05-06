# Project Documentation: Jarin Portfolio

## Overview
This project is a personal portfolio website built with **Flask** and hosted on **Google Cloud**. It serves as a central hub for various web projects, using a dynamic routing system to serve static sites nested within the `static` directory.

## File Structure & Descriptions

### Backend / Core
- **[app.py](file:///C:/Users/jarin/OneDrive/Desktop/VibeDev/Jarin.dev/app.py)**: The main Flask application entry point. It handles routing for the homepage, profile page, and a "magic" route for serving nested static projects from `static/projects/`.
- **[requirements.txt](file:///C:/Users/jarin/OneDrive/Desktop/VibeDev/Jarin.dev/requirements.txt)**: Lists Python dependencies (e.g., `Flask`).
- **[data/](file:///C:/Users/jarin/OneDrive/Desktop/VibeDev/Jarin.dev/data/)**:
    - `projects.json`: Contains metadata (titles, descriptions, links) for the projects displayed on the homepage.

### Infrastructure & Deployment
- **[GitHub Repository](https://github.com/Canar8ue/Jarin.dev.git)**: Source code hosting and version control.
- **[Dockerfile](file:///C:/Users/jarin/OneDrive/Desktop/VibeDev/Jarin.dev/Dockerfile)**: Instructions for building the Python/Flask environment in a container.
- **[docker-compose.yml](file:///C:/Users/jarin/OneDrive/Desktop/VibeDev/Jarin.dev/docker-compose.yml)**: Manages the multi-container setup, including the `web` (Flask) service and the `caddy` (Web Server) service.
- **[Caddyfile](file:///C:/Users/jarin/OneDrive/Desktop/VibeDev/Jarin.dev/Caddyfile)**: Configuration for the Caddy web server, handling reverse proxying and SSL.

### Frontend
- **[templates/](file:///C:/Users/jarin/OneDrive/Desktop/VibeDev/Jarin.dev/templates/)**:
    - `index.html`: The main portfolio landing page.
    - `profile.html`: A personal profile/about page.
- **[static/](file:///C:/Users/jarin/OneDrive/Desktop/VibeDev/Jarin.dev/static/)**:
    - `projects/`: Contains the individual sub-projects (e.g., `New-bread-site`, `christ-chronology`, `medline-v3`).
    - Assets (images, CSS, JS) used by the main portfolio UI, including the **M&C Mobile Repair** logo.

---

## Server Access Rules

### How to Access via SSH
To access the Google Cloud server from your terminal, use the following command:

```powershell
ssh -i C:\Users\jarin\.ssh\google_cloud_jarin jarincanar@34.82.73.11
```

> [!TIP]
> This SSH key is now permanently added to your Google Cloud Project metadata, so it should remain stable without needing manual resets.

### Best Way to Update the Server
1. **Modify Locally**: Edit the files in this directory.
2. **Deploy via SCP**: Upload the changes to the server:
   ```powershell
   # Example: Uploading the whole directory
   scp -i C:\Users\jarin\.ssh\google_cloud_jarin -r * jarincanar@34.82.73.11:~/jarin-portfolio/
   ```
3. **Rebuild Container**: If you changed the backend (`app.py`) or dependencies, restart the Docker service on the server:
   ```powershell
   ssh -i C:\Users\jarin\.ssh\google_cloud_jarin jarincanar@34.82.73.11 "cd ~/jarin-portfolio && sudo docker-compose up -d --build"
   ```
