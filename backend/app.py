from app import create_app

# Create Flask application instance using factory
app = create_app()

if __name__ == "__main__":
    port = app.config.get("PORT", 5000)
    host = app.config.get("HOST", "0.0.0.0")
    debug = app.config.get("DEBUG", True)
    print(f"[*] Starting SmartTemp Backend on http://127.0.0.1:{port}")
    app.run(host=host, port=port, debug=debug)