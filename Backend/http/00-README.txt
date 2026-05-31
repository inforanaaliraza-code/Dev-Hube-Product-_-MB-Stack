Dev Hube — REST Client API tests

1. Install extension: REST Client (Huachao Mao) in VS Code / Cursor
2. Open folder: Backend/http/
3. Bottom-right status bar → select environment "dev"
4. Edit http-client.env.json if ports or admin password differ
5. Upload tests: add photo.jpg and document.pdf to Backend/http/samples/
6. Click "Send Request" above any ### block
7. All APIs in one file: all-apis.http

Run order: 01-health → 02-auth → tool files → 12-python-workers-direct

All Python workers at once: Services/start-all-workers.bat (see Services/00-README.txt)

Red errors in sidebar? Select "dev" env + reload window. See .vscode/settings.json at repo root.
