# IMusic — Android APK build (Hindi)

यह पैकेज मौजूदा React + TypeScript IMusic ऐप को Capacitor Android wrapper में पैक करने के लिए तैयार किया गया है। APK को GitHub Actions से बनाया जा सकता है।

## मोबाइल से APK बनाने का तरीका

1. इस ZIP को अपने फोन के File Manager में Extract करें।
2. GitHub पर एक नया **Public या Private repository** बनाएं।
3. Extract किए गए प्रोजेक्ट की **सभी फाइलें और hidden `.github` folder** repository के root में upload करें। ZIP फाइल को अकेले upload न करें।
4. GitHub repository में **Actions** tab खोलें। अगर GitHub workflow enable करने को कहे, तो enable करें।
5. **Build IMusic Android APK** workflow चुनें और **Run workflow** दबाएं।
6. Build सफल होने पर उसी workflow run के नीचे **Artifacts** में `IMusic-debug-APK` मिलेगा। उसे डाउनलोड करके ZIP extract करें; उसके अंदर `app-debug.apk` होगा।
7. APK फोन में install करें। Android unknown-app install permission मांगे तो केवल अपने बनाए हुए APK के लिए अनुमति दें।

## क्या शामिल है

- मौजूदा React/Vite ऐप
- Capacitor Android configuration
- GitHub Actions workflow जो Android project generate करके debug APK compile करता है
- Android audio read permission declarations (Android version के अनुसार)

## जरूरी सीमाएं — कृपया पढ़ें

- यह build मौजूदा वेब UI को Android APK में पैक करता है। यह अपने-आप Kotlin demo snippets को native implementation में नहीं बदलता।
- इस ZIP में मौजूद `src/data/androidKotlinCode.ts` के Kotlin code snippets reference/demo code हैं; वे सक्रिय Android MediaStore scanner या Media3 background playback service के रूप में wired नहीं हैं।
- इसलिए local music scan, true background playback, lock-screen controls और hardware equalizer को अभी पूर्ण Native features न मानें। इनके लिए अलग native plugin/bridge implementation और testing चाहिए।
- Gemini/API server code APK के अंदर server की तरह नहीं चलता। AI सुविधा के लिए सुरक्षित hosted backend और server-side API key configuration जरूरी है। API key को GitHub repository या APK में hard-code न करें।
- यह workflow **debug APK** बनाता है, Play Store release-signed APK/AAB नहीं।
- GitHub Actions build चलाने के लिए GitHub account और Actions minutes/limits लागू होंगे।

## Technical

- App ID: `com.imusic.player`
- App name: `IMusic`
- Web build folder: `dist`
- Output: `android/app/build/outputs/apk/debug/app-debug.apk`
