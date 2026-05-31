Dev Hube — Flutter app (GetX)
================================

Same branding as the web (dark aurora, logo, Backend API).

APP ICON (fevicon.png)
----------------------
Icons generated for Android, iOS, Web, Windows, macOS.
To regenerate after changing assets/fevicon.png:
  dart run flutter_launcher_icons

SETUP (first time)
------------------
1. Install Flutter SDK: https://docs.flutter.dev/get-started/install

2. In this folder (Application):

   flutter create . --project-name dev_hube

   flutter pub get

3. Backend must be running:

   cd ..\Backend
   pnpm start:dev

4. API URL in app (Settings tab):
   - Android emulator: http://10.0.2.2:4000/api/v1
   - iOS simulator / Windows desktop: http://127.0.0.1:4000/api/v1
   - Physical phone: http://YOUR_PC_LAN_IP:4000/api/v1

5. Run:

   flutter run

   (pick Chrome / Windows / Android / iOS)

ANDROID — allow HTTP to local Backend
-------------------------------------
After flutter create, edit android/app/src/main/AndroidManifest.xml
inside <application add:

   android:usesCleartextTraffic="true"

STRUCTURE (simple)
------------------
lib/
  main.dart, app.dart
  core/          theme, colors, routes
  data/          API, models, services, tool_config
  bindings/      GetX bindings
  modules/       home, tools, blog, settings, tool, shell
  widgets/       cards, buttons, logo

ONBOARDING (first install only)
-------------------------------
5 intro screens (Skip / Next / Get started). Shown once; stored in GetStorage.
Settings -> Show intro again to replay.

FEATURES
--------
- Home: hero + trending tools (API Tester first)
- Tools: search, categories, full catalog from Backend
- Blog: tool articles from /site/tool-blogs
- Settings: API base URL
- Native tools: Base64, JSON, JWT, UUID, API tester, password, etc.
- PDF / temp-mail / AI / media: open web tool in WebView or browser

No Admin panel in this app.
